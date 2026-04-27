import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Download, AlertCircle, CheckCircle2, Compass, Loader2 } from 'lucide-react';

// ==========================================================================
// QUESTION BANK
// ==========================================================================

const FOUNDATION_QUESTIONS = {
  primaryConcern: { type: 'longtext', label: "What is the main reason you're taking this assessment? Describe in your own words." },
  symptomTimeline: { type: 'longtext', label: "When did you first notice these issues? Was there a specific event, life change, or illness around that time?" },
  previousAttempts: { type: 'longtext', label: "What have you tried before to address these issues? (diets, programs, supplements, therapies, doctors)" },
  stressContext: { type: 'longtext', label: "What are the biggest sources of stress in your life right now? (work, relationships, financial, health, other)" },
  childhoodHealth: {
    type: 'select',
    label: "How would you describe your childhood health?",
    options: ['Very healthy, rarely sick', 'Average', 'Frequently sick / multiple illnesses', 'Chronic condition(s) since childhood'],
  },
  childhoodAntibiotics: {
    type: 'select',
    label: "How often did you take antibiotics as a child (under 16)?",
    options: ['Rarely or never', 'Occasionally (1–3 courses total)', 'Several times (4–10 courses)', 'Frequently (more than 10 courses)'],
  },
  recentAntibiotics: {
    type: 'select',
    label: "When did you last take antibiotics?",
    options: ['Within last 6 months', '6–24 months ago', '2–5 years ago', 'More than 5 years ago', 'Never as an adult'],
  },
  surgicalHistory: { type: 'longtext', label: "List any surgeries or hospitalizations and their approximate dates." },
  familyAtopic: {
    type: 'multiselect',
    label: "Family history of atopic conditions (parents, siblings, grandparents). Select all that apply.",
    options: ['Asthma', 'Hay fever / allergic rhinitis', 'Eczema', 'Food allergies', 'Anaphylaxis', 'None known'],
  },
  familyChronic: {
    type: 'multiselect',
    label: "Family history of chronic conditions. Select all that apply.",
    options: ['Heart disease', 'Type 2 diabetes', 'Autoimmune disease', 'Cancer', 'Thyroid disease', 'Mental health conditions', 'None known'],
  },
  smokingStatus: {
    type: 'select',
    label: "Smoking / nicotine status:",
    options: ['Never smoked', 'Former smoker', 'Occasional', 'Daily smoker / vaper'],
  },
  emotionalBaseline: {
    type: 'select',
    label: "How would you describe your overall emotional state lately?",
    options: ['Stable and content', 'Generally okay with ups and downs', 'Frequently anxious or low', 'Persistently struggling', 'In crisis'],
  },
};

// MEDICAL HISTORY now includes weight history (NEW)
const MEDICAL_QUESTIONS = {
  conditions: { type: 'longtext', label: "Diagnosed conditions and surgeries (with dates if known)" },
  meds: { type: 'longtext', label: "Current medications and supplements (include doses, frequency, how long you've been taking them)" },
  allergies: { type: 'longtext', label: "Known allergies (foods, medications, environmental, severity)" },
  weightHistory: { type: 'longtext', label: "Weight history — has your weight been stable, or have you experienced significant changes? Describe any major fluctuations, when they happened, and what was going on in your life at the time." },
  weightTrend: {
    type: 'select',
    label: "Which best describes your recent weight trend?",
    options: ['Stable for years', 'Slowly increasing', 'Recent rapid increase', 'Slowly decreasing', 'Recent rapid decrease', 'Yo-yo / fluctuating'],
  },
};

// EATING HABITS — added cookware, fillings, dental hygiene questions (NEW)
const EATING_HABITS_QUESTIONS = {
  favoriteFoods: { type: 'longtext', label: "What are your favorite foods? Be specific — list the dishes, brands, or cuisines you reach for." },
  cravedFoods: { type: 'longtext', label: "What foods do you crave? When and why do you think these cravings happen?" },
  hardestToGiveUp: { type: 'longtext', label: "Which foods would be hardest to give up if a doctor recommended it?" },
  dislikedFoods: { type: 'longtext', label: "Are there foods you actively dislike or avoid? Any reason behind it?" },
  suspectedTriggers: { type: 'longtext', label: "Are there any foods you suspect don't agree with you, even if you haven't been formally diagnosed?" },
  recentDietChanges: { type: 'longtext', label: "Have you changed how you eat recently? More carbs, bigger portions, intermittent fasting, anything else?" },
  hydration: {
    type: 'select',
    label: "Daily water intake:",
    options: ['Less than 0.5L', '0.5–1L', '1–2L', '2–3L', 'More than 3L'],
  },
  caffeine: {
    type: 'select',
    label: "Daily caffeine intake (coffee, tea, energy drinks):",
    options: ['None', '1 cup', '2–3 cups', '4+ cups'],
  },
  alcohol: {
    type: 'select',
    label: "Alcohol consumption:",
    options: ['Never', 'Rarely (special occasions)', 'Weekly (1–3 drinks)', 'Several times per week', 'Daily'],
  },
  fizzyDrinks: {
    type: 'select',
    label: "Fizzy / soft drinks:",
    options: ['Never', 'Rarely', 'Weekly', 'Daily'],
  },
  organicPercent: {
    type: 'select',
    label: "Approximately what percentage of your food is organic / bio-sourced?",
    options: ['Almost none', 'About 25%', 'About 50%', 'About 75%', 'Almost all'],
  },
  highHeatCooking: {
    type: 'select',
    label: "How often do you eat grilled, barbecued, or high-temperature fried food?",
    options: ['Rarely or never', 'Occasionally', 'Weekly', 'Several times per week', 'Daily'],
  },
  oilyFish: {
    type: 'select',
    label: "How often do you eat oily fish (salmon, mackerel, sardines, anchovy)?",
    options: ['Never', 'Monthly', 'Weekly', '2–3x per week', 'More than 3x per week'],
  },
  artificialSweeteners: {
    type: 'select',
    label: "Artificial sweeteners (diet drinks, sugar-free gum, packaged 'sugar-free' products):",
    options: ['Never use', 'Rarely', 'Sometimes', 'Daily'],
  },
  // NEW questions below
  cookwareTypes: {
    type: 'multiselect',
    label: "Which materials do you regularly cook with or store food in? (select all that apply)",
    options: ['Stainless steel', 'Cast iron', 'Aluminum / aluminium foil', 'Non-stick (Teflon)', 'Ceramic / enamel', 'Plastic containers (heated/microwaved)', 'Plastic containers (cold storage only)', 'Glass'],
  },
  plasticHeating: {
    type: 'select',
    label: "Do you reheat or microwave food in plastic containers?",
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Daily'],
  },
  amalgamFillings: {
    type: 'select',
    label: "Do you have amalgam (silver/mercury) dental fillings?",
    options: ['No, never had any', 'No, all removed', 'Yes, a few (1–3)', 'Yes, several (4+)', 'Not sure'],
  },
  dentalHygiene: {
    type: 'select',
    label: "How often do you floss?",
    options: ['Daily', 'Several times per week', 'Weekly', 'Rarely', 'Never'],
  },
  oralHealth: {
    type: 'select',
    label: "How would you describe your oral health overall?",
    options: ['Excellent — no issues', 'Good with regular checkups', 'Some concerns (gum sensitivity, occasional bleeding)', 'Active issues (gum disease, frequent cavities)', "Haven't seen a dentist in years"],
  },
  eatingSpeed: {
    type: 'select',
    label: "How fast do you typically eat?",
    options: ['Slow and mindful', 'Average pace', 'Fast — finish before others', 'Very fast — barely chew'],
  },
  mealRegularity: {
    type: 'select',
    label: "How regular are your meal times?",
    options: ['Same times every day', 'Roughly consistent', 'Irregular — depends on day', 'Chaotic — often skip meals'],
  },
  bowelFrequency: {
    type: 'select',
    label: "Bowel movement frequency:",
    options: ['3+ times per day', '1–2 times daily', 'Every other day', 'Less than 3x per week', 'Highly variable'],
  },
};

// FOOD DIARY — restructured for two days (NEW)
const FOOD_DIARY_WEEKDAY = {
  weekdayBreakfast: { type: 'longtext', label: "Typical weekday breakfast — describe what you eat and the time. If you skip, write that and what you do instead (coffee only, etc.)." },
  weekdayLunch: { type: 'longtext', label: "Typical weekday lunch — what, where (home/canteen/takeout/restaurant), and time." },
  weekdayDinner: { type: 'longtext', label: "Typical weekday dinner — what, where, and time." },
  weekdaySnacks: { type: 'longtext', label: "Weekday snacks — what do you reach for between meals, and roughly when?" },
  weekdayDrinks: { type: 'longtext', label: "Weekday beverages — water, tea, coffee, juice, soda, alcohol. Approximate quantities." },
};

const FOOD_DIARY_WEEKEND = {
  weekendBreakfast: { type: 'longtext', label: "Typical weekend breakfast/brunch — what, where, and time. Differences from weekdays?" },
  weekendLunch: { type: 'longtext', label: "Typical weekend lunch — restaurant meals, home cooking, brunch, etc." },
  weekendDinner: { type: 'longtext', label: "Typical weekend dinner — what, where, and time." },
  weekendSnacks: { type: 'longtext', label: "Weekend snacks — what do you reach for? More indulgent, more or less than weekdays?" },
  weekendDrinks: { type: 'longtext', label: "Weekend beverages — including alcohol if you drink. Quantities matter." },
};

