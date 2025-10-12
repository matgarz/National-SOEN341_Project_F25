<a href="/login">Sign in</a>
import { useState} from 'react'
import { Header } from './components/Header';
import StudentDashboard from './components/StudentDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('discover');
  const [userRole, setUserRole] = useState<'student' | 'organizer' | 'admin'>('student');
  const [searchQuery, setSearchQuery] = useState('');
  /* const [filters, setFilters] = useState<FilterState>({
    categories: [],
    ticketTypes: [],
    dateRange: 'all',
    location: '',
    sortBy: 'date-asc'
  });*/ 

  const getDefaultView = () => {
    switch (userRole) {
      case 'student':
        return 'discover';
      case 'organizer':
        return 'events';
      case 'admin':
        return 'admin-dashboard';
      default:
        return 'discover';
    }
  };

  // Auto-switch to appropriate view when role changes
  const handleRoleChange = (newRole: 'student' | 'organizer' | 'admin') => {
    setUserRole(newRole);
    setCurrentView(getDefaultView());
  };


  return (
    <div className="min-h-screen bg-background">
      <Header
        currentView={currentView}
        userRole={userRole}
        onViewChange={setCurrentView}
        onRoleChange={handleRoleChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <StudentDashboard />
      {/*<EventCard />*/}
      </div>
  )
}

