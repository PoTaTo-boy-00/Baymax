import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, isValid } from "date-fns"
import { Link } from "react-router-dom"
import { Calendar, Clock, Mail, MessageSquare, Phone, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Settings, Users, Home, Bell } from "lucide-react"
import { useLocation } from "react-router-dom"
import { SidebarNav } from "../../../components/therapist-dashboard/SidebarNav";
import { useAuth } from "../../../../contexts/AuthContext";
import { DashboardLayout } from "../Layout";

export const PatientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [loading, setLoading] = useState(true)

  // Helper function to safely format dates
  const formatDate = (date, formatStr = "MMMM d, yyyy") => {
    if (!date) return "Unknown date"

    // Ensure date is a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date)

    // Check if date is valid before formatting
    return isValid(dateObj) ? format(dateObj, formatStr) : "Invalid date"
  }

  useEffect(() => {
    if (!user || !id) return

    const fetchPatientData = async () => {
      try {
        // Get patient info
        const patientDoc = await getDoc(doc(db, "users", id))

        if (!patientDoc.exists()) {
          navigate("/therapist/dashboard/patients")
          return
        }

        const patientData = patientDoc.data()

        // Get all appointments between this therapist and patient
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("therapistId", "==", user.uid),
          where("patientId", "==", id),
        )

        const appointmentsSnapshot = await getDocs(appointmentsQuery)

        const appointmentsList = appointmentsSnapshot.docs.map((doc) => {
          const data = doc.data()

          // Parse date safely
          let appointmentDate = null
          try {
            // Check if date is a Firestore timestamp
            if (data.date && typeof data.date.toDate === "function") {
              appointmentDate = data.date.toDate()
            }
            // Check if date is a string (YYYY-MM-DD format)
            else if (data.date && typeof data.date === "string") {
              // If we have both date and time
              if (data.time && typeof data.time === "string") {
                appointmentDate = new Date(`${data.date}T${data.time}`)
              } else {
                appointmentDate = new Date(data.date)
              }
            }
            // If date is already a Date object
            else if (data.date instanceof Date) {
              appointmentDate = data.date
            }

            // Validate the date
            if (!isValid(appointmentDate)) {
              console.warn(`Invalid date for appointment ${doc.id}:`, data.date)
              appointmentDate = null
            }
          } catch (error) {
            console.error("Error parsing date:", error)
            appointmentDate = null
          }

          return {
            id: doc.id,
            ...data,
            date: appointmentDate,
          }
        })

        // Filter out appointments with invalid dates
        const validAppointments = appointmentsList.filter((apt) => apt.date && isValid(apt.date))

        // Sort appointments by date (newest first)
        validAppointments.sort((a, b) => b.date - a.date)

        // Get therapist notes for this patient
        const notesQuery = query(
          collection(db, "therapistNotes"),
          where("therapistId", "==", user.uid),
          where("patientId", "==", id),
        )

        const notesSnapshot = await getDocs(notesQuery)

        let patientNotes = ""
        if (!notesSnapshot.empty) {
          patientNotes = notesSnapshot.docs[0].data().notes || ""
        }

        // Convert createdAt to Date safely if it exists
        let createdAt = null
        if (patientData.createdAt) {
          if (typeof patientData.createdAt.toDate === "function") {
            createdAt = patientData.createdAt.toDate()
          } else if (patientData.createdAt instanceof Date) {
            createdAt = patientData.createdAt
          } else if (typeof patientData.createdAt === "string") {
            createdAt = new Date(patientData.createdAt)
          }
        }

        setPatient({
          id,
          ...patientData,
          createdAt,
        })
        setAppointments(validAppointments)
        setNotes(patientNotes)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching patient data:", error)
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [user, id, navigate])

  const saveNotes = async () => {
    if (!user || !patient) return

    setSavingNotes(true)

    try {
      // Check if notes document already exists
      const notesQuery = query(
        collection(db, "therapistNotes"),
        where("therapistId", "==", user.uid),
        where("patientId", "==", id),
      )

      const notesSnapshot = await getDocs(notesQuery)

      if (notesSnapshot.empty) {
        // Create new notes document
        await addDoc(collection(db, "therapistNotes"), {
          therapistId: user.uid,
          patientId: id,
          notes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        // Update existing notes document
        const noteDoc = notesSnapshot.docs[0]
        await updateDoc(doc(db, "therapistNotes", noteDoc.id), {
          notes,
          updatedAt: serverTimestamp(),
        })
      }

      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving notes:", error)
      toast({
        title: "Error saving notes",
        description: "There was an error saving your notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingNotes(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
      case "accepted":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Patient Details</h1>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Patient Not Found</h1>
        <p>The patient you're looking for doesn't exist or you don't have access.</p>
        <Button asChild>
          <Link to="/therapist-dashboard/patients">Back to Patients</Link>
        </Button>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="flex">
      <div className="hidden md:block">
        <SidebarNav />
      </div>
      
      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Patient Details</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/therapist-dashboard/messages/${patient.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/therapist-dashboard/appointments/schedule?patientId=${patient.id}`}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={patient.photoURL || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{patient.displayName?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{patient.displayName}</h2>

              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.email || "No email provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.phone || "No phone provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Patient since{" "}
                    {patient.createdAt && isValid(patient.createdAt)
                      ? formatDate(patient.createdAt, "MMMM yyyy")
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="appointments">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="notes">Private Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment History</CardTitle>
                    <CardDescription>All appointments with {patient.displayName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div key={appointment.id} className="flex justify-between items-center p-4 rounded-lg border">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {appointment.date && isValid(appointment.date)
                                    ? formatDate(appointment.date)
                                    : "Unknown date"}
                                </h3>
                                {getStatusBadge(appointment.status)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {appointment.date && isValid(appointment.date)
                                    ? formatDate(appointment.date, "h:mm a")
                                    : "Unknown time"}{" "}
                                  - {appointment.duration || "60"} minutes
                                </p>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm mt-2 text-muted-foreground">{appointment.notes}</p>
                              )}
                            </div>
                            <Button asChild size="sm">
                              <Link to={`/therapist-dashboard/appointments/${appointment.id}`}>View</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No appointments yet</p>
                        <Button className="mt-4" asChild>
                          <Link to={`/therapist-dashboard/appointments/schedule?patientId=${patient.id}`}>
                            Schedule Appointment
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Private Notes</CardTitle>
                    <CardDescription>These notes are only visible to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add your private notes about this patient here..."
                      className="min-h-[200px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={saveNotes} disabled={savingNotes}>
                      {savingNotes ? "Saving..." : "Save Notes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}