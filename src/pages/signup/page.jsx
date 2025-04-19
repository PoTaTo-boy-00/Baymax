"use client"

import { useState, useEffect } from "react"
// import Link from "next/link"
import { useSearchParams,useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Navbar from "../../components/Navbar";

export const  SignupPage=()=> {

    const [searchParams] = useSearchParams()
    const defaultRole = searchParams.get("role") === "therapist" ? "therapist" : "patient"
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [role, setRole] = useState(defaultRole)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [firebaseStatus, setFirebaseStatus] = useState("checking")

    const {signUp, firebaseInitialized } = useAuth()
    const navigate = useNavigate();

  useEffect(() => {
    // Check Firebase initialization status
    if (firebaseInitialized) {
      setFirebaseStatus("ready")
    } else {
      // Wait a bit to see if Firebase initializes
      const timer = setTimeout(() => {
        if (!firebaseInitialized) {
          setFirebaseStatus("error")
          setError("Firebase authentication is not properly configured. Please check your environment variables.")
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [firebaseInitialized])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !password || !displayName) {
      setError("All fields are required")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (firebaseStatus !== "ready") {
      setError("Firebase is not properly configured. Please try again later.")
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password, role, displayName)
      if (role === "therapist") {
        navigate("/therapist-dashboard/profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.message || "Failed to sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <Navbar />
      <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join BayMax to find therapists or offer your services</CardDescription>
        </CardHeader>
        <CardContent>
          {firebaseStatus === "checking" ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="sr-only">Checking Firebase configuration...</span>
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
                    Firebase configuration error. Please make sure your environment variables are set correctly.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>I am a:</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="patient" id="patient" />
                    <Label htmlFor="patient">Patient</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="therapist" id="therapist" />
                    <Label htmlFor="therapist">Therapist</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || firebaseStatus !== "ready"}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={()=>{navigate('/login')}} className="text-primary hover:underline">
              Log in
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  )
}
