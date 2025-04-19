import React from "react";
import { Link } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
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
  // console.log(user.displayName);
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/therapist" className="text-2xl font-bold text-primary">
          BayMax
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/get-therapist"
            className="text-sm font-medium hover:text-primary"
          >
            Find Therapists
          </Link>
          {user?.role === "therapist" && (
            <Link
              to="/therapist/dashboard"
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
            <DropdownMenu defaultOpen={true}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted/50 focus:ring-2 focus:ring-primary"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={5}
                className="w-56 rounded-md bg-white p-1 shadow-lg border border-gray-200 z-50"
              >
                <div className="px-2 py-1.5 text-sm font-medium truncate">
                  {user.displayName || user.email}
                </div>
                <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />

                {user?.role === "therapist" && (
                  <DropdownMenuItem className="focus:bg-gray-100 focus:outline-none">
                    <Link
                      to="/therapist/dashboard"
                      className="flex w-full px-2 py-1.5 text-sm"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                {user?.role === "patient" && (
                  <DropdownMenuItem className="focus:bg-gray-100 focus:outline-none">
                    <Link
                      to="/appointments"
                      className="flex w-full px-2 py-1.5 text-sm"
                    >
                      My Appointments
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="focus:bg-gray-100 focus:outline-none">
                  <Link
                    to="/profile"
                    className="flex w-full items-center px-2 py-1.5 text-sm"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />

                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    logout();
                  }}
                  className="focus:bg-gray-100 focus:outline-none text-red-600 cursor-pointer"
                >
                  <div className="flex items-center px-2 py-1.5 text-sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </div>
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
