import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MessageSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../../contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export const Lannding = () => {
  const { user, loading } = useAuth();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col min-h-[calc(100vh-64px)]">
          <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
            <div className="container mx-auto px-4 text-center">
              <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
              <Skeleton className="h-6 w-1/2 mx-auto mb-10" />
              <div className="flex justify-center gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find Your Perfect <span className="text-primary">Therapist</span>{" "}
              Match
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              BayMax connects you with qualified therapists who can help you
              navigate life's challenges and improve your mental wellbeing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user?.role === "patient" && (
                <Link to="/get-therapist">
                  <Button size="lg" className="gap-2">
                    Find a Therapist <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {user?.role === "therapist" && (
                <Link to="/therapist/dashboard">
                  <Button size="lg" variant="outline">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
              {!user && (
                <>
                  <Link to="/login">
                    <Button size="lg" className="gap-2">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="lg" variant="outline">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section - Only show for patients */}
        {user?.role === "patient" && (
          <section className="py-20 bg-primary/5">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Start Your Healing Journey?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Join thousands of people who have found the right therapist
                through BayMax.
              </p>
              <Link to="/get-therapist">
                <Button size="lg">Browse Therapists</Button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
};
