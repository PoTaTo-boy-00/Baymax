import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarClock, Shield } from "lucide-react";
import { sendAppointmentNotification } from "../lib/notifications";
import { db } from "../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

export const BookingModal = ({ therapist, slot, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionType, setSessionType] = useState(
    therapist.sessionTypes?.[0] || "Video"
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Get user data to check if anonymous
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const isAnonymous = userData.isAnonymous || false;

      // Create appointment in Firestore
      const appointmentRef = await addDoc(collection(db, "appointments"), {
        therapistId: therapist.id,
        therapistName: therapist.displayName,
        patientId: user.uid,
        patientName: isAnonymous
          ? userData.displayName
          : user.displayName || user.email,
        patientIsAnonymous: isAnonymous,
        date: slot.date,
        time: slot.time,
        sessionType,
        notes,
        status: "pending", // Changed from "scheduled" to "pending" to require therapist approval
        createdAt: new Date().toISOString(),
      });

      // Send notification to therapist
      await sendAppointmentNotification(
        therapist.id,
        appointmentRef.id,
        `New appointment request for ${format(
          new Date(slot.date),
          "MMMM d"
        )} at ${slot.time}`
      );

      // Navigate to appointments page
      navigate("/user/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Session</DialogTitle>
          <DialogDescription>
            Confirm your appointment details with {therapist.displayName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-md">
            <CalendarClock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">
                {format(new Date(slot.date), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">{slot.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
            <Shield className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Anonymous Booking</p>
              <p className="text-sm text-muted-foreground">
                Your identity will be kept private. The therapist will only see
                your anonymous username.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Session Type</Label>
            <RadioGroup
              value={sessionType}
              onValueChange={setSessionType}
              className="flex flex-col space-y-1"
            >
              {(therapist.sessionTypes || ["Video", "Phone", "In-person"]).map(
                (type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label htmlFor={type}>{type}</Label>
                  </div>
                )
              )}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific concerns or topics you'd like to discuss..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={loading}>
            {loading ? "Booking..." : "Request Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
