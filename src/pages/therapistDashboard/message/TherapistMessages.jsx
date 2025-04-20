import { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  limit,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../../contexts/AuthContext";
import { SidebarNav } from "../../../components/therapist-dashboard/SidebarNav";
import { DashboardLayout } from "../Layout";
import Navbar from "../../../components/Navbar";

export const TherapistMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid)
        );

        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const conversationsList = [];

          for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();
            const chatId = chatDoc.id;

            const patientId = chatData.participants.find(
              (id) => id !== user.uid
            );
            if (!patientId) continue;

            const patientDoc = await getDoc(doc(db, "users", patientId));
            if (!patientDoc.exists()) continue;

            const patientData = patientDoc.data();

            const messagesQuery = query(
              collection(db, "chats", chatId, "messages"),
              limit(1)
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            if (messagesSnapshot.empty) continue;

            const lastMessage = messagesSnapshot.docs[0].data();

            const unreadQuery = query(
              collection(db, "chats", chatId, "messages"),
              where("senderId", "==", patientId),
              where("read", "==", false)
            );
            const unreadSnapshot = await getDocs(unreadQuery);
            const unreadCount = unreadSnapshot.size;

            conversationsList.push({
              id: chatId,
              patientId,
              patientName: patientData.displayName || "Unknown Patient",
              patientPhoto: patientData.photoURL,
              lastMessage: lastMessage.text,
              timestamp: lastMessage.timestamp?.toDate() || new Date(),
              unread: unreadCount > 0,
              unreadCount,
              updatedAt: chatData.updatedAt?.toDate() || new Date(),
            });
          }

          conversationsList.sort((a, b) => b.updatedAt - a.updatedAt);

          setConversations(conversationsList);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <DashboardLayout>
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
                          <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                            {conversation.unreadCount}
                          </span>
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
    </DashboardLayout></>
  );
};
