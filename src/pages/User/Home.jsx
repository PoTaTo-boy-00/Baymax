import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import baymax from "../../assets/images/baymaxSort.png"
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
  const navigate = useNavigate();

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
    <div className="bg-gradient-to-r from-indigo-100 to-indigo-300 min-h-screen flex items-center">
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Card Content on the Left */}
        <div className="flex items-center justify-end w-full md:w-1/2">
          <Card className="w-full max-w-md rounded-2xl shadow-xl border-0 backdrop-blur-sm bg-white/80">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                BayMax
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Your personal mental wellness companion
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-2">
              <div className="rounded-full bg-indigo-100 p-6 animate-pulse-slow">
                <Shield className="h-12 w-12 text-indigo-600" />
              </div>
              <Button
                className="w-full h-14 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 ease-in-out rounded-xl"
                onClick={handleAnonymousLogin}
                disabled={loading}
              >
                {loading ? "Starting..." : "Begin Your Journey"}
              </Button>
            </CardContent>
            <CardFooter className="text-xs text-center text-gray-500 px-8 pt-4">
              <p>
                Your privacy matters. All data is encrypted and you can delete it
                anytime. No personal information is required to use the app.
              </p>
            </CardFooter>
          </Card>
        </div>
  
        {/* Baymax waving image on the Right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            display: "flex",
            alignItems: "center",
            zIndex: 0,
          }}
        >
          <img
            src={baymax}
            alt="Baymax waving hi"
            style={{
              height: "100vh",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  );  
}

export default App;
