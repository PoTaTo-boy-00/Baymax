import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export const VideoCallRoom = () => {
  const { callId } = useParams();
  const { user } = useAuth();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // This is a placeholder for a real WebRTC implementation
  // In a real app, you would use a WebRTC library like Simple-Peer or Twilio

  useEffect(() => {
    if (!user) return;

    // Here you would initialize your WebRTC connection
    console.log(`Initializing call ${callId} for user ${user.uid}`);

    return () => {
      // Cleanup WebRTC connection
      console.log("Cleaning up call connection");
    };
  }, [callId, user]);

  const toggleAudio = () => setIsAudioEnabled(!isAudioEnabled);
  const toggleVideo = () => setIsVideoEnabled(!isVideoEnabled);
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const endCall = () => {
    // In a real app, you would close the WebRTC connection
    window.location.href = "/";
  };

  return (
    <div className="container py-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Anonymous Video Call</CardTitle>
          <CardDescription>Call ID: {callId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local video */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              {isVideoEnabled ? (
                <p>Your video would appear here</p>
              ) : (
                <p>Camera is off</p>
              )}
            </div>

            {/* Remote video */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p>Waiting for other participant...</p>
            </div>
          </div>

          {/* Chat area (simplified) */}
          {isChatOpen && (
            <div className="mt-4 border rounded-lg p-4 h-40 overflow-y-auto">
              <p className="text-center text-muted-foreground">
                Chat messages would appear here
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant={isAudioEnabled ? "outline" : "secondary"}
            size="icon"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={isVideoEnabled ? "outline" : "secondary"}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="destructive" size="icon" onClick={endCall}>
            <PhoneOff className="h-4 w-4" />
          </Button>
          <Button
            variant={isChatOpen ? "secondary" : "outline"}
            size="icon"
            onClick={toggleChat}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
