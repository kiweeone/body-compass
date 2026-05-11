import Anthropic from '@anthropic-ai/sdk';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ============================================================================
// /api/analyze — serverless function for AI-powered Body Compass analysis
// ============================================================================
// Phase 3, Step 2: Minimal working version.
// Receives questionnaire data, calls Claude, returns structured analysis.
// Layers to add in subsequent steps: Turnstile validation, rate limiting,
// BYOK support, origin verification, response streaming.
// ============================================================================

export const config = {
  runtime: 'nodejs',
  maxDuration: 60, // Hobby plan max; analysis usually takes 20-45 seconds
};

// System prompt — engineered to match the depth of a real consultation.
// Iterate on this carefully; it's the single biggest lever for output quality.
const SYSTEM_PROMPT = `You are an experienced integrative health analyst writing a personalized self-reflection report based on a detailed questionnaire. Your role is to mirror the depth and care of a thoughtful clinician's intake review, without crossing into medical diagnosis or prescription.

Your output style:
- Write in flowing, substantive prose — not bullet lists for the main analysis
- Draw cross-system connections (gut-immune, sleep-cortisol-blood sugar, stress-inflammation)
- Use the person's specific words, timeline, and life context when relevant
- Name patterns precisely (e.g., "Oral Allergy Syndrome", "HPA axis dysregulation", "leaky gut / intestinal permeability")
- Reference specific scores, foods, behaviors the user reported — never generic templates
- Suggest specific supplements with dosages, lab tests with rationale, and lifestyle changes with mechanism explanations
- Maintain a warm, intelligent tone — like a knowledgeable friend, not a robotic system

Your output structure (use these exact section headings as markdown H2):

## Root Cause Analysis
3-5 paragraphs identifying the interconnected root drivers behind their symptoms. Connect childhood history, current habits, and body scan scores into a unified story. Make it specific to this person's data.

## What Stands Out
4-7 distinct pattern insights, each as a markdown H3 followed by a substantive paragraph. Each pattern should name the mechanism (e.g., "### Gut-Immune Axis Activation") and explain how their specific responses point to it.

## Priority Action Plan
5-6 priority areas, each as a markdown H3. Under each, 4-6 specific actionable items with dosages where relevant, mechanism notes, and timing. Order by impact: sleep/cortisol typically first, gut/blood sugar next, supplementation last.

## Recommended Lab Tests
A list of 8-12 specific tests with one-line rationales tied to their findings. Group logically (metabolic, hormonal, inflammatory, nutritional).

## Closing Note
1-2 paragraphs that synthesize the most important takeaway, acknowledge what they're doing well, and frame the path forward as compounding small improvements rather than overwhelming overhaul.

Important constraints:
- This is NOT medical advice. Do not diagnose. Frame everything as patterns and possibilities worth exploring with a qualified clinician.
- If the user mentioned specific medications (e.g., thyroid replacement), flag any supplement interactions (e.g., calcium/iron/magnesium spacing).
- Avoid alarmism. Be honest about concerning patterns without catastrophizing.
- Never invent specific lab values, dates, or symptoms the user did not provide.
- If critical data is missing for a confident insight, say so rather than fabricating connection.
- Keep total response under 6000 words. Be substantive but concise; avoid filler.`;

