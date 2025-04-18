import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { SidebarNav } from "../../components/therapist-dashboard/SidebarNav";

const UserSideTherapist = () => {
  return (
    <div>
      <Navbar />
      <SidebarNav />
      {/* Modal for booking */}
      User Side Therapist
    </div>
  );
};

export default UserSideTherapist;
