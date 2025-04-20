import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../../../../contexts/AuthContext";
import Navbar from "../../../components/Navbar";
import { SidebarNav } from "../../../components/therapist-dashboard/SidebarNav";
import { DashboardLayout } from "../Layout";

const specialtiesList = [
  "Anxiety",
  "Depression",
  "Trauma",
  "Relationships",
  "Addiction",
  "Grief",
  "Stress",
  "LGBTQ+",
  "Family",
  "Career",
];

const sessionTypesList = ["Video", "Phone", "In-person", "Text-based"];

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [education, setEducation] = useState([""]);
  const [experience, setExperience] = useState("");
  const [approach, setApproach] = useState("");
  const [location, setLocation] = useState("");
  const [sessionTypes, setSessionTypes] = useState([]);
  const [sessionFee, setSessionFee] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, "users", user.uid));

        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");
          setSpecialties(data.specialties || []);
          setEducation(data.education || [""]);
          setExperience(data.experience || "");
          setApproach(data.approach || "");
          setLocation(data.location || "");
          setSessionTypes(data.sessionTypes || []);
          setSessionFee(data.sessionFee || "");

          if (data.photoURL) {
            setPhotoPreview(data.photoURL);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEducationChange = (index, value) => {
    const newEducation = [...education];
    newEducation[index] = value;
    setEducation(newEducation);
  };

  const addEducationField = () => {
    setEducation([...education, ""]);
  };

  const removeEducationField = (index) => {
    const newEducation = [...education];
    newEducation.splice(index, 1);
    setEducation(newEducation);
  };

  const handleSpecialtyToggle = (specialty) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter((s) => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  const handleSessionTypeToggle = (type) => {
    if (sessionTypes.includes(type)) {
      setSessionTypes(sessionTypes.filter((t) => t !== type));
    } else {
      setSessionTypes([...sessionTypes, type]);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      let photoURL = photoPreview;

      // Upload new photo if selected
      if (photoFile) {
        const storageRef = ref(storage, `profile_photos/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      // Filter out empty education entries
      const filteredEducation = education.filter((edu) => edu.trim() !== "");

      // Update profile in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        bio,
        specialties,
        education: filteredEducation,
        experience,
        approach,
        location,
        sessionTypes,
        sessionFee,
        photoURL,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic">
          <TabsList className="mb-6">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="professional">Professional Details</TabsTrigger>
            <TabsTrigger value="sessions">Session Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={photoPreview || undefined}
                        alt={displayName}
                      />
                      <AvatarFallback className="text-3xl">
                        {displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-primary-foreground cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Upload photo</span>
                    </label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Full Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Dr. Jane Smith"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a brief introduction about yourself..."
                    rows={5}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>
                  Share your expertise, education, and approach to therapy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specialtiesList.map((specialty) => (
                      <div
                        key={specialty}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={specialties.includes(specialty)}
                          onCheckedChange={() =>
                            handleSpecialtyToggle(specialty)
                          }
                        />
                        <Label htmlFor={`specialty-${specialty}`}>
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Education & Credentials</Label>
                  {education.map((edu, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={edu}
                        onChange={(e) =>
                          handleEducationChange(index, e.target.value)
                        }
                        placeholder={`Degree, Institution (e.g., Ph.D. in Psychology, Stanford University)`}
                        className="flex-1"
                      />
                      {education.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducationField(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducationField}
                  >
                    Add Education
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Describe your professional experience..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approach">Therapeutic Approach</Label>
                  <Textarea
                    id="approach"
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    placeholder="Describe your approach to therapy..."
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Session Settings</CardTitle>
                <CardDescription>
                  Configure your session types and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Session Types</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {sessionTypesList.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`session-${type}`}
                          checked={sessionTypes.includes(type)}
                          onCheckedChange={() => handleSessionTypeToggle(type)}
                        />
                        <Label htmlFor={`session-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionFee">Session Fee</Label>
                  <Input
                    id="sessionFee"
                    value={sessionFee}
                    onChange={(e) => setSessionFee(e.target.value)}
                    placeholder="$150 per session"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout></>
  );
};
