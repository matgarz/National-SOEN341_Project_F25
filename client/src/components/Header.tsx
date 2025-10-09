import { Bell, Calendar, LayoutDashboard, PlusCircle, Search, User, Users } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

interface HeaderProps {
  currentView: string;
  userRole: 'student' | 'organizer' | 'admin';
  onViewChange: (view: string) => void;
  onRoleChange: (role: 'student' | 'organizer' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ 
  currentView, 
  userRole, 
  onViewChange, 
  onRoleChange, 
  searchQuery, 
  onSearchChange 
}: HeaderProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'organizer': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.header 
      className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Calendar className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                CampusEvents
              </h1>
            </motion.div>
            
            {/* Role Switcher for Demo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Select value={userRole} onValueChange={onRoleChange}>
                <SelectTrigger className="w-32 border-primary/20 hover:border-primary/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            
            <motion.div
              key={userRole}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Badge className={`${getRoleColor(userRole)} shadow-sm`}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </motion.div>
          </div>

          {/* Search Bar */}
          {(currentView === 'discover' || currentView === 'events') && (
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

          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            {userRole === 'student' && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={currentView === 'discover' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('discover')}
                    className={`flex items-center space-x-1 transition-all duration-200 ${
                      currentView === 'discover' 
                        ? 'gradient-primary text-white shadow-md' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    <Search className="h-4 w-4" />
                    <span>Discover</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={currentView === 'my-events' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('my-events')}
                    className={`flex items-center space-x-1 transition-all duration-200 ${
                      currentView === 'my-events' 
                        ? 'gradient-primary text-white shadow-md' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>My Events</span>
                  </Button>
                </motion.div>
              </>
            )}

            {userRole === 'organizer' && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={currentView === 'events' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('events')}
                    className={`flex items-center space-x-1 transition-all duration-200 ${
                      currentView === 'events' 
                        ? 'gradient-secondary text-white shadow-md' 
                        : 'hover:bg-green-50'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Events</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={currentView === 'create-event' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('create-event')}
                    className={`flex items-center space-x-1 transition-all duration-200 ${
                      currentView === 'create-event' 
                        ? 'gradient-secondary text-white shadow-md' 
                        : 'hover:bg-green-50'
                    }`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Create</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={currentView === 'analytics' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('analytics')}
                    className={`flex items-center space-x-1 transition-all duration-200 ${
                      currentView === 'analytics' 
                        ? 'gradient-secondary text-white shadow-md' 
                        : 'hover:bg-green-50'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Analytics</span>
                  </Button>
                </motion.div>
              </>
            )}

            {userRole === 'admin' && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={currentView === 'admin-dashboard' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('admin-dashboard')}
                    className={`flex items-center space-x-1 transition-all duration-200 ${
                      currentView === 'admin-dashboard' 
                        ? 'gradient-accent text-white shadow-md' 
                        : 'hover:bg-orange-50'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={currentView === 'moderate' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('moderate')}
                    className={`flex items-center space-x-1 transition-all duration-200 ${
                      currentView === 'moderate' 
                        ? 'gradient-accent text-white shadow-md' 
                        : 'hover:bg-orange-50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Moderate</span>
                  </Button>
                </motion.div>
              </>
            )}

            {/* User Actions */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
                <Bell className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
                <User className="h-4 w-4" />
              </Button>
            </motion.div>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}