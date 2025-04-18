import React from "react";
import { Link } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          BayMax
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/therapists"
            className="text-sm font-medium hover:text-primary"
          >
            Find Therapists
          </Link>
          {user?.role === "therapist" && (
            <Link
              to="/therapist-dashboard"
              className="text-sm font-medium hover:text-primary"
            >
              Dashboard
            </Link>
          )}
          {user?.role === "patient" && (
            <Link
              to="/appointments"
              className="text-sm font-medium hover:text-primary"
            >
              My Appointments
            </Link>
          )}
          <Link to="/about" className="text-sm font-medium hover:text-primary">
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user.displayName || user.email}
                </div>
                <DropdownMenuSeparator />
                {user.role === "therapist" && (
                  <DropdownMenuItem asChild>
                    <Link to="/therapist-dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {user.role === "patient" && (
                  <DropdownMenuItem asChild>
                    <Link to="/appointments">My Appointments</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
