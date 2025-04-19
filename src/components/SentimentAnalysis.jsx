import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sentimentColors = {
  positive: "text-green-600",
  neutral: "text-blue-600",
  negative: "text-amber-600",
};

export const SentimentAnalysis = ({
  sentiment,
  analysis,
  support,
  suggestion,
  affirmation,
}) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">
          <span className={sentimentColors[sentiment]}>
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Mood
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-2">Support:</p>
          <p>{support}</p>
        </div>

        <div className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
          <p className="font-medium mb-2">Remember:</p>
          <p>{affirmation}</p>
        </div>
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-2">Suggestions:</p>
          <p>{suggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
};
