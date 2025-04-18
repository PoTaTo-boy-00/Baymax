import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button } from "./components/ui/button";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/User/Home";
import UserDashboard from "./pages/User/UserDashboard";
import UserSideTherapist from "./pages/userSideTherapist/UserSideTherapist";
import { AuthProvider } from "../contexts/AuthContext";
import TherapistDashboard from "./pages/therapistDashboard/TherapistDashboard";

function App() {
  const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/therapists" element={<UserSideTherapist />} />
        <Route
          path="/therapists/dashboard"
          element={
            <ProtectedRoute>
              <TherapistDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