const DAILY_RHYTHM_QUESTIONS = {
  wakeTime: {
    type: 'select',
    label: "Typical weekday wake time:",
    options: ['Before 06:00', '06:00–07:00', '07:00–08:00', '08:00–09:00', '09:00–10:00', 'After 10:00'],
  },
  bedtime: {
    type: 'select',
    label: "Typical weekday bedtime:",
    options: ['Before 22:00', '22:00–23:00', '23:00–00:00', '00:00–01:30', 'After 01:30'],
  },
  fallAsleepTime: {
    type: 'select',
    label: "How long does it usually take you to fall asleep?",
    options: ['Within 10 minutes', '10–20 minutes', '20–40 minutes', 'Over 40 minutes', 'Highly variable'],
  },
  sleepHours: {
    type: 'select',
    label: "Average hours of sleep per night:",
    options: ['Less than 5', '5–6', '6–7', '7–8', '8–9', 'More than 9'],
  },
  sleepQuality: {
    type: 'select',
    label: "How would you rate your sleep quality?",
    options: ['Refreshing, deep', 'Generally good', 'Fragmented but okay', 'Restless / poor', 'Severe insomnia'],
  },
  nightWakings: {
    type: 'select',
    label: "Do you wake during the night?",
    options: ['Never', 'Occasionally', 'Most nights — once', 'Most nights — multiple times'],
  },
  workStart: {
    type: 'select',
    label: "What time does your work day start?",
    options: ['Before 08:00', '08:00–09:00', '09:00–10:00', 'After 10:00', 'No fixed start (flexible / not working)'],
  },
  exerciseFrequency: {
    type: 'select',
    label: "Exercise frequency:",
    options: ['Sedentary', 'Light activity 1–2x/week', 'Moderate 3–4x/week', 'Vigorous 5+x/week', 'Athlete-level training'],
  },
  exerciseType: { type: 'longtext', label: "What kind of exercise do you do? (swimming, gym, cycling, sports, walking, etc.)" },
  exerciseTiming: {
    type: 'select',
    label: "When during the day do you usually train?",
    options: ['Morning (before 10:00)', 'Midday (10:00–14:00)', 'Afternoon (14:00–18:00)', 'Evening (18:00–21:00)', 'Late evening (after 21:00)', "Doesn't apply"],
  },
  eveningRoutine: { type: 'longtext', label: "What does your evening look like between work ending and sleep? (TV, reading, phone, friends, going out)" },
  screensBeforeBed: {
    type: 'select',
    label: "Screen time in the hour before bed:",
    options: ['No screens', 'A few minutes', 'Up to an hour', 'More than an hour, right up until sleep'],
  },
  stressPractice: {
    type: 'select',
    label: "Do you have any daily practice for managing stress?",
    options: ['Yes — regular practice (meditation, breathwork, yoga, journaling)', 'Sometimes', 'Rarely', 'No practice'],
  },
};

const WEEKEND_QUESTIONS = {
  weekendWakeTime: {
    type: 'select',
    label: "Typical weekend wake time:",
    options: ['Before 07:00', '07:00–08:00', '08:00–09:00', '09:00–10:00', '10:00–11:00', 'After 11:00'],
  },
  weekendBedtime: {
    type: 'select',
    label: "Typical weekend bedtime:",
    options: ['Before 22:00', '22:00–23:00', '23:00–00:00', '00:00–02:00', 'After 02:00'],
  },
  weekendActivities: { type: 'longtext', label: "How do you typically spend weekends? Hobbies, social, rest, work?" },
  weekendMood: {
    type: 'select',
    label: "How does your mood typically shift on weekends compared to weekdays?",
    options: ['Much better — clear contrast', 'Somewhat better', 'About the same', 'Worse — Sunday dread or restless', "Doesn't really apply"],
  },
};

const ENERGY_QUESTIONS = {
  needLongSleep: { type: 'yesno', label: "Do you need more than 8 hours of sleep to feel okay?" },
  lowEnergyOverall: { type: 'yesno', label: "Is your energy lower than you would like?" },
  hardToGetUp: { type: 'yesno', label: "Is it hard to get out of bed in the morning?" },
  daytimeSleepy: { type: 'yesno', label: "Do you feel sleepy or drowsy during the day?" },
  hangerDizzy: { type: 'yesno', label: "Do you feel dizzy, irritable, or shaky if you don't eat for a few hours?" },
  caffeineDependent: { type: 'yesno', label: "Do you rely on caffeine, sugar, or nicotine to get through the day?" },
  concentrationIssues: { type: 'yesno', label: "Is it hard to concentrate?" },
  dizzyOnStanding: { type: 'yesno', label: "Do you get dizzy if you stand up quickly?" },
  unexplainedExhaustion: { type: 'yesno', label: "Do you experience unexplained exhaustion or general weakness?" },
  energyDipTime: {
    type: 'select',
    label: "What time of day are you usually least energetic?",
    options: ['Morning (just after waking)', 'Late morning (10:00–12:00)', 'Midday (around noon)', 'Afternoon (14:00–16:00)', 'Evening', 'Variable'],
  },
};

const WORK_QUESTIONS = {
  workEnvironment: {
    type: 'select',
    label: "Work environment:",
    options: ['High-stress / high-stakes', 'Moderate stress, manageable', 'Low stress', 'Variable / project-based', 'Not currently working'],
  },
  workHours: {
    type: 'select',
    label: "Typical hours per work day:",
    options: ['Under 6', '6–8', '8–10', '10–12', 'More than 12', "Doesn't apply"],
  },
  remoteOrOffice: {
    type: 'select',
    label: "Where do you work?",
    options: ['Fully remote', 'Hybrid', 'Office / on-site', 'Travel-heavy', "Doesn't apply"],
  },
  screenTime: {
    type: 'select',
    label: "Total daily screen time (work + personal combined):",
    options: ['Under 4 hours', '4–6 hours', '6–8 hours', '8–10 hours', 'More than 10 hours'],
  },
  workStressors: { type: 'longtext', label: "What aspects of your work create the most stress? Deadlines, people, ambiguity, financial pressure, after-hours demands?" },
  jobSatisfaction: {
    type: 'select',
    label: "Overall, how satisfied are you with your work?",
    options: ['Very satisfied', 'Mostly satisfied', 'Mixed', 'Mostly dissatisfied', 'Actively unhappy'],
  },
  recoveryAfterWork: {
    type: 'select',
    label: "How well do you actually disconnect from work after hours?",
    options: ['Cleanly — work stays at work', 'Mostly disconnect', 'Often thinking about it', 'Constantly connected / checking', "Doesn't apply"],
  },
};

const SCAN_SECTIONS = {
  digestive: {
    title: 'Digestive System',
    description: 'Issues with digestion, gut, bowel function',
    questions: [
      'Belly bloating after eating',
      'Diarrhea or watery stools that are hard to control',
      'Constipation lasting over 24 hours, or hard pellet-like stools',
      'Alternating diarrhea and constipation',
      'Heartburn or acid reflux, especially after long fasts or in the evening',
      'White, yellow, or brown tongue coating, or chronic bad breath despite good hygiene',
      'Stomach pain or nausea after eating',
      'Gas, bloating, or diarrhea triggered by emotional stress',
    ],
  },
  detox: {
    title: 'Detoxification & Liver',
    description: 'Liver function, fluid balance, elimination',
    questions: [
      'Water retention — pressing your shin leaves a finger indent',
      'Weight fluctuates more than 3kg between morning and evening, or within two days',
      'History of Lyme disease, mono, or chronic viral infections',
      'A general feeling of toxicity even without specific symptoms',
      'Yellow tint to skin or whites of the eyes',
      'Sensitivity in the upper right abdomen, sometimes radiating to back or shoulder',
      'Urine usually dark yellow despite drinking water',
      'Unexplained itching, dry skin, or rashes on hands and feet',
    ],
  },
  pancreas: {
    title: 'Blood Sugar & Pancreas',
    description: 'Glucose regulation, insulin sensitivity',
    questions: [
      'Cravings for sweets or starches even when you feel full',
      'Increased appetite or thirst',
      'Blurry vision without clear cause',
      'Unusual tiredness even after sleep, that improves after eating',
      'Dizzy, irritable, or "hangry" when you go a few hours without food',
      'Waist circumference roughly equal to or larger than hip circumference',
      'Difficulty losing weight despite caloric deficit or training',
      'Fasting glucose ≥100 mg/dL, HbA1c ≥5.7, or any pre-diabetes/diabetes diagnosis',
    ],
  },
  endocrine: {
    title: 'Hormones & Adrenal',
    description: 'Thyroid, adrenals, sex hormones',
    questions: [
      'Afternoon fatigue or headaches that return in the evening',
      'Dizzy when standing quickly, or strong cravings for salty foods',
      'Cold hands and feet even when you are warm overall',
      'Sleeping more than 8 hours and still feeling exhausted',
      'Outer third of your eyebrows has thinned or disappeared',
      'Loss of sexual desire or low libido',
    ],
  },
  nervous: {
    title: 'Nervous System & Cognition',
    description: 'Mental clarity, mood, focus',
    questions: [
      'More absent-minded than usual — losing things, forgetting words',
      'Feeling depressed without clear cause, loss of motivation',
      'Anxiety, worry, or panic attacks more than normal for you',
      'Brain fog — difficulty concentrating or focusing',
      'Frequent mood swings',
      'Saying wrong words or calling things by wrong names',
      'Sensory sensitivity — bothered by sounds, light, or touch',
      'Family history of dementia, or noticed cognitive changes in yourself',
    ],
  },
  musculoskeletal: {
    title: 'Musculoskeletal',
    description: 'Joints, muscles, connective tissue',
    questions: [
      'Joint pain, periodic or constant, with or without injury',
      'Hypermobility — joints that bend further than normal',
      'Frequently twisting ankles, tripping, or dropping things',
      'Considered clumsy, frequent tendon or ligament injuries',
      'Clicking or popping from joints when moving',
      'Waking with joint stiffness or muscle pain',
      'Pain that improves with movement but returns in the evening',
      'Chronic neck or back pain, or constant tension',
      'Pins and needles, stabbing pains, or numbness in hands or feet',
      'Pain in hands, feet, or pelvic muscles during massage',
    ],
  },
  autoimmune: {
    title: 'Inflammation & Allergies',
    description: 'Immune response, allergic reactions, autoimmunity',
    questions: [
      'Reactions after foods — bloating, gas, rash, brain fog, panic',
      'Cold or heat intolerance, hands turning blue, dry eyes/mouth/skin',
      'Family member diagnosed with autoimmune disease (RA, lupus, MS, celiac, Crohn, Hashimoto)',
      'Pain or numbness in joints/limbs bilaterally (same place both sides)',
      'Unexplained rashes, chronic acne, or recurring boils',
      'Extreme persistent fatigue not relieved by sleep, food, or supplements',
      'Unexplained muscle weakness, foot dragging, or dropping things',
      'Symptoms come in episodes — strong flares, then quiet for weeks or months',
    ],
  },
};

