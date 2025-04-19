"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";

export const TherapistMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        // Get all chats where the therapist is involved
        const chatsQuery = query(collection(db, "chats"));
        const chatsSnapshot = await getDocs(chatsQuery);

        const conversationsList = [];

        for (const chatDoc of chatsSnapshot.docs) {
          const chatId = chatDoc.id;

          // Only process chats that involve the current therapist
          if (!chatId.includes(user.uid)) continue;

          // Get the other user's ID
          const patientId = chatId.replace(user.uid, "").replace("_", "");

          // Get patient info
          const patientDoc = await getDocs(
            query(collection(db, "users"), where("uid", "==", patientId))
          );

          let patientInfo = { displayName: "Unknown Patient" };
          if (!patientDoc.empty) {
            patientInfo = patientDoc.docs[0].data();
          }

          // Get the last message
          const messagesQuery = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "desc"),
            limit(1)
          );

          const messagesSnapshot = await getDocs(messagesQuery);

          if (!messagesSnapshot.empty) {
            const lastMessage = messagesSnapshot.docs[0].data();

            conversationsList.push({
              id: chatId,
              patientId,
              patientName: patientInfo.displayName,
              patientPhoto: patientInfo.photoURL,
              lastMessage: lastMessage.text,
              timestamp: lastMessage.timestamp?.toDate() || new Date(),
              unread: lastMessage.senderId !== user.uid && !lastMessage.read,
            });
          }
        }

        // Sort by timestamp (newest first)
        conversationsList.sort((a, b) => b.timestamp - a.timestamp);

        setConversations(conversationsList);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  //   if (loading) {
  //     return (
  //       <div className="space-y-6">
  //         <h1 className="text-3xl font-bold">Messages</h1>
  //         <div className="flex justify-center py-12">
  //           <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  //         </div>
  //       </div>
  //     )
  //   }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>

      <Card>
        <CardHeader>
          <CardTitle>Patient Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length > 0 ? (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    conversation.unread ? "bg-primary/5" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={conversation.patientPhoto || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {conversation.patientName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {conversation.patientName}
                        </h3>
                        {conversation.unread && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(conversation.timestamp, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link
                      to={`/therapist/dashboard/messages/${conversation.patientId}`}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                When patients message you, they'll appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
