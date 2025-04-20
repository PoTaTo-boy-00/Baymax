import { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Home from "./pages/User/Home";
import UserDashboard from "./pages/User/UserDashboard";
// import UserSideTherapist from "./pages/BaymaxLanding/BaymaxLanding";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import TherapistDashboard from "./pages/therapistDashboard/TherapistDashboard";
// import { SignupPage } from "./pages/signup/page";
import { ChatPage } from "./pages/Chat/page";
import { Profile } from "./pages/therapistDashboard/profile/Profile";
import { PatientRequests } from "./pages/therapistDashboard/patientRequest/PatientRequest";
import { TherapistMessages } from "./pages/therapistDashboard/message/TherapistMessages";
import { TherapistChatPage } from "./pages/therapistDashboard/message/TherapistChatPage";
import { GetTherapist } from "./pages/Therapist/GetTherapist";
import {
  TherapistBooking,
  TherapistProfilePage,
} from "./pages/Therapist/TherapistBooking";
import { TherapistRegisterPage } from "./pages/therapistDashboard/register/TherapistRegisterPage";
// import Login from "./pages/login/login";

import Navbar from "./components/Navbar";
// import { UserAppointment } from "./pages/userSideTherapist/UserSideTherapist";
import UserAppointment from "./pages/Appointment/UserAppoinment";
import TherapistAppointmentsPage from "./pages/therapistDashboard/therapistAppointment/TherapistAppointment";
import { LoginPage } from "./pages/Login/login";
import { SignupPage } from "./pages/Signup/page";
import { Lannding } from "./pages/Landing/Landing";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<UserDashboard />} />

          <Route path="/therapist" element={<Lannding />} />

          {/* therapist */}

          <Route path="/therapist/dashboard" element={<TherapistDashboard />} />

          <Route path="/therapist/dashboard/profile" element={<Profile />} />

          <Route
            path="/therapist/dashboard/patient-requests"
            element={<PatientRequests />}
          />

          <Route
            path="/therapist/dashboard/messages"
            element={<TherapistMessages />}
          />

          <Route
            path="/therapist/dashboard/messages/:patientId"
            element={<TherapistChatPage />}
          />

          {/* user */}

          <Route path="/user/appointments" element={<UserAppointment />} />

          <Route
            path="/therapist/appointments"
            element={<TherapistAppointmentsPage />}
          />

          <Route path="/get-therapist" element={<GetTherapist />} />

          <Route path="/get-therapist/:id" element={<TherapistBooking />} />

          {/* auth */}

          <Route path="/signupTherapist" element={<TherapistRegisterPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/signup" element={<SignupPage />} />

          {/* theraopist and user chat  */}

          <Route
            path="/therapist/dashboard/messages/:patientId"
            element={<TherapistChatPage />}
          />

          <Route path="/chat/:therapistId" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