// ==========================================================================
// SCORING + ANALYSIS ENGINE
// ==========================================================================

function calculateLevel(score, max) {
  const pct = (score / max) * 100;
  if (pct > 50) return { level: 'High', pct, color: '#B45353' };
  if (pct > 35) return { level: 'Elevated', pct, color: '#C97D3F' };
  if (pct > 20) return { level: 'Moderate', pct, color: '#D4A847' };
  return { level: 'Low', pct, color: '#7A9B7E' };
}

function countYes(obj, keys) {
  return keys.filter(k => obj[k] === 'Yes').length;
}

function isLateBedtime(bedtime) {
  return ['00:00–01:30', 'After 01:30', '00:00–02:00', 'After 02:00'].includes(bedtime);
}

function isShortSleep(sleepHours) {
  return ['Less than 5', '5–6', '6–7'].includes(sleepHours);
}

function generateInsights(data) {
  const insights = [];
  const flags = [];

  const scores = {};
  Object.keys(SCAN_SECTIONS).forEach(key => {
    const answers = data[key] || [];
    const score = answers.reduce((sum, v) => sum + (Number(v) || 0), 0);
    const max = SCAN_SECTIONS[key].questions.length * 4;
    scores[key] = { score, max, ...calculateLevel(score, max) };
  });

  const f = data.foundation || {};
  const m = data.medical || {};
  const e = data.eatingHabits || {};
  const fdwd = data.foodDiaryWeekday || {};
  const fdwe = data.foodDiaryWeekend || {};
  const r = data.dailyRhythm || {};
  const w = data.weekend || {};
  const en = data.energy || {};
  const wk = data.work || {};

  if (scores.digestive?.pct > 35 && scores.autoimmune?.pct > 25) {
    insights.push({
      title: 'Gut-Immune Axis Activation',
      body: 'Your digestive and inflammatory scores together suggest the gut barrier and immune system are interacting in a way that amplifies both. When intestinal permeability rises, undigested food particles and bacterial fragments can reach the bloodstream, triggering immune reactions. This pattern often presents as food sensitivities, seasonal allergy worsening, and skin issues alongside digestive symptoms.',
    });
  }

  const heavyAntibiotics = ['Frequently (more than 10 courses)', 'Several times (4–10 courses)'].includes(f.childhoodAntibiotics);
  if (heavyAntibiotics && (scores.digestive?.pct > 25 || scores.autoimmune?.pct > 25)) {
    insights.push({
      title: 'Microbiome History Significant',
      body: 'Heavy antibiotic exposure during childhood often disrupts the developing microbiome during a critical immune-tolerance window. Combined with your current digestive or inflammatory patterns, this points to a microbiome that may benefit from focused rebuilding — diverse fiber sources, fermented foods, targeted probiotics, and reducing further microbial stressors.',
    });
  }

  // Blood sugar pattern — now uses both weekday and weekend diary
  const skipsBreakfastWeekday = fdwd.weekdayBreakfast && /skip|rarely|never|no breakfast|don't|nothing/i.test(fdwd.weekdayBreakfast);
  const lateDinnerWeekday = fdwd.weekdayDinner && /(20|21|22|23):/.test(fdwd.weekdayDinner);
  const lateDinnerWeekend = fdwe.weekendDinner && /(20|21|22|23):/.test(fdwe.weekendDinner);
  const sugaryDrinks = (fdwd.weekdayDrinks && /(juice|soda|cola|coke|fizzy|sprite|fanta|sweet)/i.test(fdwd.weekdayDrinks)) ||
                       (fdwe.weekendDrinks && /(juice|soda|cola|coke|fizzy|sprite|fanta|sweet)/i.test(fdwe.weekendDrinks));
  const carbCravings = e.cravedFoods && /(bread|pasta|pizza|sweet|chocolate|sugar|cake|crackers|chips|cookies|carb)/i.test(e.cravedFoods);

  if (scores.pancreas?.pct > 30 || (skipsBreakfastWeekday && lateDinnerWeekday) || (sugaryDrinks && carbCravings)) {
    let body = 'Your body is having trouble keeping glucose stable between meals. ';
    const triggers = [];
    if (skipsBreakfastWeekday) triggers.push('skipping breakfast on weekdays lets cortisol run unchecked all morning');
    if (lateDinnerWeekday) triggers.push('late weekday dinner timing disrupts overnight metabolic recovery');
    if (sugaryDrinks) triggers.push('liquid sugar (juice, soda) spikes glucose without fiber to slow absorption');
    if (carbCravings) triggers.push('carb cravings are often a downstream signal of the rollercoaster, not a separate problem');
    if (triggers.length) body += 'Specifically, ' + triggers.join('; ') + '. ';
    body += 'Stabilizing this typically starts with protein and fat at breakfast within an hour of waking, eating within consistent windows, and replacing liquid sugar with whole foods.';

    insights.push({ title: 'Blood Sugar Dysregulation', body });
  }

  // Cortisol pattern
  const lateBed = isLateBedtime(r.bedtime);
  const shortSleep = isShortSleep(r.sleepHours);
  const poorSleep = ['Restless / poor', 'Severe insomnia'].includes(r.sleepQuality);
  const highStress = ['Frequently anxious or low', 'Persistently struggling'].includes(f.emotionalBaseline);
  const screensLate = ['More than an hour, right up until sleep'].includes(r.screensBeforeBed);
  const noStressPractice = r.stressPractice === 'No practice';
  const lateExercise = ['Late evening (after 21:00)'].includes(r.exerciseTiming);

  if (lateBed || poorSleep || highStress || scores.endocrine?.pct > 30 || screensLate) {
    let body = 'Late bedtimes, fragmented sleep, and persistent stress all push the body into a sympathetic-dominant state where cortisol stays elevated when it should drop. This drives visceral fat storage, blood sugar instability, suppressed thyroid function, and reduced sex hormone production. ';
    const factors = [];
    if (lateBed) factors.push('your bedtime falls past midnight, missing the natural cortisol reset window of 22:00–00:00');
    if (shortSleep) factors.push('total sleep duration is below restorative levels');
    if (screensLate) factors.push('screens until sleep suppress melatonin and prolong cortisol activity');
    if (lateExercise) factors.push('exercising after 21:00 raises cortisol exactly when it should be falling');
    if (noStressPractice) factors.push('no daily stress-discharge practice means cortisol accumulates without release');
    if (factors.length) body += 'In your case: ' + factors.join('; ') + '. ';
    body += 'The single highest-impact intervention is moving bedtime to before midnight to capture the natural cortisol reset window.';

    insights.push({ title: 'Cortisol & Recovery Stress', body });
  }

  // Atopic
  const atopic = (f.familyAtopic || []).filter(x => x !== 'None known').length > 0;
  if (atopic && scores.autoimmune?.pct > 20) {
    insights.push({
      title: 'Atopic Predisposition',
      body: 'Family history of allergic conditions plus your current inflammatory load suggests genetic atopic tendency expressing itself. This means your immune system trends toward Th2 dominance and histamine reactivity. Standard antihistamines help, but mast cell stabilization (quercetin, vitamin C) and reducing total inflammatory burden often provide better long-term control.',
    });
  }

  // OAS
  const oasFoods = /(apple|pear|peach|cherry|cherries|apricot|carrot|raw fruit|melon|kiwi|hazelnut|almond)/i;
  const cookedTolerance = /(cooked|baked|boiled|stewed|fine when|okay when)/i;
  if (e.suspectedTriggers && oasFoods.test(e.suspectedTriggers) && scores.autoimmune?.pct > 15) {
    let body = 'You mentioned reactions to specific raw fruits or vegetables. This pattern is classic for Oral Allergy Syndrome (OAS) — a cross-reactivity where pollen-allergy proteins resemble proteins in certain raw foods. ';
    if (cookedTolerance.test(e.suspectedTriggers)) {
      body += 'The fact that cooking makes them tolerable confirms it: heat denatures the cross-reactive proteins. ';
    }
    body += 'OAS itself is rarely dangerous, but it indicates an active Th2/IgE allergic axis. The same immune dysregulation often amplifies seasonal symptoms, food-related inflammation, and skin reactivity.';
    insights.push({ title: 'Oral Allergy Syndrome Pattern', body });
  }

  // Weekend contrast
  const weekendBetter = ['Much better — clear contrast', 'Somewhat better'].includes(w.weekendMood);
  const highWorkStress = ['High-stress / high-stakes'].includes(wk.workEnvironment);
  if (weekendBetter && (highWorkStress || highStress)) {
    insights.push({
      title: 'Work as Primary Stress Driver',
      body: 'A clear mood improvement on weekends, combined with high work stress, points to your work environment as a primary driver of physiological stress. This matters because most interventions (better sleep, supplements, diet) work downstream of cortisol — but if cortisol is being pumped daily by work, the upstream fix is bigger. Boundaries around after-hours connectivity, micro-recovery during the workday, and structural conversations about workload may have more impact than any supplement.',
    });
  }

  // Multi-system fatigue
  const yesCount = countYes(en, ['needLongSleep', 'lowEnergyOverall', 'hardToGetUp', 'daytimeSleepy', 'hangerDizzy', 'caffeineDependent', 'concentrationIssues', 'dizzyOnStanding', 'unexplainedExhaustion']);
  if (yesCount >= 5) {
    let body = `Your energy pattern shows ${yesCount} out of 9 fatigue indicators. This level typically reflects a combination of three things working together: blood sugar instability, sleep architecture problems, and adrenal recovery deficit. `;
    if (en.energyDipTime === 'Midday (around noon)') {
      body += 'Your noon energy dip is a classic sign of cortisol exhaustion overlapping with insufficient morning fuel — your body has burned through what it had and is asking for help. ';
    } else if (en.energyDipTime === 'Afternoon (14:00–16:00)') {
      body += 'A 14:00–16:00 dip is the textbook adrenal afternoon crash, where post-lunch insulin meets already-low cortisol. ';
    }
    body += 'Improvement here is usually compounded — fixing sleep, food timing, and stress practices simultaneously yields more than fixing them sequentially.';
    insights.push({ title: 'Multi-System Fatigue Pattern', body });
  }

  // Sleep-digestion conflict
  if (lateDinnerWeekday && lateBed && scores.digestive?.pct > 25) {
    insights.push({
      title: 'Sleep-Digestion Conflict',
      body: 'Eating late combined with late bedtime means your digestive system is working hard during the hours it should be at rest, and your body is in active digestion when sleep should be deepest. This often shows up as restless sleep, morning bloating, reflux at night, and morning fatigue despite sufficient hours. The fix is structural: leave at least three hours between dinner and sleep, or move dinner earlier rather than skipping it.',
    });
  }

  // Hypermobility pattern
  const hypermobile = (data.musculoskeletal || [])[1] >= 3;
  const chronicBackPain = (data.musculoskeletal || [])[7] >= 2;
  if (hypermobile && chronicBackPain) {
    insights.push({
      title: 'Hypermobility-Driven Pattern',
      body: 'Strong hypermobility paired with chronic neck or back pain suggests your connective tissue is naturally lax and your muscles are doing extra work to stabilize joints that lack mechanical limits. This shows up as exhaustion, episodic flares, and difficulty with strength-based interventions. Targeted stabilization work (Pilates, hypermobility-specific physical therapy), collagen support, and avoiding overstretching are usually more useful than aggressive stretching or general fitness routines.',
    });
  }

  // NEW: Toxic load pattern (uses cookware + amalgam)
  const heatsPlastic = ['Often', 'Daily'].includes(e.plasticHeating);
  const usesAluminum = (e.cookwareTypes || []).includes('Aluminum / aluminium foil');
  const usesNonStick = (e.cookwareTypes || []).includes('Non-stick (Teflon)');
  const hasAmalgam = ['Yes, a few (1–3)', 'Yes, several (4+)'].includes(e.amalgamFillings);
  const toxicLoad = [heatsPlastic, usesAluminum, usesNonStick, hasAmalgam].filter(Boolean).length;

  if (toxicLoad >= 2 && (scores.detox?.pct > 20 || scores.autoimmune?.pct > 25 || scores.nervous?.pct > 25)) {
    let body = 'Your everyday environment includes multiple sources of low-grade toxin exposure: ';
    const sources = [];
    if (heatsPlastic) sources.push('heating food in plastic containers (releases phthalates and BPA-family compounds)');
    if (usesAluminum) sources.push('cooking with aluminum or aluminum foil (which leaches under heat and acid contact)');
    if (usesNonStick) sources.push('non-stick cookware (PFOA/PFAS compounds, especially when scratched or overheated)');
    if (hasAmalgam) sources.push('amalgam dental fillings (slow continuous mercury vapor release)');
    body += sources.join(', ') + '. Individually each is small. Stacked together with active inflammation, detox stress, or nervous system symptoms, they form a meaningful cumulative load. Practical swaps — glass or stainless steel for storage and reheating, ceramic or cast iron over non-stick, parchment over foil — reduce the daily input without big lifestyle changes.';
    insights.push({ title: 'Cumulative Environmental Load', body });
  }

  // NEW: Oral health → systemic inflammation
  const poorDental = ['Active issues (gum disease, frequent cavities)', "Haven't seen a dentist in years"].includes(e.oralHealth);
  const noFloss = ['Rarely', 'Never'].includes(e.dentalHygiene);
  if ((poorDental || noFloss) && (scores.autoimmune?.pct > 25 || scores.digestive?.pct > 30)) {
    insights.push({
      title: 'Oral-Systemic Connection',
      body: 'Gum disease and chronic oral inflammation are increasingly understood as drivers of systemic inflammation. The mouth is the start of the digestive tract, and pathogenic oral bacteria can translocate to the gut and bloodstream, contributing to inflammation in distant tissues. Daily flossing and a dental cleaning are unglamorous but quietly effective inflammatory interventions when oral health has been neglected.',
    });
  }

  // NEW: Weight pattern flag
  if (m.weightTrend === 'Recent rapid increase' && (scores.endocrine?.pct > 20 || scores.pancreas?.pct > 20)) {
    insights.push({
      title: 'Recent Weight Change Worth Investigating',
      body: 'A recent rapid weight increase combined with hormone or blood sugar signals is worth taking to a doctor for thorough labs. Sudden weight changes — especially without dietary or activity changes — often reflect underlying metabolic, hormonal, or inflammatory shifts rather than caloric balance. Thyroid panels, fasting insulin, and cortisol patterns are good starting points for investigation.',
    });
  }

  // ====== QUICK WINS / FLAGS ======

  if (e.eatingSpeed === 'Very fast — barely chew' || e.eatingSpeed === 'Fast — finish before others') {
    flags.push({ icon: '⚠', text: 'Eating too fast contributes to bloating, incomplete digestion, and air swallowing. Putting the fork down between bites and chewing 20–30 times changes digestion mechanics measurably within days.' });
  }

  if (e.hydration === 'Less than 0.5L' || e.hydration === '0.5–1L') {
    flags.push({ icon: '⚠', text: 'Insufficient hydration slows digestion, concentrates urine, and worsens fatigue. Aim for 30ml per kg of body weight as a baseline.' });
  }

  if (lateBed) {
    flags.push({ icon: '⚠', text: 'Bedtimes after midnight miss the natural cortisol reset window (22:00–00:00) where deepest restorative sleep occurs. The timing matters as much as the duration.' });
  }

  if (sugaryDrinks) {
    flags.push({ icon: '⚠', text: 'Liquid sugar (juice, soda, sweetened coffee) hits the bloodstream without the fiber that slows whole-food sugar. Replacing these with water, sparkling water, or whole fruit alone can produce visible body composition changes within weeks.' });
  }

  if (lateExercise) {
    flags.push({ icon: '⚠', text: 'Training late evening raises core body temperature and cortisol exactly when both should be falling for sleep. Moving training earlier — even by 90 minutes — often improves sleep quality dramatically.' });
  }

  if (e.fizzyDrinks === 'Daily') {
    flags.push({ icon: '⚠', text: 'Daily fizzy drinks add carbonation-driven bloating on top of any sweeteners. Even unsweetened sparkling water in large volumes can worsen reflux and gas.' });
  }

  if (e.highHeatCooking === 'Several times per week' || e.highHeatCooking === 'Daily') {
    flags.push({ icon: '⚠', text: 'Frequent high-heat cooking (grilling, frying, charring) creates advanced glycation end products (AGEs) and oxidized fats, both of which drive systemic inflammation. Lower-heat methods (steaming, slow-cooking, stewing) are gentler on inflamed systems.' });
  }

  if (en.caffeineDependent === 'Yes' && yesCount >= 4) {
    flags.push({ icon: '⚠', text: 'Caffeine dependency layered on multi-system fatigue is essentially borrowing energy you do not have. The crash deepens the underlying deficit. Tapering caffeine while addressing root causes feels worse before it feels better, but is the path through.' });
  }

  if (wk.recoveryAfterWork === 'Constantly connected / checking') {
    flags.push({ icon: '⚠', text: 'Constant work connectivity means your nervous system never gets a recovery signal. Even short, hard boundaries (phone in another room from 20:00) outperform longer but porous ones.' });
  }

  if (heatsPlastic) {
    flags.push({ icon: '⚠', text: 'Microwaving or reheating food in plastic releases endocrine-disrupting compounds. Switching to glass or ceramic for reheating is a near-zero-effort change with meaningful long-term impact.' });
  }

  if (e.dentalHygiene === 'Never' || e.dentalHygiene === 'Rarely') {
    flags.push({ icon: '⚠', text: 'Daily flossing addresses inflammation that toothbrushing alone cannot reach. It is one of the lowest-effort, highest-leverage health habits available, with downstream effects on systemic inflammation.' });
  }

  return { scores, insights, flags };
}

