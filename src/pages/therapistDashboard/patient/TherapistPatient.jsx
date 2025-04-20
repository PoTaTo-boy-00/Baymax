import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../../../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format, isValid } from "date-fns";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "../Layout";
import { SidebarNav } from "../../../components/therapist-dashboard/SidebarNav";
import Navbar from "../../../components/Navbar";

export const TherapistPatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to safely format dates
  const formatDate = (date, formatStr = "MMM d, yyyy") => {
    if (!date) return "Unknown date";

    // Ensure date is a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if date is valid before formatting
    return isValid(dateObj) ? format(dateObj, formatStr) : "Invalid date";
  };

  useEffect(() => {
    if (!user) return;

    const fetchPatients = async () => {
      try {
        // Get all appointments for this therapist
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("therapistId", "==", user.uid)
        );

        const appointmentsSnapshot = await getDocs(appointmentsQuery);

        // Create a map to track unique patients and their appointments
        const patientMap = new Map();

        for (const appointmentDoc of appointmentsSnapshot.docs) {
          const appointmentData = appointmentDoc.data();
          const patientId = appointmentData.patientId;

          if (!patientId) continue;

          // If we haven't seen this patient yet, initialize their data
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              id: patientId,
              appointments: [],
              appointmentCount: 0,
              lastAppointment: null,
              nextAppointment: null,
              status: "inactive",
            });
          }

          // Parse date safely
          let appointmentDate = null;
          try {
            // Check if date is a Firestore timestamp
            if (appointmentData.date && typeof appointmentData.date.toDate === "function") {
              appointmentDate = appointmentData.date.toDate();
            }
            // Check if date is a string (YYYY-MM-DD format)
            else if (appointmentData.date && typeof appointmentData.date === "string") {
              // If we have both date and time
              if (appointmentData.time && typeof appointmentData.time === "string") {
                appointmentDate = new Date(`${appointmentData.date}T${appointmentData.time}`);
              } else {
                appointmentDate = new Date(appointmentData.date);
              }
            }
            // If date is already a Date object
            else if (appointmentData.date instanceof Date) {
              appointmentDate = appointmentData.date;
            }

            // Validate the date
            if (!isValid(appointmentDate)) {
              console.warn(
                `Invalid date for appointment ${appointmentDoc.id}:`,
                appointmentData.date
              );
              appointmentDate = null;
            }
          } catch (error) {
            console.error("Error parsing date:", error);
            appointmentDate = null;
          }

          const patientData = patientMap.get(patientId);
          patientData.appointments.push({
            id: appointmentDoc.id,
            ...appointmentData,
            date: appointmentDate,
          });
          patientData.appointmentCount++;

          // Update last and next appointments only if we have a valid date
          if (appointmentDate && isValid(appointmentDate)) {
            const now = new Date();

            if (appointmentDate < now) {
              if (
                !patientData.lastAppointment ||
                (patientData.lastAppointment.date && appointmentDate > patientData.lastAppointment.date)
              ) {
                patientData.lastAppointment = {
                  id: appointmentDoc.id,
                  date: appointmentDate,
                  status: appointmentData.status,
                };
              }
            } else {
              if (
                !patientData.nextAppointment ||
                (patientData.nextAppointment.date && appointmentDate < patientData.nextAppointment.date)
              ) {
                patientData.nextAppointment = {
                  id: appointmentDoc.id,
                  date: appointmentDate,
                  status: appointmentData.status,
                };
              }
            }
          }

          // Determine patient status
          if (
            patientData.nextAppointment &&
            (patientData.nextAppointment.status === "confirmed" ||
              patientData.nextAppointment.status === "accepted" ||
              patientData.nextAppointment.status === "scheduled")
          ) {
            patientData.status = "active";
          } else if (patientData.appointmentCount === 1 && !patientData.lastAppointment) {
            patientData.status = "new";
          }
        }

        // Fetch patient details for each unique patient
        const patientsList = [];

        for (const [patientId, patientData] of patientMap.entries()) {
          const userDoc = await getDoc(doc(db, "users", patientId));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            patientsList.push({
              ...patientData,
              name: userData.displayName || "Unknown Patient",
              email: userData.email || "",
              photoURL: userData.photoURL || null,
            });
          }
        }

        // Sort patients by next appointment date (soonest first)
        patientsList.sort((a, b) => {
          // Patients with upcoming appointments come first
          if (a.nextAppointment && !b.nextAppointment) return -1;
          if (!a.nextAppointment && b.nextAppointment) return 1;

          // Then sort by next appointment date
          if (
            a.nextAppointment &&
            b.nextAppointment &&
            a.nextAppointment.date &&
            b.nextAppointment.date &&
            isValid(a.nextAppointment.date) &&
            isValid(b.nextAppointment.date)
          ) {
            return a.nextAppointment.date - b.nextAppointment.date;
          }

          // Then sort by last appointment date (most recent first)
          if (
            a.lastAppointment &&
            b.lastAppointment &&
            a.lastAppointment.date &&
            b.lastAppointment.date &&
            isValid(a.lastAppointment.date) &&
            isValid(b.lastAppointment.date)
          ) {
            return b.lastAppointment.date - a.lastAppointment.date;
          }

          return 0;
        });

        setPatients(patientsList);
        setFilteredPatients(patientsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  // Filter patients when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.email.toLowerCase().includes(query)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "new":
        return <Badge className="bg-blue-500">New</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Patients</h1>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Patients</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length > 0 ? (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={patient.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{patient.name}</h3>
                        {getStatusBadge(patient.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <div className="flex gap-4 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {patient.appointmentCount} appointment
                          {patient.appointmentCount !== 1 ? "s" : ""}
                        </p>
                        {patient.nextAppointment &&
                          patient.nextAppointment.date &&
                          isValid(patient.nextAppointment.date) && (
                            <p className="text-xs text-muted-foreground">
                              Next: {formatDate(patient.nextAppointment.date)}
                            </p>
                          )}
                        {(!patient.nextAppointment ||
                          !patient.nextAppointment.date ||
                          !isValid(patient.nextAppointment.date)) &&
                          patient.lastAppointment &&
                          patient.lastAppointment.date &&
                          isValid(patient.lastAppointment.date) && (
                            <p className="text-xs text-muted-foreground">
                              Last: {formatDate(patient.lastAppointment.date)}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/therapist-dashboard/messages/${patient.id}`}>Message</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to={`/therapist-dashboard/patients/${patient.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {searchQuery ? (
                <p className="text-muted-foreground">No patients match your search</p>
              ) : (
                <>
                  <p className="text-muted-foreground">No patients yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When patients book appointments with you, they'll appear here
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout></>
  );
}