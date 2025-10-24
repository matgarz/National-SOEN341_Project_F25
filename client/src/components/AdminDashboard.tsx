import { useState } from "react";
import {
  Check,
  X,
  Eye,
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Analytics } from "./Analytics";

interface PendingEvent {
  id: string;
  title: string;
  organizer: string;
  organization: string;
  date: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  flagged: boolean;
}

interface OrganizerRequest {
  id: string;
  name: string;
  email: string;
  organization: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminDashboard() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([
    {
      id: "1",
      title: "AI Research Symposium",
      organizer: "Dr. Sarah Chen",
      organization: "Computer Science Dept",
      date: "2024-11-15",
      category: "Academic",
      status: "pending",
      flagged: false,
    },
    {
      id: "2",
      title: "Spring Carnival 2024",
      organizer: "Student Activities",
      organization: "Student Government",
      date: "2024-11-20",
      category: "Social",
      status: "pending",
      flagged: true,
    },
    {
      id: "3",
      title: "Career Networking Night",
      organizer: "Career Services",
      organization: "Career Center",
      date: "2024-11-18",
      category: "Career",
      status: "pending",
      flagged: false,
    },
  ]);

  const [organizerRequests, setOrganizerRequests] = useState<
    OrganizerRequest[]
  >([
    {
      id: "1",
      name: "Alex Rodriguez",
      email: "alex.r@university.edu",
      organization: "Engineering Society",
      requestDate: "2024-10-28",
      status: "pending",
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria.santos@university.edu",
      organization: "Cultural Club",
      requestDate: "2024-10-30",
      status: "pending",
    },
  ]);

  const handleEventAction = (eventId: string, action: "approve" | "reject") => {
    setPendingEvents((events) =>
      events.map((event) =>
        event.id === eventId
          ? { ...event, status: action === "approve" ? "approved" : "rejected" }
          : event,
      ),
    );
  };

  const handleOrganizerAction = (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    setOrganizerRequests((requests) =>
      requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: action === "approve" ? "approved" : "rejected",
            }
          : request,
      ),
    );
  };

  const pendingEventsCount = pendingEvents.filter(
    (e) => e.status === "pending",
  ).length;
  const pendingOrganizersCount = organizerRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const flaggedEventsCount = pendingEvents.filter(
    (e) => e.flagged && e.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Manage platform content, users, and monitor system health
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEventsCount}</div>
            <p className="text-xs text-muted-foreground">
              {flaggedEventsCount > 0 && (
                <span className="text-red-600">
                  {flaggedEventsCount} flagged
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Organizer Requests
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrganizersCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Organizations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {flaggedEventsCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {flaggedEventsCount} event{flaggedEventsCount > 1 ? "s" : ""}{" "}
            flagged for review. Please check the moderation queue.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Event Moderation</TabsTrigger>
          <TabsTrigger value="organizers">Organizer Requests</TabsTrigger>
          <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Events</CardTitle>
              <CardDescription>
                Review and moderate event submissions before they go live
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{event.title}</span>
                          {event.flagged && (
                            <Badge variant="destructive" className="text-xs">
                              Flagged
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{event.organizer}</TableCell>
                      <TableCell>{event.organization}</TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.status === "approved"
                              ? "default"
                              : event.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event.status === "pending" ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEventAction(event.id, "approve")
                              }
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEventAction(event.id, "reject")
                              }
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No actions
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organizer Requests</CardTitle>
              <CardDescription>
                Review applications for organizer accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizerRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.name}
                      </TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.organization}</TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleOrganizerAction(request.id, "approve")
                              }
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleOrganizerAction(request.id, "reject")
                              }
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No actions
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Analytics userRole="admin" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
