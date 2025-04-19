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
import SignupPage from "./pages/signup/page";
import ChatPage from "./pages/therapistDashboard/message/ChatPage";
import { Profile } from "./pages/therapistDashboard/profile/Profile";
import { PatientRequests } from "./pages/therapistDashboard/patientRequest/PatientRequest";
import { TherapistMessages } from "./pages/therapistDashboard/message/TherapistMessages";
import { TherapistChatPage } from "./pages/therapistDashboard/message/TherapistChatPage";
import { GetTherapist } from "./pages/TherapistPage/GetTherapist";
import { TherapistProfilePage } from "./pages/TherapistPage/Therapist";
import { TherapistRegisterPage } from "./pages/therapistDashboard/register/TherapistRegisterPage";

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
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<ChatPage />} />
        <Route path="/therapist" element={<UserSideTherapist />} />

        <Route
          path="/therapist/dashboard"
          element={
            // <ProtectedRoute>
            <TherapistDashboard />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/therapist/dashboard/profile"
          element={
            // <ProtectedRoute>
            <Profile />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/therapist/dashboard/patient-requests"
          element={
            // <ProtectedRoute>
            <PatientRequests />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/therapist/dashboard/messages"
          element={
            // <ProtectedRoute>
            <TherapistMessages />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/therapist/dashboard/messages/:patientId"
          element={
            // <ProtectedRoute>
            <TherapistChatPage />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/get-therapist"
          element={
            // <ProtectedRoute>
            <GetTherapist />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/get-therapist/:therapistId"
          element={
            // <ProtectedRoute>
            <TherapistProfilePage />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/signupTherapist"
          element={
            // <ProtectedRoute>
            <TherapistRegisterPage />
            // </ProtectedRoute>
          }
        />

        {/* <Route path="/therapists/message/:patientId" element={
            <ProtectedRoute>
              < />
            </ProtectedRoute>
          }/> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
