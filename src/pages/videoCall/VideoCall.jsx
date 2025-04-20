import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendVideoCallNotification } from "../../lib/notifications";
import { useAuth } from "../../../contexts/AuthContext";

export const VideoCall = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipientId, setRecipientId] = useState("");
  const [loading, setLoading] = useState(false);

  const startNewCall = async () => {
    if (!user) return;

    const callId = uuidv4();
    navigate(`/video-call/${callId}`);
  };

  const inviteToCall = async (e) => {
    e.preventDefault();
    if (!user || !recipientId) return;

    setLoading(true);
    try {
      const callId = uuidv4();

      // Send notification to recipient
      await sendVideoCallNotification(
        recipientId,
        callId,
        user.displayName || "Anonymous User"
      );

      // Redirect to call room
      navigate(`/video-call/${callId}`);
    } catch (error) {
      console.error("Error inviting to call:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Anonymous Video Call</CardTitle>
          <CardDescription>
            Start a secure, anonymous video call with a therapist or patient
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={startNewCall} className="w-full">
              Start New Call
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Start a new call and share the link
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or invite someone
              </span>
            </div>
          </div>

          <form onSubmit={inviteToCall} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-id">Recipient ID</Label>
              <Input
                id="recipient-id"
                placeholder="Enter recipient's user ID"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending Invitation..." : "Send Invitation"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-center text-muted-foreground">
            All video calls are end-to-end encrypted and anonymous
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
