import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Calendar, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export const NotificationItem = ({ notification }) => {
  const { user } = useAuth();
  const { type, message, createdAt, read } = notification;

  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "video-call":
        return <Video className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Get the appropriate link based on notification type and user role
  const getLink = () => {
    const basePath = user?.role === "therapist" ? "/therapist" : "/user";

    switch (type) {
      case "message":
        return `${basePath}/messages`;
      case "appointment":
        return `${basePath}/appointments`;
      case "video-call":
        return `${basePath}/video-call`;
      default:
        return `${basePath}/dashboard`;
    }
  };

  // Format the time
  const timeAgo = createdAt
    ? formatDistanceToNow(createdAt, { addSuffix: true })
    : "just now";

  return (
    <Link to={getLink()}>
      <div
        className={`flex items-start gap-3 p-3 hover:bg-muted transition-colors cursor-pointer ${
          !read ? "bg-muted/50" : ""
        }`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm">{message}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        {!read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
      </div>
    </Link>
  );
};
