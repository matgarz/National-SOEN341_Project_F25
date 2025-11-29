// routes/router.tsx
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import ErrorHandler from "./RouteErrorHandler";
import NotFound from "./NotFound";
import NoAccess from "../components/auth/NoAccess";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import StudentDashboard from "../components/student/StudentDashboard";
import OrganizerCreateEvent from "../components/organizer/OrganizerCreateEvent";
import Calendar from "../components/user/Calendar";
import MyEvents from "../components/user/MyEvents";
import { useAuth } from "../auth/AuthContext";
import OrganizerDashboard from "../components/organizer/OrganizerDashboard";
import AdminDashboard from "../components/admin/AdminDashboard";
import OrganizerEventAnalytics from "../components/organizer/OrganizerEventAnalytics";

type Role = "STUDENT" | "ORGANIZER" | "ADMIN";

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const role = (user.role ?? "").toUpperCase() as Role;
  if (allowedRoles && !allowedRoles.includes(role))
    return <Navigate to="/no-access" replace />;

  return <>{children}</>;
}

function LoggedInRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <>{children}</>;
  return <Navigate to="/" replace />;
}

function IndexRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const role = (user.role ?? "").toUpperCase();
  if (role === "STUDENT") return <Navigate to="/student-dashboard" replace />;
  if (role === "ORGANIZER")
    return <Navigate to="/organizer-dashboard" replace />;
  if (role === "ADMIN") return <Navigate to="/admin-dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorHandler />,
    children: [
      { index: true, element: <IndexRedirect /> },

      {
        path: "login",
        element: (
          <LoggedInRedirect>
            <Login />
          </LoggedInRedirect>
        ),
      },
      {
        path: "register",
        element: (
          <LoggedInRedirect>
            <Register />
          </LoggedInRedirect>
        ),
      },

      {
        path: "student-dashboard",
        element: (
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: "organizer-dashboard",
        element: (
          <ProtectedRoute allowedRoles={["ORGANIZER"]}>
            <OrganizerDashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: "create-event",
        element: (
          <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]}>
            <OrganizerCreateEvent />
          </ProtectedRoute>
        ),
      },

      {
        path: "organizer/event/:id/analytics",
        element: (
          <ProtectedRoute allowedRoles={["ORGANIZER"]}>
            <OrganizerEventAnalytics />
          </ProtectedRoute>
        ),
      },

      {
        path: "calendar",
        element: (
          <ProtectedRoute allowedRoles={["STUDENT", "ORGANIZER", "ADMIN"]}>
            <Calendar />
          </ProtectedRoute>
        ),
      },

      {
        path: "my-events",
        element: (
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <MyEvents />
          </ProtectedRoute>
        ),
      },

      {
        path: "admin/events-calendar",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Calendar showAllEvents={true} />
          </ProtectedRoute>
        ),
      },

      { path: "no-access", element: <NoAccess /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
