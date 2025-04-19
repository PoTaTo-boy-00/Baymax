"use client";

import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export function TherapistButton() {
  const navigate = useNavigate();
  const handleSubmit = () => {
    // Redirect to the therapist matching
    navigate("/therapist");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="rounded-full h-14 w-14 shadow-lg fixed bottom-6 right-6 p-0"
          aria-label="Find Therapists"
        >
          <UserRound className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find a Therapist</DialogTitle>
          <DialogDescription>
            Connect with licensed therapists who can provide professional
            support for your mental health journey.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Our matching system helps you find therapists based on your needs,
            preferences, and goals. All therapists are licensed professionals
            with expertise in various areas of mental health.
          </p>
          <Button onClick={handleSubmit} className="w-full">
            Start Matching Process
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
