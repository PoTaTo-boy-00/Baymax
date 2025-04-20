import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "../../../../contexts/AuthContext";
import {DashboardLayout} from "../Layout"; // Import the layout
import { SidebarNav } from "@/components/therapist-dashboard/SidebarNav"; // Import the SidebarNav
import Navbar from "../../../components/Navbar";

export const PatientRequests = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        const requestsQuery = query(
          collection(db, "appointments"),
          where("therapistId", "==", user.uid)
        );

        const snapshot = await getDocs(requestsQuery);

        const pending = [];
        const accepted = [];
        const rejected = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const request = {
            id: doc.id,
            patientId: data.patientId,
            patientName: data.patientName,
            date: data.date,
            time: data.time,
            sessionType: data.sessionType,
            notes: data.notes,
            status: data.status,
            createdAt: data.createdAt,
          };

          if (data.status === "pending") {
            pending.push(request);
          } else if (data.status === "accepted") {
            accepted.push(request);
          } else if (data.status === "rejected") {
            rejected.push(request);
          }
        });

        const sortByDateTime = (a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        };

        setPendingRequests(pending.sort(sortByDateTime));
        setAcceptedRequests(accepted.sort(sortByDateTime));
        setRejectedRequests(rejected.sort(sortByDateTime));
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Failed to load patient requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const handleAccept = async (requestId) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "appointments", requestId), {
        status: "accepted",
        updatedAt: new Date().toISOString(),
      });

      const request = pendingRequests.find((r) => r.id === requestId);
      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
      setAcceptedRequests([
        ...acceptedRequests,
        { ...request, status: "accepted" },
      ]);

      toast.success("The appointment has been confirmed");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "appointments", requestId), {
        status: "rejected",
        updatedAt: new Date().toISOString(),
      });

      const request = pendingRequests.find((r) => r.id === requestId);
      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
      setRejectedRequests([
        ...rejectedRequests,
        { ...request, status: "rejected" },
      ]);

      toast.success("The appointment request has been declined");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (requestId, status) => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "appointments", requestId));

      if (status === "accepted") {
        setAcceptedRequests(acceptedRequests.filter((r) => r.id !== requestId));
      } else if (status === "rejected") {
        setRejectedRequests(rejectedRequests.filter((r) => r.id !== requestId));
      }

      toast.success("The appointment request has been removed");
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    } finally {
      setActionLoading(false);
    }
  };

  const RequestCard = ({
    request,
    showActions = false,
    showDelete = false,
  }) => (
    <Card key={request.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{request.patientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{request.patientName}</CardTitle>
              <CardDescription>
                {format(new Date(request.date), "EEEE, MMMM d, yyyy")} at{" "}
                {request.time}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={
              request.status === "pending"
                ? "outline"
                : request.status === "accepted"
                ? "success"
                : "destructive"
            }
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Session Type:</span>
            <span>{request.sessionType}</span>
          </div>
          {request.notes && (
            <div>
              <span className="text-sm font-medium">Patient Notes:</span>
              <p className="mt-1 text-sm text-muted-foreground">
                {request.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      {(showActions || showDelete) && (
        <CardFooter className="flex justify-end gap-2">
          {showActions && (
            <>
              <Button
                variant="outline"
                onClick={() => handleReject(request.id)}
                disabled={actionLoading}
              >
                Decline
              </Button>
              <Button
                onClick={() => handleAccept(request.id)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Accept"
                )}
              </Button>
            </>
          )}
          {showDelete && (
            <Button
              variant="destructive"
              onClick={() => handleDelete(request.id, request.status)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Patient Requests</h1>
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
    <Navbar />
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Patient Requests</h1>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({acceptedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Declined ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} showActions />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="mt-6">
            {acceptedRequests.length > 0 ? (
              acceptedRequests.map((request) => (
                <RequestCard key={request.id} request={request} showDelete />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No accepted requests</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedRequests.length > 0 ? (
              rejectedRequests.map((request) => (
                <RequestCard key={request.id} request={request} showDelete />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No declined requests</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout></>
  );
};