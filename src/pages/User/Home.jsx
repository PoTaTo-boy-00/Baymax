import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Ensure you have react-toastify installed
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import { anonymousLogin } from "@/lib/firebase";
function App() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Move useNavigate to the top level

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const result = await anonymousLogin();
      if (result.success) {
        localStorage.setItem("userId", result.userId);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-calm-light p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-calm-purple">
            BayMax
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your personal mental wellness companion
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>

          <Button
            className="w-full h-14 text-lg font-medium"
            onClick={handleAnonymousLogin}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Anonymously"}
          </Button>
        </CardContent>
        <CardFooter className="text-xs text-center text-muted-foreground px-8">
          <p>
            Your privacy matters. All data is encrypted and you can delete it
            anytime. No personal information is required to use the app.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
