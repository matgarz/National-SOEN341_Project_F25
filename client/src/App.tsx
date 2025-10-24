import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { useAuth } from "./auth/AuthContext";
import QRCode from "./components/QRCode";

export default function App() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const userRole = user?.role ? user.role.toLowerCase() : "guest";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        user={user}
        userRole={userRole as "guest" | "student" | "organizer" | "admin"}
        onLogout={logout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="p-4 max-w-7xl mx-auto flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
