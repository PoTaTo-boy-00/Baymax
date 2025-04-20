import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Calendar,
  MessageSquare,
  Settings,
  Users,
  Home,
  Bell,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import Navbar from "../Navbar";

const navItems = [
  {
    title: "Overview",
    href: "/therapist/dashboard",
    icon: Home,
  },
  {
    title: "Patient Requests",
    href: "/therapist/dashboard/patient-requests",
    icon: Bell,
  },
  {
    title: "Appointments",
    href: "/therapist/appointments",
    icon: Calendar,
  },
  {
    title: "Patients",
    href: "/therapist/dashboard/patient",
    icon: Users,
  },
  {
    title: "Messages",
    href: "/therapist/dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/therapist/dashboard/profile",
    icon: Settings,
  },
];

export function SidebarNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  //   const pathname = currentPath.split("/").slice(0, 3).join("/");

  return (
    <>
      <SidebarProvider>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = currentPath.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Link to={item.href}>
                        <item.icon
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarProvider>
    </>
  );
}
