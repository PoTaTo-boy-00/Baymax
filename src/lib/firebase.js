// This is a placeholder for Firebase integration
// In a real app, you would initialize Firebase here
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const anonymousLogin = async () => {
  // In a real implementation, this would use Firebase anonymous auth
  console.log("Anonymous login initiated");
  return {
    success: true,
    userId: "anonymous-user-" + Math.random().toString(36).substring(2, 9),
  };
};

export const logMoodEntry = async (userId, mood, journal) => {
  // In a real implementation, this would save to Firebase Firestore
  console.log("Logging mood entry for user:", userId);
  console.log("Mood:", mood, "Journal:", journal);
  return { success: true };
};

export const analyzeSentiment = async (text) => {
  // In a real implementation, this would call a sentiment analysis API or Firebase Function
  console.log("Analyzing sentiment for:", text);
  // Simulate a delay for the analysis
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simple mock sentiment analysis
  const words = text.toLowerCase().split(/\s+/);
  const positiveWords = [
    "happy",
    "good",
    "great",
    "excellent",
    "joy",
    "wonderful",
    "positive",
    "love",
    "hope",
  ];
  const negativeWords = [
    "sad",
    "bad",
    "terrible",
    "awful",
    "depressed",
    "negative",
    "anxious",
    "worry",
    "stress",
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) {
    return {
      sentiment: "positive",
      message: "Your mood seems positive. That's great!",
    };
  } else if (negativeCount > positiveCount) {
    return {
      sentiment: "negative",
      message:
        "You seem to be feeling down. Remember it's okay to seek support.",
    };
  } else {
    return {
      sentiment: "neutral",
      message: "Your mood seems neutral or mixed.",
    };
  }
};

//Use environment variables for Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is valid
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For debugging
console.log("Firebase initialized with config:", {
  apiKey: firebaseConfig.apiKey ? "Set" : "Not set",
  authDomain: firebaseConfig.authDomain ? "Set" : "Not set",
  projectId: firebaseConfig.projectId ? "Set" : "Not set",
  storageBucket: firebaseConfig.storageBucket ? "Set" : "Not set",
  messagingSenderId: firebaseConfig.messagingSenderId ? "Set" : "Not set",
  appId: firebaseConfig.appId ? "Set" : "Not set",
});