function generateRecommendations(scores, data) {
  const recs = [];
  const f = data.foundation || {};
  const e = data.eatingHabits || {};
  const r = data.dailyRhythm || {};

  if (scores.digestive?.pct > 30) {
    recs.push({
      priority: 'Gut barrier support',
      items: [
        'L-glutamine 2–5g daily on an empty stomach — primary fuel for intestinal mucosa',
        'Bone broth or collagen peptides daily — provides amino acids for gut lining repair',
        'Saccharomyces boulardii probiotic 250–500mg daily — particularly effective for IBS-pattern symptoms',
        'Zinc carnosine 75mg with food — targets gastric and intestinal healing',
        '4-week elimination of common triggers (gluten, dairy, refined sugar) with structured reintroduction one at a time',
      ],
    });
  }

  if (scores.pancreas?.pct > 30) {
    recs.push({
      priority: 'Blood sugar stabilization',
      items: [
        'Protein and fat at every meal, especially breakfast within an hour of waking',
        'Eliminate fruit juice and sweetened drinks — replace with whole fruit and water',
        'Add 16:00 snack to close the lunch-to-dinner gap (nuts, eggs, vegetables)',
        'Berberine 500mg before meals (if not contraindicated by medications) — supports insulin sensitivity',
        'Inositol 2–4g daily — improves glucose handling and reduces cravings',
      ],
    });
  }

  if (scores.autoimmune?.pct > 25) {
    recs.push({
      priority: 'Inflammation modulation',
      items: [
        'Quercetin 500mg twice daily — natural antihistamine and mast cell stabilizer',
        'Omega-3 EPA/DHA 2–3g daily from quality fish oil — reduces systemic inflammation',
        'Curcumin with piperine 500–1000mg daily — broad anti-inflammatory action',
        'Vitamin C 1000mg daily — synergizes with quercetin',
        'Verify Vitamin D level is 50–70 ng/ml — critical for immune regulation',
      ],
    });
  }

  if (scores.endocrine?.pct > 25 || isLateBedtime(r.bedtime)) {
    recs.push({
      priority: 'Cortisol & sleep recovery',
      items: [
        'Move bedtime to 23:00 — non-negotiable for cortisol rhythm reset',
        'Magnesium glycinate 400mg 30–60 min before bed',
        'Morning sunlight exposure within 30 minutes of waking',
        'Ashwagandha (KSM-66) 300–600mg daily — clinically reduces cortisol 25–30%',
        'No screens after 22:00, no food after 20:00',
        'If exercise is in evening, move it earlier in the day where possible',
      ],
    });
  }

  if (scores.nervous?.pct > 25) {
    recs.push({
      priority: 'Nervous system support',
      items: [
        'Daily breathwork practice (10 minutes of box breathing or coherent breathing)',
        'Phosphatidylserine 100mg twice daily — supports cortisol regulation in the brain',
        'L-theanine 200mg as needed — promotes alpha-wave calm without sedation',
        'Regular nature exposure — proven to reduce rumination and improve focus',
      ],
    });
  }

  if (scores.musculoskeletal?.pct > 30) {
    recs.push({
      priority: 'Connective tissue support',
      items: [
        'Collagen peptides 10–20g daily with vitamin C',
        'Magnesium glycinate or malate for muscle relaxation',
        'Anti-inflammatory diet emphasis (omega-3s, polyphenols, low sugar)',
        'Consider physical therapy assessment for hypermobility-related instability',
      ],
    });
  }

  if (e.eatingSpeed === 'Very fast — barely chew' || e.eatingSpeed === 'Fast — finish before others') {
    recs.push({
      priority: 'Eating mechanics',
      items: [
        'Put fork down between every bite for the first week',
        'Aim for 20–30 chews per mouthful',
        'Take 20 minutes minimum for any meal',
        'Eat without screens — your brain needs to register the meal',
      ],
    });
  }

  // NEW: Environmental load reduction
  const heatsPlastic = ['Often', 'Daily'].includes(e.plasticHeating);
  const usesAluminum = (e.cookwareTypes || []).includes('Aluminum / aluminium foil');
  const usesNonStick = (e.cookwareTypes || []).includes('Non-stick (Teflon)');
  if (heatsPlastic || usesAluminum || usesNonStick) {
    recs.push({
      priority: 'Environmental load reduction',
      items: [
        'Replace plastic food storage with glass for anything heated or microwaved',
        'Use parchment paper instead of aluminum foil for baking and wrapping',
        'Replace scratched non-stick pans with cast iron, stainless steel, or ceramic',
        'Store fats and oils in dark glass — light and plastic both degrade them faster',
      ],
    });
  }

  // NEW: Oral health
  if (['Never', 'Rarely'].includes(e.dentalHygiene) || ['Active issues (gum disease, frequent cavities)', "Haven't seen a dentist in years"].includes(e.oralHealth)) {
    recs.push({
      priority: 'Oral health foundation',
      items: [
        'Daily flossing — most efficient anti-inflammatory habit available',
        'Schedule dental cleaning if more than 6 months overdue',
        'Consider tongue scraping in the morning for additional bacterial reduction',
        'Discuss amalgam fillings with a biological dentist if you have several',
      ],
    });
  }

  return recs;
}

