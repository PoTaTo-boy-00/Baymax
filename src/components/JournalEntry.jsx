import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function JournalEntry({ onSubmit, isAnalyzing }) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (text.trim()) {
      await onSubmit(text);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <Textarea
        placeholder="How are you feeling today? What's on your mind?"
        className="min-h-[150px] resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isAnalyzing}
      />
      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={!text.trim() || isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze & Log"
        )}
      </Button>
    </div>
  );
}