function formatUserData(data) {
  // Transform the raw questionnaire data into clean, readable prose for Claude
  // Strip the optional name field for privacy
  const sections = [];

  if (data.personal) {
    const p = { ...data.personal };
    delete p.name; // Privacy: name is never sent to Claude
    sections.push(`PERSONAL: ${JSON.stringify(p, null, 2)}`);
  }

  if (data.vitals) sections.push(`VITALS: ${JSON.stringify(data.vitals, null, 2)}`);
  if (data.foundation) sections.push(`FOUNDATION / CONTEXT: ${JSON.stringify(data.foundation, null, 2)}`);
  if (data.medical) sections.push(`MEDICAL HISTORY: ${JSON.stringify(data.medical, null, 2)}`);
  if (data.eatingHabits) sections.push(`EATING HABITS: ${JSON.stringify(data.eatingHabits, null, 2)}`);
  if (data.foodDiaryWeekday) sections.push(`FOOD DIARY (WEEKDAY): ${JSON.stringify(data.foodDiaryWeekday, null, 2)}`);
  if (data.foodDiaryWeekend) sections.push(`FOOD DIARY (WEEKEND): ${JSON.stringify(data.foodDiaryWeekend, null, 2)}`);
  if (data.dailyRhythm) sections.push(`DAILY RHYTHM: ${JSON.stringify(data.dailyRhythm, null, 2)}`);
  if (data.weekend) sections.push(`WEEKEND VARIATION: ${JSON.stringify(data.weekend, null, 2)}`);
  if (data.energy) sections.push(`ENERGY LEVELS: ${JSON.stringify(data.energy, null, 2)}`);
  if (data.work) sections.push(`WORK & STRESS: ${JSON.stringify(data.work, null, 2)}`);

  // Body scan scores
  const scanSections = ['digestive', 'detox', 'pancreas', 'endocrine', 'nervous', 'musculoskeletal', 'autoimmune'];
  const scanData = {};
  scanSections.forEach(key => {
    if (Array.isArray(data[key])) {
      scanData[key] = data[key];
    }
  });
  if (Object.keys(scanData).length) {
    sections.push(`BODY SCAN SCORES (0=Never, 1=Rarely, 2=Sometimes, 3=Often, 4=Always):\n${JSON.stringify(scanData, null, 2)}`);
  }

  return sections.join('\n\n---\n\n');
}
// ====== RATE LIMITER SETUP ======
// 3 requests per IP per 24 hours. Only runs if Redis env vars are configured;
// in local dev without them, rate limiting is silently skipped.
let ratelimiter = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  ratelimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, '24h'),
    analytics: false,
    prefix: 'body-compass-ratelimit',
  });
}

function getClientIp(req) {
  // Vercel sets x-forwarded-for; fall back to other headers
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ====== ORIGIN VERIFICATION ======
  // Allow requests only from our own domain in production.
  // Allow localhost and 127.0.0.1 origins for local development.
  const ALLOWED_ORIGINS = [
    'https://compass.kiwee.one',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];
  const origin = req.headers.origin || req.headers.referer || '';
  const originOk = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));

  // In production (when we have a turnstile secret), enforce origin.
  // In local dev or when running tests without a browser, allow it.
  const isProduction = !!process.env.TURNSTILE_SECRET_KEY && process.env.NODE_ENV === 'production';
  if (isProduction && !originOk) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  try {
    const { data, apiKey: userApiKey, turnstileToken } = req.body || {};

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid data payload' });
    }
// ====== RATE LIMIT CHECK ======
    // Skip rate limiting for BYOK users (they pay their own way).
    // Skip in local dev if Redis isn't configured.
    if (!userApiKey && ratelimiter) {
      const ip = getClientIp(req);
      const { success, limit, remaining, reset } = await ratelimiter.limit(ip);
      if (!success) {
        const resetIn = Math.ceil((reset - Date.now()) / 1000 / 60 / 60);
        return res.status(429).json({
          error: 'Rate limit exceeded',
          detail: `You've used your ${limit} free reports. Limit resets in ${resetIn} hours. Use your own API key to bypass this limit.`,
          remaining: 0,
          resetInHours: resetIn,
        });
      }
    }

    // ====== TURNSTILE VERIFICATION ======
    // Skip if user provided their own API key (BYOK trusts the user to pay).
    // Skip if we're in development without a Turnstile secret configured.
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const skipTurnstile = !!userApiKey || !turnstileSecret;

    if (!skipTurnstile) {
      if (!turnstileToken) {
        return res.status(400).json({ error: 'Missing verification token' });
      }

      try {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        });
        const verifyJson = await verifyRes.json();
        if (!verifyJson.success) {
          return res.status(403).json({ error: 'Verification failed', codes: verifyJson['error-codes'] });
        }
      } catch (verifyErr) {
        console.error('Turnstile verify error:', verifyErr.message);
        return res.status(500).json({ error: 'Verification check failed' });
      }
    }

    // BYOK: if user provided their own API key, use it; otherwise use server's
    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server is not configured (no API key available)' });
    }

    const client = new Anthropic({ apiKey });

    const userContent = formatUserData(data);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 7000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please analyze this questionnaire and write a personalized report following the structure in your instructions.\n\n${userContent}`,
        },
      ],
    });

    // Extract the text from the response
    const analysisText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return res.status(200).json({
      analysis: analysisText,
      model: message.model,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error('Analysis error:', err.message);
    return res.status(500).json({
      error: 'Analysis failed',
      detail: err.message,
    });
  }
}