const LAB_TESTS = [
  { name: 'Fasting Insulin + Glucose + HbA1c', why: 'Earliest markers of metabolic dysfunction, before standard glucose tests flag problems' },
  { name: 'Full Thyroid Panel', why: 'TSH, Free T3, Free T4, Reverse T3, TPO and Thyroglobulin antibodies' },
  { name: '4-point Salivary Cortisol', why: 'Maps your cortisol curve across the day — critical for diagnosing adrenal patterns' },
  { name: 'Vitamin D (25-OH)', why: 'Confirms supplementation reaches optimal range (50–70 ng/ml)' },
  { name: 'hs-CRP', why: 'High-sensitivity inflammation marker' },
  { name: 'Comprehensive Metabolic Panel', why: 'Liver, kidney, electrolytes baseline' },
  { name: 'Complete Blood Count', why: 'Anemia, infection, immune patterns' },
  { name: 'Ferritin + Iron Studies', why: 'Iron status often missed by standard CBC alone' },
  { name: 'B12 + Folate (active forms)', why: 'Methylation and nerve function' },
  { name: 'Zonulin (if available)', why: 'Marker of intestinal permeability' },
];

// ==========================================================================
// UI COMPONENTS
// ==========================================================================

const COLORS = {
  bg: '#F4F1EA',
  paper: '#FBFAF6',
  ink: '#2A2824',
  inkLight: '#5C5852',
  accent: '#8B6F47',
  accentDark: '#6B5538',
  rule: '#D9D2C4',
  highlight: '#E8DCC4',
};

function Header({ progress }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md" style={{ background: 'rgba(244, 241, 234, 0.85)', borderBottom: `1px solid ${COLORS.rule}` }}>
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Compass size={20} style={{ color: COLORS.accent }} strokeWidth={1.5} />
          <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', fontWeight: 500, color: COLORS.ink, letterSpacing: '0.02em' }}>
            Body Compass
          </span>
        </div>
        {progress != null && (
          <div className="flex items-center gap-3">
            <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: COLORS.rule }}>
              <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: COLORS.accent }} />
            </div>
            <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.85rem', color: COLORS.inkLight, fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

