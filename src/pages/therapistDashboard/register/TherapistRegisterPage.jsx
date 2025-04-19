import { useEffect, useState } from "react";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { db } from "../../../lib/firebase";
import Navbar from "../../../components/Navbar";

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

export const TherapistRegisterPage = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [license, setLicense] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleSpecialtyToggle = (specialty) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter((s) => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    if (!loading && !user) {
      // If auth check is complete and no user exists
      navigate("/login"); // Redirect to login
      return;
    }

    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user, loading, navigate]);

  // Show loading state while auth is being checked
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    // if (password !== confirmPassword) {
    //   setError("Passwords do not match");
    //   return;
    // }

    // if (password.length < 6) {
    //   setError("Password must be at least 6 characters");
    //   return;
    // }

    if (specialties.length === 0) {
      setError("Please select at least one specialty");
      return;
    }

    if (!license) {
      setError("Please enter your license information");
      return;
    }

    setIsLoading(true);

    try {
      // Register the therapist with Firebase Auth
      // const { user } = await signUp(email, password, "therapist", displayName);

      // Create a document in the therapists collection
      console.log(user);
      const therapistData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        bio,
        specialties,
        license,
        accountType: "therapist",
        isVerified: false, // Admin can verify later
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Set the document with the user's UID as the document ID
      await setDoc(doc(db, "users", user.uid), therapistData);

      // Navigate to dashboard
      navigate("/therapist/dashboard/profile");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Register as a Therapist</CardTitle>
          <CardDescription>
            Create your therapist account and start helping patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    value={displayName}
                    // onChange={(e) => setDisplayName(e.target.value)}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Information</h3>

              <div className="space-y-2">
                <Label htmlFor="license">License Information</Label>
                <Input
                  id="license"
                  placeholder="License number and state"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This information will be verified before your profile is made
                  public
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a brief introduction about your practice and experience..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Specialties (select at least one)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specialtiesList.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`specialty-${specialty}`}
                        checked={specialties.includes(specialty)}
                        onCheckedChange={() => handleSpecialtyToggle(specialty)}
                      />
                      <Label htmlFor={`specialty-${specialty}`}>
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Register as a Therapist"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  );
};
