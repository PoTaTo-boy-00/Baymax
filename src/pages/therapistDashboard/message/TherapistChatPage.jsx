"use client";

import { useEffect, useState, useRef } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../../../contexts/AuthContext";
import { useParams } from "react-router-dom";

export const TherapistChatPage = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const messagesEndRef = useRef(null);

  console.log(patientId);
  useEffect(() => {
    if (!user) return;

    const fetchPatientAndMessages = async () => {
      try {
        // Get patient info
        const patientDoc = await getDoc(doc(db, "users", patientId));

        if (patientDoc.exists()) {
          setPatient({
            id: patientDoc.id,
            ...patientDoc.data(),
          });
        }

        // Create a unique chat ID based on the two user IDs
        const chatId = [user.uid, patientId].sort().join("_");

        // Listen for messages
        const messagesQuery = query(
          collection(db, "chats", chatId, "messages"),
          orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messagesList = [];
          snapshot.forEach((doc) => {
            const data = doc.data();

            // Mark messages as read if they're from the patient
            if (data.senderId === patientId && !data.read) {
              updateDoc(doc.ref, { read: true });
            }

            messagesList.push({
              id: doc.id,
              senderId: data.senderId,
              senderName: data.senderName,
              text: data.text,
              timestamp: data.timestamp?.toDate() || new Date(),
              read: data.read || false,
            });
          });

          setMessages(messagesList);
          scrollToBottom();
        });

        // Fetch appointments with this patient
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("therapistId", "==", user.uid),
          where("patientId", "==", patientId),
          orderBy("date", "desc")
        );

        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsList = [];

        appointmentsSnapshot.forEach((doc) => {
          const data = doc.data();
          appointmentsList.push({
            id: doc.id,
            date: data.date,
            time: data.time,
            status: data.status,
            notes: data.notes,
            sessionType: data.sessionType,
          });
        });

        setAppointments(appointmentsList);

        setLoading(false);

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchPatientAndMessages();
  }, [user, patientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !patient) return;

    // Create a unique chat ID based on the two user IDs
    const chatId = [user.uid, patientId].sort().join("_");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        receiverId: patientId,
        text: newMessage,
        timestamp: serverTimestamp(),
        read: false,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
  //       <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  //     </div>
  //   );
  // }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">Patient Not Found</h2>
        <p className="text-muted-foreground">
          This patient doesn't exist or you don't have access
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chat with {patient.displayName}</h1>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="notes">Patient Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={patient.photoURL || "/placeholder.svg"}
                    alt={patient.displayName}
                  />
                  <AvatarFallback>
                    {patient.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{patient.displayName}</CardTitle>
                  <p className="text-sm text-muted-foreground">Patient</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
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
                    const isCurrentUser = message.senderId === user.uid;

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
                          <div
                            className={`flex items-center justify-between text-xs mt-1 ${
                              isCurrentUser
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>{format(message.timestamp, "h:mm a")}</span>
                            {isCurrentUser && (
                              <span>{message.read ? "Read" : "Sent"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
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
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {format(new Date(appointment.date), "MMMM d, yyyy")}{" "}
                            at {appointment.time}
                          </h3>
                          <div
                            className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === "scheduled" ||
                              appointment.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : appointment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Session Type: {appointment.sessionType}
                        </p>
                        {appointment.notes && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <p className="font-medium">Notes:</p>
                            <p>{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No appointments with this patient
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Patient Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Patient notes feature coming soon
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll be able to keep private notes about your sessions with
                  this patient
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};