function IntroScreen({ onStart }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
        <p style={{ fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: COLORS.accent, marginBottom: '2rem' }}>
          A Self-Reflection Tool
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.05, fontWeight: 400, color: COLORS.ink, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Map the patterns<br/>
          <em style={{ fontStyle: 'italic', color: COLORS.accent }}>your body</em> is signaling.
        </h1>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: COLORS.inkLight, marginBottom: '3rem', maxWidth: '36rem' }}>
          A structured questionnaire spanning seven body systems and the daily habits that shape them. At the end, you'll receive a downloadable report mapping your scores, surfacing patterns, and pointing toward areas worth exploring with a healthcare professional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Time', value: '25–30 min' },
          { label: 'Sections', value: 'Fourteen' },
          { label: 'Privacy', value: 'Local only' },
        ].map(item => (
          <div key={item.label} style={{ borderTop: `1px solid ${COLORS.rule}`, paddingTop: '1rem' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.inkLight, marginBottom: '0.5rem' }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 500, color: COLORS.ink }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.highlight, border: `1px solid ${COLORS.rule}`, padding: '1.5rem', marginBottom: '1rem' }}>
        <div className="flex gap-3">
          <CheckCircle2 size={18} style={{ color: COLORS.accentDark, flexShrink: 0, marginTop: '2px' }} strokeWidth={1.5} />
          <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: COLORS.ink }}>
            <strong style={{ color: COLORS.ink }}>For the most useful report, be detailed.</strong>
            <p style={{ marginTop: '0.5rem', color: COLORS.inkLight }}>
              The quality of your insights depends on the depth of context you provide. When the assessment asks about your current symptoms, medications and supplements, past illnesses, surgeries, or chronic issues — write thoroughly rather than briefly. Mention dosages, durations, what changed and when, what you've tried before. Specifics turn generic patterns into personalized findings.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.rule}`, padding: '1.5rem', marginBottom: '1rem' }}>
        <div className="flex gap-3">
          <Compass size={18} style={{ color: COLORS.accent, flexShrink: 0, marginTop: '2px' }} strokeWidth={1.5} />
          <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: COLORS.inkLight }}>
            <strong style={{ color: COLORS.ink }}>Your data stays on your device.</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', listStyle: 'none' }}>
              <li style={{ marginBottom: '0.4rem', position: 'relative', paddingLeft: '1rem' }}>
                <span style={{ position: 'absolute', left: 0, color: COLORS.accent }}>—</span>
                Your answers never leave the browser. No database, no logs, no server-side processing.
              </li>
              <li style={{ marginBottom: '0.4rem', position: 'relative', paddingLeft: '1rem' }}>
                <span style={{ position: 'absolute', left: 0, color: COLORS.accent }}>—</span>
                The connection is encrypted with HTTPS so the code can't be intercepted or modified as it loads.
              </li>
              <li style={{ marginBottom: '0.4rem', position: 'relative', paddingLeft: '1rem' }}>
                <span style={{ position: 'absolute', left: 0, color: COLORS.accent }}>—</span>
                No cookies, no tracking, no analytics.
              </li>
              <li style={{ position: 'relative', paddingLeft: '1rem' }}>
                <span style={{ position: 'absolute', left: 0, color: COLORS.accent }}>—</span>
                Refresh or close the tab and everything is gone. The report you download is yours alone.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.rule}`, padding: '1.5rem', marginBottom: '3rem' }}>
        <div className="flex gap-3">
          <AlertCircle size={18} style={{ color: COLORS.accent, flexShrink: 0, marginTop: '2px' }} strokeWidth={1.5} />
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: COLORS.inkLight }}>
            <strong style={{ color: COLORS.ink }}>This is not medical advice.</strong> The output is a self-reflection document to help organize your thoughts and prepare for conversations with qualified healthcare providers. It does not diagnose, treat, or replace professional medical care.
          </p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="group inline-flex items-center gap-3 px-8 py-4 transition-all duration-300 hover:gap-5"
        style={{ background: COLORS.ink, color: COLORS.bg, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', letterSpacing: '0.05em' }}
      >
        Begin Assessment
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-12" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
      <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: COLORS.accent, marginBottom: '1rem' }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.1, fontWeight: 400, color: COLORS.ink, marginBottom: subtitle ? '0.75rem' : 0, letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '1.05rem', color: COLORS.inkLight, lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, multiline, type = 'text' }) {
  return (
    <div className="mb-8">
      <label style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem', fontWeight: 500, color: COLORS.ink, display: 'block', marginBottom: '0.75rem', lineHeight: 1.4 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.rule}`, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', color: COLORS.ink, outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderBottomColor = COLORS.accent}
          onBlur={e => e.target.style.borderBottomColor = COLORS.rule}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.rule}`, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', color: COLORS.ink, outline: 'none', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderBottomColor = COLORS.accent}
          onBlur={e => e.target.style.borderBottomColor = COLORS.rule}
        />
      )}
    </div>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <div className="mb-10">
      <label style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem', fontWeight: 500, color: COLORS.ink, display: 'block', marginBottom: '1rem', lineHeight: 1.4 }}>
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{ padding: '0.5rem 1rem', background: selected ? COLORS.ink : 'transparent', color: selected ? COLORS.bg : COLORS.ink, border: `1px solid ${selected ? COLORS.ink : COLORS.rule}`, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = COLORS.accent; }}
              onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = COLORS.rule; }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiSelectField({ label, options, value = [], onChange }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div className="mb-10">
      <label style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem', fontWeight: 500, color: COLORS.ink, display: 'block', marginBottom: '1rem', lineHeight: 1.4 }}>
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const selected = value.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              style={{ padding: '0.5rem 1rem', background: selected ? COLORS.ink : 'transparent', color: selected ? COLORS.bg : COLORS.ink, border: `1px solid ${selected ? COLORS.ink : COLORS.rule}`, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoField({ label, value, onChange }) {
  return (
    <div className="mb-6" style={{ paddingBottom: '1rem', borderBottom: `1px solid ${COLORS.rule}` }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', color: COLORS.ink, lineHeight: 1.5, flex: 1 }}>
          {label}
        </label>
        <div className="flex gap-2">
          {['Yes', 'No'].map(opt => {
            const selected = value === opt;
            return (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                style={{ padding: '0.4rem 1.25rem', background: selected ? COLORS.ink : 'transparent', color: selected ? COLORS.bg : COLORS.ink, border: `1px solid ${selected ? COLORS.ink : COLORS.rule}`, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', minWidth: '4rem' }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScaleQuestion({ question, value, onChange, index }) {
  const labels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
  return (
    <div style={{ borderTop: index > 0 ? `1px solid ${COLORS.rule}` : 'none', paddingTop: index > 0 ? '1.75rem' : 0, paddingBottom: '1.75rem' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', color: COLORS.ink, marginBottom: '1rem', lineHeight: 1.5 }}>
        <span style={{ color: COLORS.accent, marginRight: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>{String(index + 1).padStart(2, '0')}</span>
        {question}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {labels.map((label, i) => {
          const selected = value === i;
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              style={{ flex: '1 1 auto', minWidth: '5rem', padding: '0.625rem 0.5rem', background: selected ? COLORS.accent : 'transparent', color: selected ? COLORS.paper : COLORS.inkLight, border: `1px solid ${selected ? COLORS.accent : COLORS.rule}`, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.85rem', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue', canProceed = true }) {
  return (
    <div className="flex justify-between items-center pt-8 mt-8" style={{ borderTop: `1px solid ${COLORS.rule}` }}>
      <button
        onClick={onBack}
        disabled={!onBack}
        className="inline-flex items-center gap-2 transition-opacity"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', color: COLORS.inkLight, opacity: onBack ? 1 : 0.3, cursor: onBack ? 'pointer' : 'default', background: 'none', border: 'none' }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        Back
      </button>
      <button
        onClick={onNext}
        disabled={!canProceed}
        className="inline-flex items-center gap-3 px-6 py-3 transition-all duration-200 hover:gap-4"
        style={{ background: canProceed ? COLORS.ink : COLORS.rule, color: COLORS.bg, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', letterSpacing: '0.05em', cursor: canProceed ? 'pointer' : 'not-allowed', border: 'none' }}
      >
        {nextLabel}
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ==========================================================================
// SECTION SCREENS
// ==========================================================================

function PersonalScreen({ data, update, onNext, onBack }) {
  const d = data.personal || {};
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionHeader eyebrow="Section 01 of 14" title="About you" subtitle="Basic context to ground the assessment." />
      <TextField label="Name (optional)" value={d.name} onChange={v => update('personal.name', v)} />
      <TextField label="Age" type="number" value={d.age} onChange={v => update('personal.age', v)} />
      <SelectField label="Gender" options={['Male', 'Female', 'Other / Prefer not to say']} value={d.gender} onChange={v => update('personal.gender', v)} />
      <TextField label="Profession (optional)" value={d.profession} onChange={v => update('personal.profession', v)} />
      <NavButtons onBack={onBack} onNext={onNext} canProceed={!!d.age && !!d.gender} />
    </div>
  );
}

function GenericFormScreen({ sectionKey, sectionNumber, title, subtitle, questions, requiredKeys, data, update, onNext, onBack, isLastSection }) {
  const sectionData = data[sectionKey] || {};
  const canProceed = (requiredKeys || []).every(k => {
    const q = questions[k];
    const v = sectionData[k];
    if (!q) return true;
    if (q.type === 'longtext') return v && v.trim().length > 0;
    if (q.type === 'multiselect') return Array.isArray(v) && v.length > 0;
    return !!v;
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionHeader eyebrow={`Section ${String(sectionNumber).padStart(2, '0')} of 14`} title={title} subtitle={subtitle} />
      {Object.entries(questions).map(([key, q], idx) => {
        const wrapper = (content) => (
          <div key={key} style={{ paddingTop: idx === 0 ? 0 : '1.5rem', paddingBottom: '0.5rem', borderTop: idx === 0 ? 'none' : `1px solid ${COLORS.rule}`, marginBottom: '1.5rem' }}>
            {content}
          </div>
        );
        const onChange = v => update(`${sectionKey}.${key}`, v);
        if (q.type === 'longtext') return wrapper(<TextField label={q.label} value={sectionData[key]} multiline onChange={onChange} />);
        if (q.type === 'select') return wrapper(<SelectField label={q.label} options={q.options} value={sectionData[key]} onChange={onChange} />);
        if (q.type === 'multiselect') return wrapper(<MultiSelectField label={q.label} options={q.options} value={sectionData[key]} onChange={onChange} />);
        return null;
      })}
      <NavButtons onBack={onBack} onNext={onNext} canProceed={canProceed} nextLabel={isLastSection ? 'Generate Report' : 'Continue'} />
    </div>
  );
}

function VitalsScreen({ data, update, onNext, onBack }) {
  const v = data.vitals || {};
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionHeader eyebrow="Section 03 of 14" title="Vital statistics" subtitle="Approximate numbers are fine. Skip what you don't know." />
      <TextField label="Blood pressure (e.g., 120/80)" value={v.bp} onChange={x => update('vitals.bp', x)} />
      <TextField label="Resting heart rate (bpm)" type="number" value={v.hr} onChange={x => update('vitals.hr', x)} />
      <TextField label="Weight (kg)" type="number" value={v.weight} onChange={x => update('vitals.weight', x)} />
      <TextField label="Height (cm)" type="number" value={v.height} onChange={x => update('vitals.height', x)} />
      <TextField label="Waist circumference (cm)" type="number" value={v.waist} onChange={x => update('vitals.waist', x)} />
      <TextField label="Hip circumference (cm)" type="number" value={v.hip} onChange={x => update('vitals.hip', x)} />
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

// Combined Food Diary screen — weekday + weekend in one screen with internal sub-headers
function FoodDiaryScreen({ data, update, onNext, onBack }) {
  const wd = data.foodDiaryWeekday || {};
  const we = data.foodDiaryWeekend || {};
  const requiredWeekday = ['weekdayBreakfast', 'weekdayLunch', 'weekdayDinner'];
  const requiredWeekend = ['weekendBreakfast', 'weekendLunch', 'weekendDinner'];
  const allReq = [...requiredWeekday.map(k => wd[k]), ...requiredWeekend.map(k => we[k])];
  const canProceed = allReq.every(v => v && v.trim && v.trim().length > 0);

  const renderField = (sectionKey, key, q, idx) => (
    <div key={key} style={{ paddingTop: idx === 0 ? 0 : '1.5rem', paddingBottom: '0.5rem', borderTop: idx === 0 ? 'none' : `1px solid ${COLORS.rule}`, marginBottom: '1.5rem' }}>
      <TextField label={q.label} value={data[sectionKey]?.[key]} multiline onChange={v => update(`${sectionKey}.${key}`, v)} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionHeader eyebrow="Section 06 of 14" title="Food diary" subtitle="Walk through a typical weekday and a typical weekend day. Times matter — note when, not just what." />

      <div style={{ marginTop: '1rem', marginBottom: '2rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${COLORS.accent}` }}>
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.accent }}>
          Typical Weekday
        </p>
      </div>
      {Object.entries(FOOD_DIARY_WEEKDAY).map(([key, q], i) => renderField('foodDiaryWeekday', key, q, i))}

      <div style={{ marginTop: '3rem', marginBottom: '2rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${COLORS.accent}` }}>
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.accent }}>
          Typical Weekend Day
        </p>
      </div>
      {Object.entries(FOOD_DIARY_WEEKEND).map(([key, q], i) => renderField('foodDiaryWeekend', key, q, i))}

      <NavButtons onBack={onBack} onNext={onNext} canProceed={canProceed} />
    </div>
  );
}

function EnergyScreen({ data, update, onNext, onBack }) {
  const en = data.energy || {};
  const yesnoKeys = ['needLongSleep', 'lowEnergyOverall', 'hardToGetUp', 'daytimeSleepy', 'hangerDizzy', 'caffeineDependent', 'concentrationIssues', 'dizzyOnStanding', 'unexplainedExhaustion'];
  const canProceed = yesnoKeys.every(k => en[k]) && !!en.energyDipTime;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionHeader eyebrow="Section 09 of 14" title="Energy levels" subtitle="A quick yes/no scan of how energy moves through your day." />
      {Object.entries(ENERGY_QUESTIONS).map(([key, q]) => {
        const onChange = v => update(`energy.${key}`, v);
        if (q.type === 'yesno') return <YesNoField key={key} label={q.label} value={en[key]} onChange={onChange} />;
        if (q.type === 'select') {
          return (
            <div key={key} style={{ paddingTop: '1rem' }}>
              <SelectField label={q.label} options={q.options} value={en[key]} onChange={onChange} />
            </div>
          );
        }
        return null;
      })}
      <NavButtons onBack={onBack} onNext={onNext} canProceed={canProceed} />
    </div>
  );
}

function ScanSectionScreen({ sectionKey, sectionNumber, data, update, onNext, onBack }) {
  const section = SCAN_SECTIONS[sectionKey];
  const answers = data[sectionKey] || Array(section.questions.length).fill(null);
  const allAnswered = answers.every(a => a !== null);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <SectionHeader eyebrow={`Section ${String(sectionNumber).padStart(2, '0')} of 14`} title={section.title} subtitle={section.description} />
      <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.9rem', color: COLORS.inkLight, fontStyle: 'italic', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: `1px solid ${COLORS.rule}` }}>
        How often do these apply to you?
      </p>
      {section.questions.map((q, i) => (
        <ScaleQuestion
          key={i}
          index={i}
          question={q}
          value={answers[i]}
          onChange={val => {
            const newAnswers = [...answers];
            newAnswers[i] = val;
            update(sectionKey, newAnswers);
          }}
        />
      ))}
      <NavButtons onBack={onBack} onNext={onNext} canProceed={allAnswered} nextLabel={sectionNumber === 14 ? 'Generate Report' : 'Continue'} />
    </div>
  );
}

