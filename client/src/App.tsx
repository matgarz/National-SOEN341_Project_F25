import { useState } from 'react';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import OrganizerCreateEvent from './components/OrganizerCreateEvent';
import { useAuth } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';

export default function App() {
    const { user, logout } = useAuth(); // get logout from AuthContext
    const [currentView, setCurrentView] = useState('login'); // default for guests
    const [searchQuery, setSearchQuery] = useState('');

    const userRole = user ? (user.role.toLowerCase() as 'student' | 'organizer' | 'admin') : 'guest';

    const handleRoleChange = (newRole: 'student' | 'organizer' | 'admin') => {
        setCurrentView(getDefaultView(newRole));
    };

    function getDefaultView(role: string) {
        switch (role) {
            case 'student': return 'discover';
            case 'organizer': return 'events';
            case 'admin': return 'admin-dashboard';
            default: return 'login';
        }
    }

    // --- ADD HANDLELOGOUT HERE ---
    const handleLogout = () => {
        logout(); // clear user from context + localStorage
        setCurrentView('login'); // redirect to login page
    };

    console.log('Current user:', user);


    return (
        <div className="min-h-screen bg-background">
            {/* Header always visible */}
            <Header
                user={user}
                currentView={currentView}
                userRole={userRole}
                onViewChange={setCurrentView}
                onRoleChange={handleRoleChange}
                onLogout={handleLogout}   // <-- pass it here
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Main content */}
            <main className="p-4 max-w-7xl mx-auto">
                {userRole === 'guest' && currentView === 'login' && <Login />}
                {userRole === 'guest' && currentView === 'register' && <Register />}

                {userRole === 'student' && <StudentDashboard />}

                {userRole === 'organizer' && currentView === 'events' && <StudentDashboard />}
                {userRole === 'organizer' && currentView === 'create-event' && <OrganizerCreateEvent />}

                {userRole === 'admin' && <div>Admin dashboard placeholder</div>}
            </main>
        </div>
    );
}
