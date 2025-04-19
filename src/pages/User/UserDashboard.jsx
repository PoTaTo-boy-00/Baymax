import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodSelector } from "@/components/MoodSelector";
import { JournalEntry } from "@/components/JournalEntry";
import { SentimentAnalysis } from "@/components/SentimentAnalysis";
import { TherapistButton } from "@/components/TherapistButton";
import { logMoodEntry } from "@/lib/firebase";
import { analyzeWithGemini } from "@/lib/gemini";
import { toast } from "@/components/ui/use-toast";

const UserDashboard = () => {
  const [userId, setUserId] = useState(null);
  const [selectedMood, setSelectedMood] = useState(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("baymax:userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    const moodLabels = { happy: "Happy", neutral: "Neutral", sad: "Sad" };
    toast({
      title: "Mood selected",
      description: `You're feeling ${moodLabels[mood]} today.`,
      duration: 2000,
    });
  };

  const handleJournalSubmit = async (text) => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description:
          "Select how you're feeling before submitting your journal entry.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Call Gemini for analysis
      const response = await analyzeWithGemini(text, selectedMood);
      setGeminiResponse(response);

      // Log to Firebase
      if (userId) {
        await logMoodEntry(
          userId,
          selectedMood,
          text,
          response.sentiment,
          response.affirmation,
          response.suggestion
        );
      }
    } catch (error) {
      console.error("Error analyzing or logging:", error);
      toast({
        title: "Error",
        description:
          "There was a problem analyzing your entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // console.log(geminiResponse.affirmation);
  // console.log(geminiResponse.suggestion);

  return (
    <div className="min-h-screen bg-fuchsia-100 p-4">
      <div className="max-w-md mx-auto space-y-6 pb-20">
        <h1 className="text-2xl font-bold text-center text-green-400 mb-6">
          Baymax
        </h1>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-center">
              Talk to me about your day
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MoodSelector
              onSelect={handleSelectMood}
              selectedMood={selectedMood}
            />
            <JournalEntry
              onSubmit={handleJournalSubmit}
              isAnalyzing={isAnalyzing}
              disabled={!selectedMood}
            />
          </CardContent>
        </Card>

        {geminiResponse && (
          <SentimentAnalysis
            sentiment={geminiResponse.sentiment}
            analysis={geminiResponse.analysis}
            support={geminiResponse.support}
            affirmation={geminiResponse.affirmation}
            suggestion={geminiResponse.suggestion}
          />
        )}
      </div>

      <TherapistButton />
    </div>
  );
};

export default UserDashboard;
