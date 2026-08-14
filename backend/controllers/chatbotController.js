const asyncHandler = require('express-async-handler');
const fetch = require('node-fetch');
const { calculateBMI, getBMICategory } = require('../utils/bmiUtils');

const SYSTEM_PROMPT_BASE = `You are a friendly, knowledgeable Nutrition Assistant embedded in a nutrition counselling web application used primarily by people in Kenya.

Your role:
- Provide nutrition education, healthy eating advice, BMI interpretation, weight management guidance, meal suggestions, hydration advice, and general healthy lifestyle guidance.
- Personalize your responses using the user profile context provided below.

Meal suggestions:
- Whenever asked for meal ideas, food suggestions, or help planning what to eat, include Kenyan foods and dishes among your suggestions - for example ugali, sukuma wiki, githeri, managu, terere, omena, mukimo, matoke, nyama choma, chapati, mursik, or beans with maize - adapted to fit the user's goals. Don't limit suggestions to Western foods only.
- Where relevant, suggest simple ways to make a traditional dish healthier (less oil, more vegetables, a smaller ugali portion) rather than telling the user to avoid it altogether.

Formatting rules (the chat interface displays plain text, not markdown):
- Do NOT use markdown syntax - no asterisks for bold (**text**), no pound signs for headings (# Heading), no markdown tables.
- Use plain text only. For emphasis, rely on word choice, not symbols.
- Structure longer answers with short paragraphs separated by a blank line, or simple lists using a hyphen "-" at the start of each line with a line break between items.
- Keep responses concise, warm, and practical. Use simple language.

Strict rules:
- You must NEVER diagnose medical conditions or diseases.
- You must NEVER prescribe or recommend specific medications or dosages.
- When a question touches on a possible medical condition, medication, or anything outside general nutrition/lifestyle guidance, recommend the user consult a qualified healthcare professional or book an appointment with the app's nutrition counsellor.
- Do not make up facts about the user beyond what is given in their profile context.`;

const buildUserContext = (user) => {
  const bmi = calculateBMI(user.height, user.weight);
  const category = getBMICategory(bmi);

  return `User Profile Context:
- Age: ${user.age}
- Sex: ${user.sex}
- Height: ${user.height} cm
- Weight: ${user.weight} kg
- BMI: ${bmi} (${category})
- Current medical conditions: ${user.hasCurrentMedicalCondition ? user.currentMedicalConditionDetails || 'Yes (unspecified)' : 'None reported'}
- Family medical history: ${user.hasFamilyMedicalHistory ? user.familyMedicalHistoryDetails || 'Yes (unspecified)' : 'None reported'}
- Balanced diet frequency: ${user.balancedDietFrequency}
- Fruit & vegetable intake frequency: ${user.fruitVegFrequency}
- Fast food / sugary / fatty food frequency: ${user.fastFoodFrequency}
- Meals per day: ${user.mealsPerDay}
- Physical activity: ${user.physicalActivity ? 'Yes' : 'No'}
- Drug use: ${user.drugUse ? user.drugUseDetails || 'Yes (unspecified)' : 'No'}`;
};

// Best-effort strip of common markdown syntax. The system prompt above asks the
// model not to use markdown (the chat UI renders plain text), but this is a
// safety net for the rare reply that slips a **bold** or # heading in anyway.
const stripMarkdownArtifacts = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1') // **bold**
    .replace(/__(.*?)__/g, '$1') // __bold__
    .replace(/(^|\n)#{1,6}\s*/g, '$1') // # Heading
    .replace(/\*(?!\s)(.*?)(?<!\s)\*/g, '$1'); // *italic* (leaves lone "* " bullets alone)

// @desc    Send a message to the AI nutrition chatbot (OpenRouter), personalized with user context
// @route   POST /api/chatbot/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { message, history } = req.body; // history: optional array of { role, content }

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400);
    throw new Error('A message is required');
  }

  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500);
    throw new Error('Chatbot is not configured. Missing OPENROUTER_API_KEY.');
  }

  const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\n${buildUserContext(req.user)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history.slice(-10) : []),
    { role: 'user', content: message },
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || '',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'Nutrition Counselling App',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages,
      temperature: 0.6,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('OpenRouter error:', errText);
    res.status(502);
    throw new Error('The AI chatbot service is currently unavailable. Please try again later.');
  }

  const data = await response.json();
  const rawReply = data?.choices?.[0]?.message?.content?.trim();

  if (!rawReply) {
    res.status(502);
    throw new Error('The AI chatbot did not return a valid response.');
  }

  const reply = stripMarkdownArtifacts(rawReply);

  res.json({ success: true, reply });
});

module.exports = { sendMessage };
