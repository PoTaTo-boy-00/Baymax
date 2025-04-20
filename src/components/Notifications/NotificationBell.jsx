import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";

// import NotificationItem from "/notifications/notification-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { db } from "../../lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { NotificationItem } from "./NotificationItem";

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    let unsubscribe = () => {};

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, try to get notifications without ordering
        // This avoids the need for a composite index
        const simpleQuery = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          limit(10)
        );

        const snapshot = await getDocs(simpleQuery);
        const notificationsList = [];
        let unread = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          notificationsList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          });

          if (!data.read) {
            unread++;
          }
        });

        // Sort client-side instead of using orderBy
        notificationsList.sort((a, b) => b.createdAt - a.createdAt);

        setNotifications(notificationsList);
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Set up a listener for real-time updates
    // This is a simpler query that doesn't require the composite index
    try {
      const simpleQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
      );

      unsubscribe = onSnapshot(
        simpleQuery,
        (snapshot) => {
          const notificationsList = [];
          let unread = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            notificationsList.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            });

            if (!data.read) {
              unread++;
            }
          });

          // Sort client-side
          notificationsList.sort((a, b) => b.createdAt - a.createdAt);

          setNotifications(notificationsList.slice(0, 10));
          setUnreadCount(unread);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Error in notification listener:", err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error setting up notification listener:", err);
      setError(err.message);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      // Update each unread notification
      const promises = notifications
        .filter((notification) => !notification.read)
        .map((notification) =>
          updateDoc(doc(db, "notifications", notification.id), { read: true })
        );

      await Promise.all(promises);

      // Update local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (newOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9 hover:bg-accent hover:text-accent-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