// ==========================================================================
// REPORT SCREEN
// ==========================================================================

function ScoreBar({ label, score, max, level, color }) {
  const pct = (score / max) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
        <span style={{ fontSize: '1.1rem', color: COLORS.ink }}>{label}</span>
        <span style={{ fontSize: '0.9rem', color: COLORS.inkLight, fontVariantNumeric: 'tabular-nums' }}>
          {score}/{max} · <em style={{ color, fontStyle: 'italic' }}>{level}</em>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: COLORS.rule }}>
        <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ReportScreen({ data, onRestart }) {
  const [downloading, setDownloading] = useState(false);
  const analysis = useMemo(() => generateInsights(data), [data]);
  const recommendations = useMemo(() => generateRecommendations(analysis.scores, data), [analysis.scores, data]);

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const docx = await import('docx');
      const blob = await buildDocx(docx, data, analysis, recommendations);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `body-compass-report-${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Could not generate document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <SectionHeader eyebrow="Your Report" title="What your body is signaling" subtitle="A map of patterns based on your responses." />

      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.rule}`, padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', color: COLORS.ink, marginBottom: '1.5rem', fontWeight: 500 }}>
          Score summary
        </h3>
        {Object.entries(analysis.scores).map(([key, s]) => (
          <ScoreBar key={key} label={SCAN_SECTIONS[key].title} score={s.score} max={s.max} level={s.level} color={s.color} />
        ))}
      </div>

      {analysis.insights.length > 0 && (
        <div className="mb-12">
          <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.75rem', color: COLORS.ink, marginBottom: '1.5rem', fontWeight: 500 }}>
            What stands out
          </h3>
          {analysis.insights.map((insight, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${COLORS.accent}`, paddingLeft: '1.5rem', marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', color: COLORS.ink, marginBottom: '0.5rem', fontWeight: 500 }}>
                {insight.title}
              </h4>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', color: COLORS.inkLight, lineHeight: 1.65 }}>
                {insight.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {analysis.flags.length > 0 && (
        <div className="mb-12" style={{ background: COLORS.highlight, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', color: COLORS.ink, marginBottom: '1rem', fontWeight: 500 }}>
            Quick wins
          </h3>
          {analysis.flags.map((flag, i) => (
            <p key={i} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', color: COLORS.inkLight, lineHeight: 1.6, marginBottom: '0.75rem' }}>
              <span style={{ color: COLORS.accent, marginRight: '0.5rem' }}>{flag.icon}</span>
              {flag.text}
            </p>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mb-12">
          <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.75rem', color: COLORS.ink, marginBottom: '1.5rem', fontWeight: 500 }}>
            Areas to explore
          </h3>
          {recommendations.map((rec, i) => (
            <div key={i} className="mb-8">
              <h4 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem', color: COLORS.accent, marginBottom: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {rec.priority}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {rec.items.map((item, j) => (
                  <li key={j} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', color: COLORS.ink, lineHeight: 1.6, paddingLeft: '1.5rem', position: 'relative', marginBottom: '0.5rem' }}>
                    <span style={{ position: 'absolute', left: 0, color: COLORS.accent }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.rule}`, padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', color: COLORS.ink, marginBottom: '1rem', fontWeight: 500 }}>
          Tests worth requesting
        </h3>
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.95rem', color: COLORS.inkLight, marginBottom: '1.5rem', fontStyle: 'italic' }}>
          Bring this list to your doctor or healthcare provider as a starting point for conversation.
        </p>
        {LAB_TESTS.map((t, i) => (
          <div key={i} style={{ borderTop: i > 0 ? `1px solid ${COLORS.rule}` : 'none', paddingTop: i > 0 ? '0.75rem' : 0, paddingBottom: '0.75rem' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', color: COLORS.ink, marginBottom: '0.25rem' }}>
              {t.name}
            </p>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.9rem', color: COLORS.inkLight, lineHeight: 1.5 }}>
              {t.why}
            </p>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFF7E6', border: `1px solid ${COLORS.rule}`, padding: '1.5rem', marginBottom: '3rem' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.9rem', color: COLORS.inkLight, lineHeight: 1.6 }}>
          <strong style={{ color: COLORS.ink }}>Important.</strong> This report is a self-reflection document, not medical advice. Score patterns are not diagnoses. Discuss findings with a qualified healthcare provider before starting supplements or making significant changes, especially if you take medications. Some supplements interact with common drugs (e.g., calcium, iron, and magnesium should be taken several hours apart from thyroid medications).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={downloadReport}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 transition-all"
          style={{ background: COLORS.ink, color: COLORS.bg, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', letterSpacing: '0.05em', cursor: downloading ? 'wait' : 'pointer', border: 'none', opacity: downloading ? 0.7 : 1 }}
        >
          {downloading ? <Loader2 size={18} className="animate-spin" strokeWidth={1.5} /> : <Download size={18} strokeWidth={1.5} />}
          {downloading ? 'Building document' : 'Download full report'}
        </button>
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 transition-all"
          style={{ background: 'transparent', color: COLORS.ink, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', border: `1px solid ${COLORS.rule}`, cursor: 'pointer' }}
        >
          Start over
        </button>
      </div>
    </div>
  );
}

// ==========================================================================
// DOCX GENERATION
// ==========================================================================

async function buildDocx(docx, data, analysis, recommendations) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel,
          BorderStyle, WidthType, ShadingType, AlignmentType, PageBreak } = docx;

  const border = { style: BorderStyle.SINGLE, size: 1, color: 'D9D2C4' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const margins = { top: 80, bottom: 80, left: 120, right: 120 };
  const headerFill = { fill: '2A2824', type: ShadingType.CLEAR };
  const altFill = { fill: 'F4F1EA', type: ShadingType.CLEAR };

  const heading = (text, level = HeadingLevel.HEADING_1) => new Paragraph({
    heading: level, spacing: { before: 320, after: 180 },
    children: [new TextRun({ text, font: 'Georgia' })],
  });

  const para = (text, opts = {}) => new Paragraph({
    spacing: { after: 120, ...opts.spacing },
    children: [new TextRun({ text, font: 'Georgia', size: 22, bold: opts.bold, italics: opts.italics, color: opts.color })],
  });

  const cell = (text, width, fill, bold = false, color) => new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, shading: fill || { fill: 'FFFFFF', type: ShadingType.CLEAR }, margins,
    children: [new Paragraph({ children: [new TextRun({ text: text || '—', bold, font: 'Georgia', size: 20, color })] })],
  });

  const headerCell = (text, width) => new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, shading: headerFill, margins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'F4F1EA', font: 'Georgia', size: 20 })] })],
  });

  const renderQA = (sectionTitle, questions, sectionData) => {
    const items = [];
    items.push(heading(sectionTitle, HeadingLevel.HEADING_2));
    Object.entries(questions).forEach(([key, q]) => {
      const val = sectionData[key];
      if (!val) return;
      const display = Array.isArray(val) ? val.join(', ') : val;
      items.push(para(q.label, { bold: true }));
      items.push(para(display, { spacing: { after: 200 } }));
    });
    return items;
  };

  const children = [];

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: 'BODY COMPASS', bold: true, font: 'Georgia', size: 36, color: '2A2824' })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 80 },
    children: [new TextRun({ text: 'Self-Reflection Health Report', italics: true, font: 'Georgia', size: 22, color: '8B6F47' })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 360 },
    children: [new TextRun({ text: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), font: 'Georgia', size: 18, color: '5C5852' })],
  }));

  if (data.personal?.name || data.personal?.age) {
    children.push(heading('Profile'));
    const rows = [];
    if (data.personal?.name) rows.push(['Name', data.personal.name]);
    if (data.personal?.age) rows.push(['Age', data.personal.age]);
    if (data.personal?.gender) rows.push(['Gender', data.personal.gender]);
    if (data.personal?.profession) rows.push(['Profession', data.personal.profession]);
    children.push(new Table({
      width: { size: 9360, type: WidthType.DXA }, columnWidths: [3000, 6360],
      rows: rows.map((r, i) => new TableRow({ children: [cell(r[0], 3000, i % 2 === 0 ? altFill : null, true), cell(r[1], 6360, i % 2 === 0 ? altFill : null)] })),
    }));
    children.push(para(''));
  }

  const v = data.vitals || {};
  if (Object.values(v).some(x => x)) {
    children.push(heading('Vital statistics'));
    const rows = [];
    if (v.bp) rows.push(['Blood pressure', v.bp]);
    if (v.hr) rows.push(['Resting heart rate', `${v.hr} bpm`]);
    if (v.weight) rows.push(['Weight', `${v.weight} kg`]);
    if (v.height) rows.push(['Height', `${v.height} cm`]);
    if (v.weight && v.height) {
      const bmi = (Number(v.weight) / Math.pow(Number(v.height) / 100, 2)).toFixed(1);
      rows.push(['BMI', bmi]);
    }
    if (v.waist) rows.push(['Waist', `${v.waist} cm`]);
    if (v.hip) rows.push(['Hip', `${v.hip} cm`]);
    if (v.waist && v.hip) {
      const whr = (Number(v.waist) / Number(v.hip)).toFixed(2);
      rows.push(['Waist-to-hip ratio', whr]);
    }
    children.push(new Table({
      width: { size: 9360, type: WidthType.DXA }, columnWidths: [3000, 6360],
      rows: rows.map((r, i) => new TableRow({ children: [cell(r[0], 3000, i % 2 === 0 ? altFill : null, true), cell(r[1], 6360, i % 2 === 0 ? altFill : null)] })),
    }));
    children.push(para(''));
  }

  if (Object.keys(data.foundation || {}).length > 0) {
    children.push(...renderQA('Context & background', FOUNDATION_QUESTIONS, data.foundation || {}));
  }

  if (Object.keys(data.medical || {}).length > 0) {
    children.push(...renderQA('Medical history', MEDICAL_QUESTIONS, data.medical || {}));
  }

  if (Object.keys(data.eatingHabits || {}).length > 0) {
    children.push(...renderQA('Eating habits', EATING_HABITS_QUESTIONS, data.eatingHabits || {}));
  }

  if (Object.keys(data.foodDiaryWeekday || {}).length > 0) {
    children.push(...renderQA('Food diary — weekday', FOOD_DIARY_WEEKDAY, data.foodDiaryWeekday || {}));
  }
  if (Object.keys(data.foodDiaryWeekend || {}).length > 0) {
    children.push(...renderQA('Food diary — weekend', FOOD_DIARY_WEEKEND, data.foodDiaryWeekend || {}));
  }

  if (Object.keys(data.dailyRhythm || {}).length > 0) {
    children.push(...renderQA('Daily rhythm', DAILY_RHYTHM_QUESTIONS, data.dailyRhythm || {}));
  }

  if (Object.keys(data.weekend || {}).length > 0) {
    children.push(...renderQA('Weekend variation', WEEKEND_QUESTIONS, data.weekend || {}));
  }

  if (Object.keys(data.energy || {}).length > 0) {
    children.push(...renderQA('Energy levels', ENERGY_QUESTIONS, data.energy || {}));
  }

  if (Object.keys(data.work || {}).length > 0) {
    children.push(...renderQA('Work & stress', WORK_QUESTIONS, data.work || {}));
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));

  children.push(heading('Score summary'));
  const summaryRows = [
    new TableRow({ children: [headerCell('System', 4000), headerCell('Score', 1500), headerCell('Max', 1200), headerCell('Level', 2660)] }),
  ];
  Object.entries(analysis.scores).forEach(([key, s], i) => {
    const fill = i % 2 === 0 ? altFill : null;
    summaryRows.push(new TableRow({ children: [
      cell(SCAN_SECTIONS[key].title, 4000, fill),
      cell(String(s.score), 1500, fill),
      cell(String(s.max), 1200, fill),
      cell(s.level, 2660, fill, true, s.color.replace('#', '')),
    ]}));
  });
  children.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [4000, 1500, 1200, 2660], rows: summaryRows }));
  children.push(para(''));

  children.push(heading('Detailed scan responses'));
  Object.entries(SCAN_SECTIONS).forEach(([key, section]) => {
    const answers = data[key] || [];
    children.push(heading(section.title, HeadingLevel.HEADING_2));
    const rows = [new TableRow({ children: [headerCell('Question', 7400), headerCell('Score', 1960)] })];
    section.questions.forEach((q, i) => {
      const fill = i % 2 === 0 ? altFill : null;
      const labels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
      rows.push(new TableRow({ children: [cell(q, 7400, fill), cell(`${answers[i] ?? '—'} (${labels[answers[i]] ?? '—'})`, 1960, fill)] }));
    });
    children.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [7400, 1960], rows }));
    children.push(para(''));
  });

  children.push(new Paragraph({ children: [new PageBreak()] }));

  if (analysis.insights.length > 0) {
    children.push(heading('What stands out'));
    analysis.insights.forEach(insight => {
      children.push(para(insight.title, { bold: true }));
      children.push(para(insight.body, { spacing: { after: 240 } }));
    });
  }

  if (analysis.flags.length > 0) {
    children.push(heading('Quick wins'));
    analysis.flags.forEach(flag => {
      children.push(para(`• ${flag.text}`, { spacing: { after: 180 } }));
    });
  }

  if (recommendations.length > 0) {
    children.push(heading('Areas to explore'));
    recommendations.forEach(rec => {
      children.push(para(rec.priority.toUpperCase(), { bold: true, color: '8B6F47' }));
      rec.items.forEach(item => {
        children.push(para(`— ${item}`, { spacing: { after: 80 } }));
      });
      children.push(para(''));
    });
  }

  children.push(heading('Tests worth requesting'));
  children.push(para('Bring this list to your doctor as a starting point for conversation.', { italics: true, spacing: { after: 200 } }));
  const labRows = [new TableRow({ children: [headerCell('Test', 3500), headerCell('Why', 5860)] })];
  LAB_TESTS.forEach((t, i) => {
    const fill = i % 2 === 0 ? altFill : null;
    labRows.push(new TableRow({ children: [cell(t.name, 3500, fill, true), cell(t.why, 5860, fill)] }));
  });
  children.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3500, 5860], rows: labRows }));

  children.push(para(''));
  children.push(para('IMPORTANT', { bold: true, color: 'B45353' }));
  children.push(para('This report is a self-reflection document, not medical advice. Score patterns are not diagnoses. Discuss findings with a qualified healthcare provider before starting supplements or making significant changes, especially if you take medications. Some supplements interact with common drugs — for example, calcium, iron, and magnesium should be taken several hours apart from thyroid medications.', { italics: true, color: '5C5852' }));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Georgia', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Georgia', color: '2A2824' },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Georgia', color: '8B6F47' },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, right: 1440, bottom: 1200, left: 1440 } } },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

