import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

// import { useAuth } from "../../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { db } from "../../lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { PatientRequests } from "./patientRequest/PatientRequest";
import { TherapistMessages } from "./message/TherapistMessages";
import { TherapistChatPage } from "./message/TherapistChatPage";
import { DashboardLayout } from "./Layout";
import { SidebarNav } from "@/components/therapist-dashboard/SidebarNav";

export const TherapistDashboardPage = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch all appointments for this therapist (simpler query)
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("therapistId", "==", user.uid)
        );

        const appointmentsSnapshot = await getDocs(appointmentsQuery);

        const requestsList = [];
        const appointmentsList = [];
        const uniquePatients = new Set();

        // Process all appointments and filter on the client side
        appointmentsSnapshot.forEach((doc) => {
          const data = doc.data();
          uniquePatients.add(data.patientId);

          // For pending requests
          if (data.status === "pending") {
            requestsList.push({
              id: doc.id,
              patientName: data.patientName,
              date: data.date,
              time: data.time,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          }

          // For upcoming appointments
          const today = new Date().toISOString().split("T")[0];
          if (
            data.date >= today &&
            (data.status === "scheduled" || data.status === "accepted")
          ) {
            appointmentsList.push({
              id: doc.id,
              patientName: data.patientName,
              date: data.date,
              time: data.time,
            });
          }
        });

        // Sort the lists manually
        requestsList.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        appointmentsList.sort((a, b) => {
          // Sort by date first
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          // Then by time
          return a.time.localeCompare(b.time);
        });

        setPendingRequests(requestsList.slice(0, 3)); // Limit to 3
        setUpcomingAppointments(appointmentsList.slice(0, 5)); // Limit to 5
        setPatientCount(uniquePatients.size);

        // Fetch recent messages (this part remains the same)
        const chatsQuery = query(collection(db, "chats"), limit(10));
        const chatsSnapshot = await getDocs(chatsQuery);
        const messagesList = [];

        for (const chatDoc of chatsSnapshot.docs) {
          const chatId = chatDoc.id;

          // Only process chats that involve the current therapist
          if (!chatId.includes(user.uid)) continue;

          const messagesQuery = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "desc"),
            limit(5)
          );

          const messagesSnapshot = await getDocs(messagesQuery);

          messagesSnapshot.forEach((doc) => {
            const data = doc.data();

            // Only include messages sent to the therapist
            if (data.receiverId === user.uid) {
              messagesList.push({
                id: doc.id,
                senderName: data.senderName,
                text: data.text,
                timestamp: data.timestamp?.toDate() || new Date(),
                read: data.read || false,
              });
            }
          });
        }

        // Sort by timestamp and limit to 5
        messagesList.sort((a, b) => b.timestamp - a.timestamp);
        setRecentMessages(messagesList.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout sidebarNav={<SidebarNav />}>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Patient Requests</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Bell className="h-6 w-6 text-primary" />
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Patients</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Users className="h-6 w-6 text-primary" />
            <div className="text-3xl font-bold">{patientCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Sessions</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-primary" />
            <div className="text-3xl font-bold">
              {upcomingAppointments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unread Messages</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div className="text-3xl font-bold">
              {recentMessages.filter((msg) => !msg.read).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>New Patient Requests</CardTitle>
              <CardDescription>
                Patients waiting for your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.patientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.date), "MMM d")} at{" "}
                          {request.time}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/therapist-dashboard/patient-requests">
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/therapist-dashboard/patient-requests">
                    View All Requests
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your scheduled sessions for the next few days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {appointment.patientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(appointment.date), "MMM d")} at{" "}
                          {appointment.time}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`/therapist-dashboard/appointments/${appointment.id}`}
                      >
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/therapist-dashboard/appointments">
                    View All Appointments
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  No upcoming appointments
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>
              Latest messages from your patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {message.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium flex items-center gap-2">
                          {message.senderName}
                          {!message.read && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(message.timestamp, "MMM d, h:mm a")}
                        </p>
                      </div>
                      <p className="text-sm truncate">{message.text}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/therapist-dashboard/messages">
                    View All Messages
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No recent messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* <PatientRequests /> */}
      <TherapistMessages />
      {/* <TherapistChatPage /> */}
    </div>
    </DashboardLayout>
  );
}