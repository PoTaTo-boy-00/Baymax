import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import Navbar from "../../components/Navbar";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState("checking");

  const {
    signIn,
    firebaseInitialized,
    currentuser,
    user,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (firebaseInitialized) {
      setFirebaseStatus("ready");
    } else {
      const timer = setTimeout(() => {
        if (!firebaseInitialized) {
          setFirebaseStatus("error");
          setError(
            "Firebase authentication is not properly configured. Please check your environment variables."
          );
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [firebaseInitialized]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      redirectBasedOnRole(user.role);
    }
  }, [user, authLoading]);

  const redirectBasedOnRole = (role) => {
    if (role === "therapist") {
      navigate("/therapist/dashboard");
    } else if (role === "patient") {
      navigate("/therapist");
    } else {
      navigate("/"); // fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (firebaseStatus !== "ready") {
      setError("Firebase is not properly configured. Please try again later.");
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      // Role will be fetched via AuthContext effect and `user` will update,
      // so redirecting will happen in the `useEffect` above.
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Log in to BayMax</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {firebaseStatus === "checking" ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="sr-only">
                  Checking Firebase configuration...
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {firebaseStatus === "error" && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Firebase configuration error. Please make sure your
                      environment variables are set correctly.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || firebaseStatus !== "ready"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
