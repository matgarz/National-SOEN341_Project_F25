import { Calendar, Search, User } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import {useNavigate} from "react-router-dom";
import BackButton from "../routes/BackButton.tsx";
//import {
//Select,
//SelectContent,
//SelectItem,
//SelectTrigger,
//SelectValue,
//} from "./ui/select";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

interface HeaderProps {
  user: any;
  currentView?: string;
  userRole: "student" | "organizer" | "admin" | "guest";
  onViewChange?: (view: string) => void;
  onRoleChange?: (role: "student" | "organizer" | "admin") => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({
  user,
  currentView,
  userRole,
  onViewChange,
  //onRoleChange,
  onLogout,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "organizer":
        return "bg-green-100 text-green-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "guest":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigate = useNavigate();

  return (
    <motion.header
      className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Role/Guest buttons */}
          <div className="flex items-center space-x-4">
            <BackButton></BackButton>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Calendar className="h-8 w-8 text-primary" />
            </motion.div>
            <Link to="/">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-violet-700">
                CampusEvents
              </h1>
            </Link>

            {/* Guest */}
            {userRole === "guest" && (
              <div className="flex items-center space-x-2">
                <Button
                  className="cursor-pointer"
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  className="cursor-pointer"
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
                <Badge className={`${getRoleColor(userRole)} shadow-sm`}>
                  Guest
                </Badge>
              </div>
            )}

            {/* Logged-in user */}
            {userRole !== "guest" && user && (
              <div className="flex items-center gap-4">
                {/* Role badge */}
                <Badge className={`${getRoleColor(userRole)} shadow-sm`}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>

                {/* Username */}
                <Badge className="bg-gray-200 text-gray-800 shadow-sm">
                  {user.name}
                </Badge>

                {/* Logout button with red text */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Center: Search */}
          {(currentView === "discover" || currentView === "events") && (
            <motion.div
              className="flex-1 max-w-md mx-8"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                />
              </div>
            </motion.div>
          )}

          {/* Right: Notification/User icons */}
          <nav className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                to={
                  userRole === "admin"
                    ? "/admin/events-calendar"
                    : userRole === "student"
                      ? "/my-events"
                      : "/calendar"
                }
                className="flex gap-2 items-center px-3 py-2 rounded hover:bg-primary/10 transition-colors text-base"
                style={{ textDecoration: "none" }}
              >
                <Calendar className="h-4 w-4" />
                {userRole === "admin" ? "All Events" : "My Events"}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 transition-colors"
              >
                <User className="h-4 w-4" />
              </Button>
            </motion.div>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
