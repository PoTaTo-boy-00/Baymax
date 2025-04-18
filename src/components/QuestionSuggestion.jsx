import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// This would normally come from an AI API, but we'll mock it for now
const generateQuestions = (specialties) => {
  const generalQuestions = [
    "What approach do you typically use in therapy?",
    "How do you structure your sessions?",
    "What should I expect from our first few sessions together?",
    "How will we measure progress in our sessions?",
    "What is your cancellation policy?",
    "How long do you typically work with clients?",
    "Do you assign homework or exercises between sessions?",
    "How do you handle confidentiality and privacy?",
  ];

  const specialtyQuestions = {
    Anxiety: [
      "What techniques do you use to help manage anxiety?",
      "How can I recognize when my anxiety is becoming problematic?",
      "Can you help me develop coping strategies for panic attacks?",
    ],
    Depression: [
      "How do you approach treatment for depression?",
      "What are your thoughts on medication versus therapy for depression?",
      "How can I recognize improvements when dealing with depression?",
    ],
    Trauma: [
      "What is your experience with trauma-informed therapy?",
      "How do you help clients process traumatic experiences safely?",
      "What is your approach to PTSD symptoms?",
    ],
    Relationships: [
      "How do you help clients navigate relationship challenges?",
      "What's your approach to couples therapy?",
      "How can therapy help me improve my communication skills?",
    ],
    Addiction: [
      "What is your approach to addiction recovery?",
      "How do you help clients manage cravings and triggers?",
      "What are your thoughts on harm reduction versus abstinence?",
    ],
  };

  // Start with general questions
  let questions = [...generalQuestions];

  // Add specialty-specific questions
  specialties.forEach((specialty) => {
    if (specialtyQuestions[specialty]) {
      questions = [...questions, ...specialtyQuestions[specialty]];
    }
  });

  // Shuffle and return a subset
  return questions.sort(() => 0.5 - Math.random()).slice(0, 8);
};

export function QuestionSuggestions({ therapistSpecialties }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      const generatedQuestions = generateQuestions(therapistSpecialties);
      setQuestions(generatedQuestions);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [therapistSpecialties]);

  const handleCopy = (question) => {
    navigator.clipboard.writeText(question);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this question in your chat",
    });
  };

  const handleFeedback = (index, positive) => {
    setFeedbackGiven((prev) => ({ ...prev, [index]: true }));
    toast({
      title: positive
        ? "Thanks for your feedback!"
        : "We'll improve our suggestions",
      description: positive
        ? "We're glad this question was helpful"
        : "We'll use your feedback to provide better suggestions",
    });
  };

  const handleRegenerateQuestions = () => {
    setLoading(true);
    setFeedbackGiven({});

    // Simulate API call delay
    setTimeout(() => {
      const generatedQuestions = generateQuestions(therapistSpecialties);
      setQuestions(generatedQuestions);
      setLoading(false);
    }, 1500);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Suggested First Session Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-generated questions to help you prepare for your first session
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRegenerateQuestions}
            disabled={loading}
          >
            Regenerate
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 flex-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-4">
            {questions.map((question, index) => (
              <li key={index} className="flex items-start gap-3 group">
                <div className="mt-0.5 h-5 w-5 text-primary flex-shrink-0">
                  •
                </div>
                <div className="flex-1">{question}</div>
                <div className="flex items-center gap-2">
                  {feedbackGiven[index] ? (
                    <span className="text-xs text-muted-foreground">
                      Thanks!
                    </span>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleFeedback(index, true)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleFeedback(index, false)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(question)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
