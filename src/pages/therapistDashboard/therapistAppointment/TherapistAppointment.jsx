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
// import { useAuth } from "@contexts/AuthContext";
import {
  format,
  isPast,
  isToday,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import {
  Clock,
  MapPin,
  MessageSquare,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// UI Components
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../../../../contexts/AuthContext";
import Navbar from "../../../components/Navbar";

export const Appointments = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list"); // "list" or "calendar"
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "therapist") {
      navigate("/");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("therapistId", "==", user.uid)
        );

        const snapshot = await getDocs(appointmentsQuery);
        const appointmentsList = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          appointmentsList.push({
            id: doc.id,
            patientId: data.patientId,
            patientName: data.patientName,
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
        cancelledBy: "therapist",
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

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: "completed" } : apt
        )
      );
    } catch (err) {
      console.error("Error marking appointment as completed:", err);
      setError("Failed to update appointment status. Please try again.");
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

    if (status === "pending") return "Pending";
    if (status === "accepted") return "Confirmed";
    if (status === "rejected") return "Declined";
    if (status === "cancelled") return "Cancelled";
    if (status === "completed") return "Completed";

    return isPastAppointment ? "Past" : "Upcoming";
  };

  const todayAppointments = appointments.filter(
    (apt) =>
      isToday(new Date(`${apt.date}T${apt.time}`)) &&
      (apt.status === "accepted" || apt.status === "scheduled")
  );

  const upcomingAppointments = appointments.filter(
    (apt) =>
      !isPast(new Date(`${apt.date}T${apt.time}`)) &&
      !isToday(new Date(`${apt.date}T${apt.time}`)) &&
      (apt.status === "accepted" || apt.status === "scheduled")
  );

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending"
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      (isPast(new Date(`${apt.date}T${apt.time}`)) &&
        apt.status !== "pending") ||
      ["rejected", "cancelled", "completed"].includes(apt.status)
  );

  // Calendar view helpers
  const weekDays = eachDayOfInterval({
    start: currentWeek,
    end: endOfWeek(currentWeek, { weekStartsOn: 1 }),
  });

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const prevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToToday = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const filteredAppointments = () => {
    if (filterStatus === "all") return appointments;
    return appointments.filter((apt) => apt.status === filterStatus);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <div className="flex items-center gap-2">
            <Select value={view} onValueChange={setView}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
              </SelectContent>
            </Select>
            {view === "list" && (
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Declined</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {view === "list" ? (
          <Tabs defaultValue="today">
            <TabsList className="mb-6">
              <TabsTrigger value="today">
                Today ({todayAppointments.length})
              </TabsTrigger>
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

            <TabsContent value="today">
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {appointment.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-lg">
                                Session with {appointment.patientName}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground mt-1">
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  <span>Today at {appointment.time}</span>
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
                              <Link
                                to={`/therapist/dashboard/messages/${appointment.patientId}`}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Link>
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleCompleteAppointment(appointment.id)
                              }
                            >
                              Mark Completed
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleCancelAppointment(appointment)
                              }
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
                    No appointments today
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any appointments scheduled for today
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {appointment.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-lg">
                                Session with {appointment.patientName}
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
                              <Link
                                to={`/therapist/dashboard/messages/${appointment.patientId}`}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleCancelAppointment(appointment)
                              }
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
                            <Avatar>
                              <AvatarFallback>
                                {appointment.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-lg">
                                  Session with {appointment.patientName}
                                </h3>
                                <Badge variant="outline">Pending</Badge>
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
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                to={`/therapist/dashboard/messages/${appointment.patientId}`}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleCancelAppointment(appointment)
                              }
                            >
                              Decline
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await updateDoc(
                                    doc(db, "appointments", appointment.id),
                                    {
                                      status: "accepted",
                                      updatedAt: new Date().toISOString(),
                                    }
                                  );

                                  setAppointments(
                                    appointments.map((apt) =>
                                      apt.id === appointment.id
                                        ? { ...apt, status: "accepted" }
                                        : apt
                                    )
                                  );
                                } catch (err) {
                                  console.error(
                                    "Error accepting appointment:",
                                    err
                                  );
                                  setError(
                                    "Failed to accept appointment. Please try again."
                                  );
                                }
                              }}
                            >
                              Accept
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
                            <Avatar>
                              <AvatarFallback>
                                {appointment.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-lg">
                                  Session with {appointment.patientName}
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
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                to={`/therapist/dashboard/messages/${appointment.patientId}`}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Link>
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
                    No past appointments
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any past or cancelled appointments
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Calendar View
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle>
                  {format(currentWeek, "MMMM d")} -{" "}
                  {format(
                    endOfWeek(currentWeek, { weekStartsOn: 1 }),
                    "MMMM d, yyyy"
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day.toString()} className="border rounded-md p-2">
                    <div
                      className={`text-center p-2 rounded-md mb-2 ${
                        isToday(day)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="font-medium">{format(day, "EEE")}</div>
                      <div className="text-lg">{format(day, "d")}</div>
                    </div>
                    <div className="space-y-2">
                      {getAppointmentsForDate(day).map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-2 rounded-md text-xs ${
                            apt.status === "pending"
                              ? "bg-yellow-100 border-yellow-300 border"
                              : apt.status === "accepted" ||
                                apt.status === "scheduled"
                              ? "bg-green-100 border-green-300 border"
                              : apt.status === "cancelled" ||
                                apt.status === "rejected"
                              ? "bg-red-100 border-red-300 border"
                              : "bg-gray-100 border-gray-300 border"
                          }`}
                        >
                          <div className="font-medium truncate">
                            {apt.patientName}
                          </div>
                          <div>
                            {apt.time} - {apt.sessionType}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancel Appointment Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your appointment with{" "}
                {selectedAppointment?.patientName} on{" "}
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
};
