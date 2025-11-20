import { useEffect, useState } from "react";
import { getAuthHeader } from "../auth/tokenAuth";
import {
  Check,
  X,
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Edit2,
  Search,
  UserCheck,
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
import { Input } from "./ui/input";
import AdminOrganizations from "./AdminOrganizations";
import { LoadingSpinner } from "./LoadingAnimations";
import { AdminTCModal } from "./AdminTCModal";

interface Organization {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  _count?: {
    event: number;
  };
}

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  usersByRole: {
    STUDENT: number;
    ORGANIZER: number;
    ADMIN: number;
  };
  eventsByStatus: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    CANCELLED: number;
    COMPLETED: number;
  };
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  organization?: {
    id: number;
    name: string;
    isActive: boolean;
  };
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  _count?: {
    ticket: number;
    reviews: number;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  studentId: string;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
  accountStatus?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  organizationId: number | null;
  organization?: {
    id: number;
    name: string;
  };
  createdAt: string;
  _count?: {
    event: number;
    ticket: number;
    review: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventStatusFilter, setEventStatusFilter] = useState<string>("PENDING");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const [pendingOrganizers, setPendingOrganizers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [tcModal, setTcModal] = useState<{
    isOpen: boolean;
    type: "event" | "user";
    itemId: number;
    itemName: string;
    onAccept: () => void;
  }>({
    isOpen: false,
    type: "event",
    itemId: 0,
    itemName: "",
    onAccept: () => {},
  });
  // Fetch all data
  useEffect(() => {
    fetchStats();
    fetchEvents();
    fetchUsers();
    fetchPendingOrganizers();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [eventStatusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [userRoleFilter]);

  const getAuthHeaders = () => {
    return {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    };
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Pending Orgs
  const fetchPendingOrganizers = async () => {
    try {
      const response = await fetch(`/api/admin/users/pending-organizers`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setPendingOrganizers(data);
      }
    } catch (error) {
      console.error("Error fetching pending organizers:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      let url = `/api/admin/events`;
      if (eventStatusFilter !== "ALL") {
        url += `?status=${eventStatusFilter}`;
      }
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      let url = `/api/admin/users`;
      if (userRoleFilter !== "ALL") {
        url += `?role=${userRoleFilter}`;
      }
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Event actions
  const handleEventAction = async (
    eventId: number,
    newStatus: string,
    eventTitle: string,
  ) => {
    const statusActions: Record<string, string> = {
      APPROVED: "approve",
      REJECTED: "reject",
      CANCELLED: "cancel",
    };
    const action = statusActions[newStatus] || "change status of";

    if (newStatus === "APPROVED") {
      setTcModal({
        isOpen: true,
        type: "event",
        itemId: eventId,
        itemName: eventTitle,
        onAccept: () => performEventAction(eventId, newStatus, eventTitle),
      });
      return;
    }

    if (!confirm(`Are you sure you want to ${action} "${eventTitle}"?`)) {
      return;
    }
    await performEventAction(eventId, newStatus, eventTitle);
  };
  const performEventAction = async (
    eventId: number,
    newStatus: string,
    eventTitle: string,
  ) => {
    const statusActions: Record<string, string> = {
      APPROVED: "approve",
      REJECTED: "reject",
      CANCELLED: "cancel",
    };
    const action = statusActions[newStatus] || "change status of";

    try {
      const response = await fetch(`/api/admin/events/${eventId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update event status");
      alert(`Event ${action}d successfully`);
      fetchEvents();
      fetchStats();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event status");
    }
  };

  const handleApproveOrganizer = async (userId: number, userName: string) => {
    // Show T&C modal for organizer approval
    setTcModal({
      isOpen: true,
      type: "user",
      itemId: userId,
      itemName: userName,
      onAccept: () => performOrganizerApproval(userId, userName),
    });
  };

  // Separated function to actually perform the approval
  const performOrganizerApproval = async (userId: number, userName: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        alert("Organizer approved successfully!");
        fetchPendingOrganizers();
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        alert(
          `Failed to approve organizer: ${error.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error approving organizer:", error);
      alert("Failed to approve organizer");
    }
  };

  const handleRejectOrganizer = async (userId: number, userName: string) => {
    if (
      !confirm(
        `Reject organizer account for ${userName}? This cannot be undone.`,
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        alert("Organizer rejected successfully");
        fetchPendingOrganizers();
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        alert(
          `Failed to reject organizer: ${error.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error rejecting organizer:", error);
      alert("Failed to reject organizer");
    }
  };

  const handleDeleteEvent = async (eventId: number, eventTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${eventTitle}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete event");
      alert("Event deleted successfully");
      fetchEvents();
      fetchStats();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  // User actions
  const handleRoleChange = async (userId: number, role: string) => {
    if (
      !confirm(`Are you sure you want to change this user's role to ${role}?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      });

      if (!response.ok) throw new Error("Failed to update role");
      alert("User role updated successfully");
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete user");
      alert("User deleted successfully");
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ORGANIZER":
        return "bg-blue-100 text-blue-800";
      case "STUDENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter functions
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organization?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingEventsCount = stats?.eventsByStatus?.PENDING || 0;
  const flaggedEventsCount = 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Students: {stats?.usersByRole?.STUDENT || 0} | Organizers:{" "}
              {stats?.usersByRole?.ORGANIZER || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEventsCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Approved: {stats?.eventsByStatus?.APPROVED || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tickets Issued
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground">Total claimed</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending items */}
      {(pendingEventsCount > 0 || pendingOrganizers.length > 0) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              {pendingEventsCount > 0 && (
                <span className="text-orange-900">
                  {pendingEventsCount} event
                  {pendingEventsCount !== 1 ? "s" : ""} awaiting approval.
                </span>
              )}
              {pendingEventsCount > 0 && pendingOrganizers.length > 0 && " • "}
              {pendingOrganizers.length > 0 && (
                <span className="text-orange-900">
                  {pendingOrganizers.length} organizer account
                  {pendingOrganizers.length !== 1 ? "s" : ""} awaiting approval.
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-4"
              onClick={() => {
                // Switch to events tab if there are pending events
                if (pendingEventsCount > 0) {
                  setEventStatusFilter("PENDING");
                  document.querySelector('[value="events"]')?.click();
                }
              }}
            >
              Review Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Organizer Approvals Section */}
      {pendingOrganizers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">
                Pending Organizer Approvals
              </CardTitle>
            </div>
            <CardDescription className="text-blue-700">
              Review and approve organizer account requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOrganizers.map((organizer) => (
                <div
                  key={organizer.id}
                  className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {organizer.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {organizer.email}
                      </div>
                      {organizer.organization && (
                        <div className="text-sm text-gray-600 mt-1">
                          Organization:{" "}
                          <span className="font-medium">
                            {organizer.organization.name}
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Requested:{" "}
                        {new Date(organizer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleApproveOrganizer(organizer.id, organizer.name)
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleRejectOrganizer(organizer.id, organizer.name)
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-2 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-xl shadow-sm border border-gray-200">
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-105 transition-all duration-200 hover:bg-white/50 font-semibold text-sm"
          >
            📋 Event Moderation
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-105 transition-all duration-200 hover:bg-white/50 font-semibold text-sm"
          >
            👥 User Management
          </TabsTrigger>
          <TabsTrigger
            value="organizations"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-105 transition-all duration-200 hover:bg-white/50 font-semibold text-sm"
          >
            🏢 Organizations
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-105 transition-all duration-200 hover:bg-white/50 font-semibold text-sm"
          >
            📊 Platform Analytics
          </TabsTrigger>
        </TabsList>

        {/* EVENT MODERATION TAB */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Moderation</CardTitle>
              <CardDescription>
                Review and moderate event submissions
              </CardDescription>
              {/* Filters */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={eventStatusFilter}
                  onChange={(e) => setEventStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs text-gray-500">
                            {event.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{event.organization?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.user.name}</div>
                          <div className="text-xs text-gray-500">
                            {event.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{event._count?.ticket || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {event.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleEventAction(
                                    event.id,
                                    "APPROVED",
                                    event.title,
                                  )
                                }
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleEventAction(
                                    event.id,
                                    "REJECTED",
                                    event.title,
                                  )
                                }
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteEvent(event.id, event.title)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredEvents.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">
                    No Events Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {eventStatusFilter === "PENDING"
                      ? "No events pending approval"
                      : `No ${eventStatusFilter.toLowerCase()} events`}
                  </p>
                  {eventStatusFilter !== "ALL" && (
                    <Button
                      variant="outline"
                      onClick={() => setEventStatusFilter("ALL")}
                    >
                      View All Events
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* USER MANAGEMENT TAB */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
              {/* Filters */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="ORGANIZER">Organizers</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.studentId}</TableCell>

                      <TableCell>
                        <div className="text-xs">
                          {user._count?.event && (
                            <div>Events: {user._count.event}</div>
                          )}
                          {user._count?.ticket && (
                            <div>Tickets: {user._count.ticket}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingUser === user.id ? (
                          <div className="flex flex-col gap-2">
                            {/* Role selector */}
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="">Select Role</option>
                              <option value="STUDENT">Student</option>
                              <option value="ORGANIZER">Organizer</option>
                              <option value="ADMIN">Admin</option>
                            </select>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleRoleChange(user.id, newRole)
                                }
                                disabled={!newRole}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingUser(null);
                                  setNewRole("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            {user.organization && (
                              <span className="text-xs text-gray-600">
                                {user.organization.name}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {editingUser !== user.id && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingUser(user.id);
                                setNewRole(user.role);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteUser(user.id, user.name)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? `No users match "${searchTerm}"`
                      : userRoleFilter !== "ALL"
                        ? `No ${userRoleFilter.toLowerCase()} users`
                        : "No users in the system"}
                  </p>
                  {(searchTerm || userRoleFilter !== "ALL") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setUserRoleFilter("ALL");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORGANIZATIONS TAB */}
        <TabsContent value="organizations" className="space-y-6">
          <AdminOrganizations />
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <Analytics userRole="admin" />
        </TabsContent>
      </Tabs>
      {/* Admin T&C Modal */}
      <AdminTCModal
        isOpen={tcModal.isOpen}
        onClose={() => setTcModal({ ...tcModal, isOpen: false })}
        onAccept={tcModal.onAccept}
        type={tcModal.type}
        itemName={tcModal.itemName}
      />
    </div>
  );
}