// ==========================================================================
// MAIN APP
// ==========================================================================

const initialState = () => ({
  personal: {}, foundation: {}, vitals: {}, medical: {},
  eatingHabits: {}, foodDiaryWeekday: {}, foodDiaryWeekend: {},
  dailyRhythm: {}, weekend: {}, energy: {}, work: {},
  digestive: Array(8).fill(null),
  detox: Array(8).fill(null),
  pancreas: Array(8).fill(null),
  endocrine: Array(6).fill(null),
  nervous: Array(8).fill(null),
  musculoskeletal: Array(10).fill(null),
  autoimmune: Array(8).fill(null),
});

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialState);

  const update = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let target = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) target[keys[i]] = {};
        target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const totalSteps = 18;
  const progress = step === 0 ? 0 : step >= totalSteps ? 100 : (step / totalSteps) * 100;

  const next = () => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const back = () => { setStep(s => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const restart = () => { setStep(0); setData(initialState()); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const scanOrder = ['digestive', 'detox', 'pancreas', 'endocrine', 'nervous', 'musculoskeletal', 'autoimmune'];

  const renderStep = () => {
    if (step === 0) return <IntroScreen onStart={next} />;
    if (step === 1) return <PersonalScreen data={data} update={update} onNext={next} onBack={back} />;
    if (step === 2) return (
      <GenericFormScreen
        sectionKey="foundation" sectionNumber={2} title="Foundation"
        subtitle="Context that helps interpret everything that follows. Take your time — be detailed."
        questions={FOUNDATION_QUESTIONS}
        requiredKeys={['primaryConcern', 'childhoodHealth', 'childhoodAntibiotics', 'recentAntibiotics', 'emotionalBaseline']}
        data={data} update={update} onNext={next} onBack={back}
      />
    );
    if (step === 3) return <VitalsScreen data={data} update={update} onNext={next} onBack={back} />;
    if (step === 4) return (
      <GenericFormScreen
        sectionKey="medical" sectionNumber={4} title="Medical history"
        subtitle="Diagnosed conditions, medications, allergies, weight history. Be detailed — dosages, durations, what you've tried."
        questions={MEDICAL_QUESTIONS}
        requiredKeys={['weightTrend']}
        data={data} update={update} onNext={next} onBack={back}
      />
    );
    if (step === 5) return (
      <GenericFormScreen
        sectionKey="eatingHabits" sectionNumber={5} title="Eating habits"
        subtitle="Your relationship with food, cookware, oral health, and patterns that may be invisible to you."
        questions={EATING_HABITS_QUESTIONS}
        requiredKeys={['hydration', 'eatingSpeed', 'mealRegularity', 'bowelFrequency', 'amalgamFillings', 'dentalHygiene']}
        data={data} update={update} onNext={next} onBack={back}
      />
    );
    if (step === 6) return <FoodDiaryScreen data={data} update={update} onNext={next} onBack={back} />;
    if (step === 7) return (
      <GenericFormScreen
        sectionKey="dailyRhythm" sectionNumber={7} title="Daily rhythm"
        subtitle="Sleep, work, exercise, evenings. The structure of your weekday."
        questions={DAILY_RHYTHM_QUESTIONS}
        requiredKeys={['wakeTime', 'bedtime', 'sleepHours', 'sleepQuality', 'exerciseFrequency', 'screensBeforeBed']}
        data={data} update={update} onNext={next} onBack={back}
      />
    );
    if (step === 8) return (
      <GenericFormScreen
        sectionKey="weekend" sectionNumber={8} title="Weekend variation"
        subtitle="How weekends differ from weekdays often reveals where stress is coming from."
        questions={WEEKEND_QUESTIONS}
        requiredKeys={['weekendWakeTime', 'weekendBedtime', 'weekendMood']}
        data={data} update={update} onNext={next} onBack={back}
      />
    );
    if (step === 9) return <EnergyScreen data={data} update={update} onNext={next} onBack={back} />;
    if (step === 10) return (
      <GenericFormScreen
        sectionKey="work" sectionNumber={10} title="Work & stress"
        subtitle="Work shapes the rest. Be honest about how it lands on you."
        questions={WORK_QUESTIONS}
        requiredKeys={['workEnvironment', 'jobSatisfaction', 'recoveryAfterWork']}
        data={data} update={update} onNext={next} onBack={back}
      />
    );
    if (step >= 11 && step <= 17) {
      const sectionKey = scanOrder[step - 11];
      return (
        <ScanSectionScreen
          sectionKey={sectionKey}
          sectionNumber={step - 3}
          data={data} update={(k, v) => update(k, v)}
          onNext={next} onBack={back}
        />
      );
    }
    return <ReportScreen data={data} onRestart={restart} />;
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.ink, fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
        body { background: ${COLORS.bg}; }
        button:focus-visible { outline: 2px solid ${COLORS.accent}; outline-offset: 2px; }
        input:focus, textarea:focus { outline: none; }
        ::selection { background: ${COLORS.highlight}; color: ${COLORS.ink}; }
      `}</style>
      <Header progress={progress} />
      <main>{renderStep()}</main>
      <footer style={{ borderTop: `1px solid ${COLORS.rule}`, padding: '2rem 1.5rem', marginTop: '4rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: COLORS.inkLight, fontStyle: 'italic' }}>
          Body Compass · A self-reflection tool · Not medical advice
        </p>
      </footer>
    </div>
  );
}
