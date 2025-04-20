import { AutoTokenizer, AutoModelForCausalLM } from "@xenova/transformers";

// Initialize the model
let SNEHA;
let SNEHA_tokenizer;

async function loadModel() {
  console.log("Loading SNEHA model...");
  SNEHA_tokenizer = await AutoTokenizer.from_pretrained(
    "TurkuNLP/gpt3-finnish-large"
  );
  SNEHA = await AutoModelForCausalLM.from_pretrained(
    "TurkuNLP/gpt3-finnish-large"
  );
  console.log("SNEHA model loaded successfully!");
}

export const analyzeWithSNEHA = async (journalText, mood) => {
  try {
    if (!SNEHA) await loadModel();

    const prompt = `As a compassionate mental health companion, analyze this journal entry where the user reports feeling ${mood}:

    "${journalText}"

    Respond with STRICT JSON containing these exact fields:
    {
      "sentiment": "positive|neutral|negative",
      "analysis": "2-3 sentence psychological insight",
      "support": "personalized validation message",
      "suggestion": "one concrete, actionable self-care activity",
      "affirmation": "one uplifting message to remember (15 words max)"
    }

    Guidelines:
    - Affirmation should be empowering yet realistic
    - Use second-person ("You") for direct connection
    - Avoid toxic positivity
    - For negative sentiment, emphasize resilience`;

    const inputs = await SNEHA_tokenizer(prompt, { return_tensors: "pt" });
    const outputs = await SNEHA.generate(inputs, {
      max_length: 500,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      num_return_sequences: 1,
    });

    const text = await SNEHA_tokenizer.decode(outputs[0], {
      skip_special_tokens: true,
    });

    // Extract and clean JSON
    const jsonString = text.replace(/```(json)?/g, "").trim();
    const analysis = JSON.parse(jsonString);

    return validateResponse(analysis, mood);
  } catch (error) {
    console.error("SNEHA error:", error);
    return generateLocalAnalysis(journalText, mood);
  }
};

// The rest of your existing helper functions can remain exactly the same
function validateResponse(response, mood) {
  const defaults = {
    positive: {
      sentiment: "positive",
      analysis: "Your writing reflects positive energy and awareness.",
      support: "It's wonderful to see you recognizing these good moments.",
      suggestion:
        "Consider journaling about what contributed to these positive feelings.",
      affirmation: "You cultivate positivity through your awareness.",
    },
    neutral: {
      sentiment: "neutral",
      analysis: "You're observing your experiences with balanced perspective.",
      support: "Noticing without judgment is an important mindfulness skill.",
      suggestion:
        "Try a brief body scan meditation to connect with your feelings.",
      affirmation: "Your presence in this moment matters.",
    },
    negative: {
      sentiment: "negative",
      analysis:
        "You're expressing some challenging emotions that deserve care.",
      support: "These feelings are valid and temporary—you're not alone.",
      suggestion: "Place a hand on your heart and take three deep breaths.",
      affirmation: "This difficulty is shaping your strength.",
    },
  };

  return {
    sentiment: response.sentiment || defaults[mood]?.sentiment || "neutral",
    analysis:
      response.analysis ||
      defaults[mood]?.analysis ||
      "Thank you for sharing your reflections.",
    support:
      response.support || defaults[mood]?.support || "Your feelings matter.",
    suggestion:
      response.suggestion ||
      defaults[mood]?.suggestion ||
      "Take three mindful breaths.",
    affirmation:
      response.affirmation ||
      defaults[mood]?.affirmation ||
      "You're worthy of care.",
  };
}

function generateLocalAnalysis(text, mood) {
  const sentiment = analyzeSentimentLocally(text);
  const templates = getResponseTemplates(sentiment);

  return {
    sentiment,
    analysis: templates.analysis,
    support: templates.support,
    suggestion:
      templates.suggestions[
        Math.floor(Math.random() * templates.suggestions.length)
      ],
    affirmation:
      templates.affirmations[
        Math.floor(Math.random() * templates.affirmations.length)
      ],
  };
}

function analyzeSentimentLocally(text) {
  const positiveWords = [
    "happy",
    "good",
    "joy",
    "love",
    "peace",
    "calm",
    "grateful",
  ];
  const negativeWords = [
    "sad",
    "bad",
    "stress",
    "anxious",
    "angry",
    "tired",
    "hurt",
  ];

  const posCount = positiveWords.filter((word) =>
    text.toLowerCase().includes(word)
  ).length;
  const negCount = negativeWords.filter((word) =>
    text.toLowerCase().includes(word)
  ).length;

  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral";
}

function getResponseTemplates(sentiment) {
  const allTemplates = {
    positive: {
      analysis: "Your words reflect positive energy and appreciation.",
      support: "Celebrate these good feelings—they're worth noticing!",
      suggestions: [
        "Write down three things you're grateful for today.",
        "Share your positive energy with someone else.",
        "Take a moment to savor this good feeling.",
      ],
      affirmations: [
        "Your joy matters and spreads to others.",
        "You attract positivity through your awareness.",
        "Good moments grow when you notice them.",
      ],
    },
    neutral: {
      analysis: "You're observing your experiences with thoughtful balance.",
      support: "Not every day needs a strong emotional label.",
      suggestions: [
        "Try a five-minute mindfulness exercise.",
        "Go for a brief walk without distractions.",
        "Drink some water and check in with your body.",
      ],
      affirmations: [
        "You're exactly where you need to be right now.",
        "Your journey unfolds at the perfect pace.",
        "Small moments of awareness create big changes.",
      ],
    },
    negative: {
      analysis: "You're processing some difficult but important emotions.",
      support: "Hard feelings are part of being human—you're not alone.",
      suggestions: [
        "Try the 4-7-8 breathing technique (inhale 4, hold 7, exhale 8).",
        "Write your feelings on paper then safely tear it up.",
        "Place a hand where you feel the emotion in your body.",
      ],
      affirmations: [
        "This difficulty is temporary and you are resilient.",
        "You've survived 100% of your bad days so far.",
        "Healing isn't linear—each feeling is part of the process.",
      ],
    },
  };

  return allTemplates[sentiment] || allTemplates.neutral;
}
