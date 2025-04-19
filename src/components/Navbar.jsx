import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/therapist" className="text-2xl font-bold text-primary">
          BayMax
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/get-therapist" className="text-sm font-medium hover:text-primary">
            Find Therapists
          </Link>
          {user?.role === "therapist" && (
            <Link to="/therapist/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
          )}
          {user?.role === "patient" && (
            <Link to="/appointments" className="text-sm font-medium hover:text-primary">
              My Appointments
            </Link>
          )}
          <Link to="/about" className="text-sm font-medium hover:text-primary">
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          {user ? (
            <>
              {/* User icon button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-full p-2 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <User className="h-5 w-5" />
              </button>

              {/* Dropdown content */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-md bg-white shadow-md border z-50 py-2 text-sm">
                  <div className="px-4 py-2 font-medium truncate">
                    {user.displayName || user.email}
                  </div>
                  <hr className="my-1" />
                  {user?.role === "therapist" && (
                    <Link to="/therapist/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                      Dashboard
                    </Link>
                  )}
                  {user?.role === "patient" && (
                    <Link to="/appointments" className="block px-4 py-2 hover:bg-gray-100">
                      My Appointments
                    </Link>
                  )}
                  <Link to="/therapist/dashboard/profile" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <Settings className="h-4 w-4 mr-2" /> Profile
                  </Link>
                </div>
              )}

              {/* Logout button */}
              <Button
                variant="outline"
                onClick={logout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
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
