import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodSelector } from "@/components/MoodSelector";
import { JournalEntry } from "@/components/JournalEntry";
import { SentimentAnalysis } from "@/components/SentimentAnalysis";
import { logMoodEntry } from "@/lib/firebase";
import { analyzeWithGemini } from "@/lib/gemini";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import baymax from "../../assets/images/baymaxSort.png";
import Navbar from "../../components/Navbar";

const UserDashboard = () => {
  const [userId, setUserId] = useState(null);
  const [selectedMood, setSelectedMood] = useState(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState(null);

  const navigate = useNavigate();

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
        description: "Select how you're feeling before submitting your journal entry.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analyzeWithGemini(text, selectedMood);
      setGeminiResponse(response);

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
        description: "There was a problem analyzing your entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTherapistClick = () => {
    navigate("/therapist");
  };

  return (
    <>
    
    <div className="bg-gradient-to-r from-indigo-100 to-indigo-300 min-h-screen flex items-center justify-center">
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div className="max-w-md mx-auto space-y-6 pb-20 z-10">
          <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
            Baymax
          </h1>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
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

          <Button
            onClick={handleTherapistClick}
            className="w-full h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 ease-in-out rounded-xl mt-4"
          >
            Find me a Therapist
          </Button>
        </div>

        <div
          style={{
            width: "40%",
            position: "absolute",
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            padding: "2rem",
          }}
        >
          <img
            src={baymax}
            alt="Baymax waving hi"
            style={{
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
              transform: "translateX(10%)",
            }}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default UserDashboard;
