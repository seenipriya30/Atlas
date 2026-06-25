import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to make requests to Groq API
async function callGroqAPI(messages, jsonMode = true) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables.");
  }

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: messages,
    temperature: 0.5,
  };

  if (jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  if (jsonMode) {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON response from Groq:", content);
      throw new Error("Invalid JSON structure returned by the AI. Please try again.");
    }
  }
  
  return content;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", groqConfigured: !!process.env.GROQ_API_KEY });
});

// Explain Topic Endpoint
app.post('/api/explain', async (req, res) => {
  const { topic, level } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const targetLevel = level || "High School";
  
  const systemPrompt = `You are an elite, highly engaging educator. 
Explain the requested topic tailored to the following level: "${targetLevel}".
If the level is "ELI5", explain it as if explaining to a 5-year old, using extremely simple words, toys, or playground concepts.
If the level is "High School", use relatable analogies, standard terms, and focus on practical intuition.
If the level is "University", go deeper, explain the underlying theory, mechanisms, and key nuances.
If the level is "Expert", write at a peer-review paper or high professional level, outlining cutting-edge developments, technical limits, and formal math/theory if applicable.

You MUST return a JSON object with exactly the following structure:
{
  "overview": "A clear, concise, paragraph-level explanation of the topic.",
  "analogy": "A relatable, memorable analogy describing how the concept works.",
  "keyConcepts": [
    { "title": "Concept Name 1", "description": "Brief description of this sub-concept." },
    { "title": "Concept Name 2", "description": "Brief description of this sub-concept." }
  ],
  "application": "How this is used in the real world or its practical significance."
}`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please explain this topic: ${topic}` }
    ];
    
    const explanation = await callGroqAPI(messages, true);
    res.json(explanation);
  } catch (error) {
    console.error("Error in /api/explain:", error);
    res.status(500).json({ error: error.message });
  }
});

// Summarize Notes Endpoint
app.post('/api/summarize', async (req, res) => {
  const { notes, length, includeGlossary } = req.body;
  if (!notes) {
    return res.status(400).json({ error: "Notes content is required" });
  }

  const summaryLength = length || "medium";
  const glossaryRequired = includeGlossary !== false;

  const systemPrompt = `You are a professional study assistant. Your task is to summarize the provided notes or text.
Tailor the summary length to: "${summaryLength}" (short = brief snapshot, medium = balanced summary, detailed = comprehensive key elements).
Extract key takeaways, and if requested, generate a glossary of important terms.

You MUST return a JSON object with exactly the following structure:
{
  "summary": "A cohesive summary of the text matching the requested length.",
  "takeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "glossary": ${glossaryRequired ? `[
    { "term": "Term Name", "definition": "Clear explanation of the term based on context" }
  ]` : '[]'}
}`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is the text to summarize:\n\n${notes}` }
    ];

    const summary = await callGroqAPI(messages, true);
    res.json(summary);
  } catch (error) {
    console.error("Error in /api/summarize:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Quiz Endpoint
app.post('/api/generate-quiz', async (req, res) => {
  const { topic, notes, numQuestions = 5 } = req.body;
  
  if (!topic && !notes) {
    return res.status(400).json({ error: "Either topic or notes is required to generate a quiz." });
  }

  const contentSource = notes ? `these notes:\n\n${notes}` : `the topic "${topic}"`;

  const systemPrompt = `You are an educational assessment expert. Create an interactive quiz with exactly ${numQuestions} questions.
Include a mix of multiple choice (4 options) and true/false (2 options: True/False) questions.
Ensure they test understanding, not just rote memorization.

You MUST return a JSON object with exactly the following structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Clear question text?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "Brief educational description of why Option B is correct and others are not."
    },
    {
      "id": 2,
      "question": "Is this statement correct or incorrect?",
      "type": "true_false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Brief explanation of the fact."
    }
  ]
}`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please generate a quiz based on ${contentSource}` }
    ];

    const quiz = await callGroqAPI(messages, true);
    res.json(quiz);
  } catch (error) {
    console.error("Error in /api/generate-quiz:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Flashcards Endpoint
app.post('/api/generate-flashcards', async (req, res) => {
  const { topic, notes, numCards = 6 } = req.body;

  if (!topic && !notes) {
    return res.status(400).json({ error: "Either topic or notes is required to generate flashcards." });
  }

  const contentSource = notes ? `these notes:\n\n${notes}` : `the topic "${topic}"`;

  const systemPrompt = `You are a micro-learning expert. Create a deck of exactly ${numCards} educational flashcards.
The questions on the front should be clear and prompt active recall.
The answers on the back should be concise, crisp, and informative.

You MUST return a JSON object with exactly the following structure:
{
  "flashcards": [
    {
      "id": 1,
      "question": "What is the primary role of mitochondria in a cell?",
      "answer": "To generate chemical energy in the form of ATP through cellular respiration."
    },
    {
      "id": 2,
      "question": "How does photosynthesis differ from cellular respiration?",
      "answer": "Photosynthesis stores solar energy in glucose (anabolic), whereas cellular respiration breaks down glucose to release energy (catabolic)."
    }
  ]
}`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please generate flashcards based on ${contentSource}` }
    ];

    const deck = await callGroqAPI(messages, true);
    res.json(deck);
  } catch (error) {
    console.error("Error in /api/generate-flashcards:", error);
    res.status(500).json({ error: error.message });
  }
});

// Chat/Interactive Tutor Endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const systemPrompt = `You are a supportive, friendly, and expert AI Study Buddy tutor. 
Your goal is to help the student learn. Keep answers clear, supportive, and relatively concise. 
If they ask about math, science, history, coding, or any subject, provide clear formatting, lists, or code blocks where appropriate.
Ask them questions to prompt critical thinking. Feel free to use emojis to make the learning process fun!`;

  try {
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const reply = await callGroqAPI(formattedMessages, false); // Chat response, not JSON mode
    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Study Buddy Server is running on port ${PORT}`);
});
