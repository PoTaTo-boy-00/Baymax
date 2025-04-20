import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/therapist-dashboard/SidebarNav";

export const DashboardLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "therapist")) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <div
          className={`relative transition-all duration-300 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
          onMouseEnter={() => setIsCollapsed(false)}
          onMouseLeave={() => setIsCollapsed(true)}
        >
          <Sidebar className={`fixed h-full ${isCollapsed ? "w-20" : "w-64"}`}>
            <SidebarHeader className="flex items-center px-4 py-2">
              {!isCollapsed && (
                <h1 className="text-xl font-bold ml-2">Therapist Dashboard</h1>
              )}
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav isCollapsed={isCollapsed} />
            </SidebarContent>
          </Sidebar>
        </div>
        <div
          className={`flex-1 transition-all duration-300 ${
            isCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};
