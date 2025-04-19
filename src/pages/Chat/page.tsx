// import React from 'react'

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

interface ChatPartner {
  id: string;
  displayName: string;
  photoURL?: string;
  role: "therapist" | "patient";
}

export const ChatPage = () => {
  const therapistId = useParams().therapistId as string;
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchChatPartner = async () => {
      try {
        const partnerDoc = await getDoc(
          doc(db, "users", therapistId as string)
        );

        if (!partnerDoc.exists()) {
          navigate("/therapists");
          return;
        }

        const data = partnerDoc.data();
        setChatPartner({
          id: partnerDoc.id,
          displayName: data.displayName || "Unknown User",
          photoURL: data.photoURL,
          role: data.role,
        });
      } catch (error) {
        console.error("Error fetching chat partner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatPartner();
  }, [therapistId, navigate, user, authLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !chatPartner) return;

    // Create a unique chat ID based on the two user IDs
    const chatId = [user.uid, chatPartner.id].sort().join("_");

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      });

      setMessages(messagesList);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user, chatPartner, messages, scrollToBottom]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newMessage.trim() ||
      !user ||
      !chatPartner ||
      newMessage.length > 500
    ) {
      setError("Message cannot be empty or exceed 500 characters.");
      return;
    }

    // Create a unique chat ID based on the two user IDs
    const chatId = [user.uid, chatPartner.id].sort().join("_");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        receiverId: chatPartner.id,
        text: newMessage,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading || !chatPartner) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={chatPartner.photoURL || "/placeholder.svg"}
                alt={chatPartner.displayName}
              />
              <AvatarFallback>
                {chatPartner.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{chatPartner.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {chatPartner.role === "therapist" ? "Therapist" : "Patient"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[60vh] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-sm text-muted-foreground">
                  Send a message to start the conversation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isCurrentUser = message.senderId === user?.uid;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p>{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isCurrentUser
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(message.timestamp, "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
