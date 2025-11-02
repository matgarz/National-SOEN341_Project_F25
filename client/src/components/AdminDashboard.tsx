import { useEffect, useState } from "react";
import { getAuthHeader } from "../auth/tokenAuth";
import {
  Check,
  X,
  //Eye,
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Edit2,
  //Building2,
  Search,
  //Filter,
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

interface Organization {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  _count?: {
    event: number;
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);


  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  // Fetch all data
  useEffect(() => {
    fetchStats();
    fetchEvents();
    fetchUsers();
    fetchOrganizations();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [eventStatusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [userRoleFilter]);

  const getAuthHeaders = () => {
    //const token = localStorage.getItem("token");
    return {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    };
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
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

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/organizations`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch organizations");
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      let url = `${API_BASE_URL}/api/admin/events`;
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
      let url = `${API_BASE_URL}/api/admin/users`;
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

    if (!confirm(`Are you sure you want to ${action} "${eventTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/events/${eventId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) throw new Error("Failed to update event status");
      alert(`Event ${action}d successfully`);
      fetchEvents();
      fetchStats();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event status");
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
      const response = await fetch(
        `${API_BASE_URL}/api/admin/events/${eventId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

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
  const handleRoleChange = async (
    userId: number,
    role: string,
    organizationId?: number | null,
  ) => {
    if (
      !confirm(`Are you sure you want to change this user's role to ${role}?`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            role,
            organizationId: role === "ORGANIZER" ? organizationId : null,
          }),
        },
      );

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
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

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
        <div className="text-xl">Loading admin dashboard...</div>
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

      {/* Alerts */}
      {pendingEventsCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {pendingEventsCount} event{pendingEventsCount > 1 ? "s" : ""}{" "}
            awaiting approval. Please review the moderation queue.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Event Moderation</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
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
                          <span className="font-medium">{event.title}</span>
                          <div className="text-xs text-gray-500">
                            {event.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{event.organization?.name || "N/A"}</TableCell>
                      <TableCell>{event.user?.name}</TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(event.status)}
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{event._count?.ticket || 0}</TableCell>
                      <TableCell>
                        {event.status === "PENDING" ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEventAction(
                                  event.id,
                                  "APPROVED",
                                  event.title,
                                )
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEventAction(
                                  event.id,
                                  "REJECTED",
                                  event.title,
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
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
                        ) : event.status === "APPROVED" ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEventAction(
                                  event.id,
                                  "CANCELLED",
                                  event.title,
                                )
                              }
                            >
                              Cancel
                            </Button>
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
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteEvent(event.id, event.title)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No events found matching your criteria
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
                    <TableHead>Role</TableHead>
                    <TableHead>Activity</TableHead>
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

                            {/* Organization selector - only show for organizers */}
                            {newRole === "ORGANIZER" && (
                              <select
                                value={user.organizationId || ""}
                                onChange={(e) => {
                                  const orgId = e.target.value
                                    ? parseInt(e.target.value)
                                    : null;
                                  user.organizationId = orgId;
                                }}
                                className="text-sm border rounded px-2 py-1"
                              >
                                <option value="">No Organization</option>
                                {organizations.map((org) => (
                                  <option key={org.id} value={org.id}>
                                    {org.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleRoleChange(
                                    user.id,
                                    newRole,
                                    user.organizationId,
                                  )
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
                <div className="text-center py-8 text-gray-500">
                  No users found matching your criteria
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
    </div>
  );
}
