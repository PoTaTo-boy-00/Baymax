"use client";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, MessageSquare, Star } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { QuestionSuggestions } from "@/components/QuestionSuggestion";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useRouter } from "@tanstack/react-router";
import  Navbar  from "../../components/Navbar";

import { BookingModal } from "@/components/BookingModal";

export const TherapistProfilePage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const therapistDoc = await getDoc(doc(db, "users", id));

        if (!therapistDoc.exists()) {
          navigate("/therapists");
          return;
        }

        const data = therapistDoc.data();
        setTherapist({
          id: therapistDoc.id,
          displayName: data.displayName || "Unknown Therapist",
          specialties: data.specialties || [],
          bio: data.bio || "No bio available",
          photoURL: data.photoURL || null,
          education: data.education || [],
          experience: data.experience || "",
          approach: data.approach || "",
          location: data.location || "",
          sessionTypes: data.sessionTypes || [],
          sessionFee: data.sessionFee || "",
        });
      } catch (error) {
        console.error("Error fetching therapist:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTherapist();
    }
  }, [id, navigate]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!id || !selectedDate) return;

      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const slotsQuery = query(
          collection(db, "availability"),
          where("therapistId", "==", id),
          where("date", "==", formattedDate)
        );

        const snapshot = await getDocs(slotsQuery);

        if (snapshot.empty) {
          // Generate mock time slots if none exist
          const mockSlots = [];
          const startHour = 9;
          const endHour = 17;

          for (let hour = startHour; hour < endHour; hour++) {
            mockSlots.push({
              id: `mock-${hour}`,
              date: formattedDate,
              time: `${hour}:00`,
              available: Math.random() > 0.3,
            });

            mockSlots.push({
              id: `mock-${hour}-30`,
              date: formattedDate,
              time: `${hour}:30`,
              available: Math.random() > 0.3,
            });
          }

          setAvailableSlots(mockSlots);
        } else {
          const slots = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            slots.push({
              id: doc.id,
              date: data.date,
              time: data.time,
              available: data.available,
            });
          });

          setAvailableSlots(slots);
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
      }
    };

    fetchAvailableSlots();
  }, [id, selectedDate]);

  const handleBooking = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Skeleton className="h-32 w-32 rounded-full mb-4" />
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:w-2/3">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Therapist Not Found</h1>
        <p className="mb-6">
          The therapist you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/therapist")}>
          Back to Therapists
        </Button>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Therapist Info Card */}
        <div className="md:w-1/3">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarFallback className="text-4xl">
                    {therapist.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{therapist.displayName}</h1>
                <p className="text-muted-foreground">Licensed Therapist</p>
              </div>

              <div className="space-y-4">
                {therapist.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{therapist.location}</span>
                  </div>
                )}

                {therapist.sessionFee && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>Session fee: {therapist.sessionFee}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {therapist.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                {user && user.role === "patient" && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate(`/chat/${therapist.id}`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-2/3">
          <Tabs defaultValue="about">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="booking">Book a Session</TabsTrigger>
              {user && user.role === "patient" && (
                <TabsTrigger value="questions">
                  First Session Questions
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About Me</h2>
                  <p className="whitespace-pre-line">{therapist.bio}</p>
                </CardContent>
              </Card>

              {therapist.approach && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Therapeutic Approach
                    </h2>
                    <p className="whitespace-pre-line">{therapist.approach}</p>
                  </CardContent>
                </Card>
              )}

              {therapist.education && therapist.education.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Education & Credentials
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                      {therapist.education.map((edu, index) => (
                        <li key={index}>{edu}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {therapist.sessionTypes && therapist.sessionTypes.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Session Types
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {therapist.sessionTypes.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="booking">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Book a Session</h2>

                  {!user ? (
                    <div className="text-center py-8">
                      <p className="mb-4">Please log in to book a session</p>
                      <Button onClick={() => navigate("/login")}>Log In</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-8">
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Select a Date
                        </h3>
                        {/* <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                          disabled={(date) =>
                            date < new Date() ||
                            date >
                              new Date(
                                new Date().setDate(new Date().getDate() + 30)
                              )
                          }
                        /> */}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Available Time Slots
                        </h3>

                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableSlots
                              .sort((a, b) => a.time.localeCompare(b.time))
                              .map((slot) => (
                                <Button
                                  key={slot.id}
                                  variant={slot.available ? "outline" : "ghost"}
                                  disabled={!slot.available}
                                  onClick={() =>
                                    slot.available && handleBooking(slot)
                                  }
                                  className="justify-start"
                                >
                                  {slot.time}
                                </Button>
                              ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground py-4">
                            No available slots for this date. Please select
                            another date.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions">
              <QuestionSuggestions
                therapistSpecialties={therapist.specialties}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showBookingModal && selectedSlot && (
        <BookingModal
          therapist={therapist}
          slot={selectedSlot}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
    </>
  );
};
