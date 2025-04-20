import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { format, isPast } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";

// UI Components (you'll need to adapt these to your UI library or use plain components)
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "patient") {
      navigate("/");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("patientId", "==", user.uid)
        );

        const snapshot = await getDocs(appointmentsQuery);
        const appointmentsList = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          appointmentsList.push({
            id: doc.id,
            therapistId: data.therapistId,
            therapistName: data.therapistName,
            date: data.date,
            time: data.time,
            sessionType: data.sessionType,
            notes: data.notes,
            status: data.status,
            createdAt: data.createdAt,
          });
        });

        appointmentsList.sort((a, b) => {
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          return a.time.localeCompare(b.time);
        });

        setAppointments(appointmentsList);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, authLoading, navigate]);

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;

    setCancelLoading(true);
    try {
      await updateDoc(doc(db, "appointments", selectedAppointment.id), {
        status: "cancelled",
        cancelReason,
        cancelledBy: "patient",
        cancelledAt: new Date().toISOString(),
      });

      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: "cancelled" }
            : apt
        )
      );

      setCancelDialogOpen(false);
      setCancelReason("");
      setSelectedAppointment(null);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      setError("Failed to cancel appointment. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadgeVariant = (status, date, time) => {
    const appointmentDate = new Date(`${date}T${time}`);
    const isPastAppointment = isPast(appointmentDate);

    if (status === "pending") return "outline";
    if (status === "accepted") return "success";
    if (status === "rejected") return "destructive";
    if (status === "cancelled") return "destructive";
    if (status === "completed") return "secondary";

    return isPastAppointment ? "secondary" : "success";
  };

  const getStatusLabel = (status, date, time) => {
    const appointmentDate = new Date(`${date}T${time}`);
    const isPastAppointment = isPast(appointmentDate);

    if (status === "pending") return "Pending Approval";
    if (status === "accepted") return "Confirmed";
    if (status === "rejected") return "Declined";
    if (status === "cancelled") return "Cancelled";
    if (status === "completed") return "Completed";

    return isPastAppointment ? "Past" : "Upcoming";
  };

  const upcomingAppointments = appointments.filter(
    (apt) =>
      !isPast(new Date(`${apt.date}T${apt.time}`)) &&
      (apt.status === "accepted" || apt.status === "scheduled")
  );

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending"
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      isPast(new Date(`${apt.date}T${apt.time}`)) ||
      ["rejected", "cancelled", "completed"].includes(apt.status)
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past & Cancelled ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">
                              Session with {appointment.therapistName}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground mt-1">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                <span>
                                  {format(
                                    new Date(appointment.date),
                                    "EEEE, MMMM d, yyyy"
                                  )}{" "}
                                  at {appointment.time}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4" />
                                <span>{appointment.sessionType} Session</span>
                              </div>
                            </div>
                            {appointment.notes && (
                              <p className="mt-2 text-sm bg-muted p-2 rounded">
                                <span className="font-medium">Notes:</span>{" "}
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/chat/${appointment.therapistId}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any upcoming appointments scheduled
                </p>
                <Button asChild>
                  <Link to="/therapist">Find a Therapist</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingAppointments.length > 0 ? (
              <div className="space-y-4">
                {pendingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">
                                Session with {appointment.therapistName}
                              </h3>
                              <Badge variant="outline">Pending Approval</Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground mt-1">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                <span>
                                  {format(
                                    new Date(appointment.date),
                                    "EEEE, MMMM d, yyyy"
                                  )}{" "}
                                  at {appointment.time}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4" />
                                <span>{appointment.sessionType} Session</span>
                              </div>
                            </div>
                            {appointment.notes && (
                              <p className="mt-2 text-sm bg-muted p-2 rounded">
                                <span className="font-medium">Notes:</span>{" "}
                                {appointment.notes}
                              </p>
                            )}
                            <p className="mt-2 text-sm text-muted-foreground">
                              Waiting for therapist to confirm this appointment
                              request.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/chat/${appointment.therapistId}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment)}
                          >
                            Cancel Request
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  No pending requests
                </h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any pending appointment requests
                </p>
                <Button asChild>
                  <Link to="/therapist">Find a Therapist</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-muted rounded-full">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">
                                Session with {appointment.therapistName}
                              </h3>
                              <Badge
                                variant={getStatusBadgeVariant(
                                  appointment.status,
                                  appointment.date,
                                  appointment.time
                                )}
                              >
                                {getStatusLabel(
                                  appointment.status,
                                  appointment.date,
                                  appointment.time
                                )}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground mt-1">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                <span>
                                  {format(
                                    new Date(appointment.date),
                                    "EEEE, MMMM d, yyyy"
                                  )}{" "}
                                  at {appointment.time}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4" />
                                <span>{appointment.sessionType} Session</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                          {/* <Button variant="outline" size="sm" asChild>
                            <Link to={`/chat/${appointment.therapistId}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Link>
                          </Button> */}
                          {/* {appointment.status !== "cancelled" &&
                            appointment.status !== "rejected" && (
                              <Button variant="secondary" size="sm" asChild>
                                <Link
                                  to={`/therapist/${appointment.therapistId}`}
                                >
                                  Book Again
                                </Link>
                              </Button>
                            )} */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  No past appointments
                </h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any past or cancelled appointments
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Appointment Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your appointment with{" "}
                {selectedAppointment?.therapistName} on{" "}
                {selectedAppointment &&
                  format(
                    new Date(selectedAppointment.date),
                    "MMMM d, yyyy"
                  )}{" "}
                at {selectedAppointment?.time}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="cancelReason">
                  Reason for cancellation (optional)
                </Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelAppointment}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Appointment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
