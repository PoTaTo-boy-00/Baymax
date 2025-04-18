import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MessageSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
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
            <Link to="/therapists">
              <Button size="lg" className="gap-2">
                Find a Therapist <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/signup?role=therapist">
              <Button size="lg" variant="outline">
                Join as a Therapist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How BayMax Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Specialists</h3>
              <p className="text-muted-foreground">
                Browse our directory of qualified therapists and filter by
                specialty to find the perfect match for your needs.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Sessions</h3>
              <p className="text-muted-foreground">
                View available time slots and book appointments with your chosen
                therapist in just a few clicks.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Secure Communication
              </h3>
              <p className="text-muted-foreground">
                Chat securely with your therapist and get AI-powered suggestions
                for your first session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of people who have found the right therapist through
            BayMax.
          </p>
          <Link to="/therapists">
            <Button size="lg">Browse Therapists</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
