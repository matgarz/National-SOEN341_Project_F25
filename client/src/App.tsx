import { useState } from 'react';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import OrganizerCreateEvent from './components/OrganizerCreateEvent';
import { useAuth } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import { Route, Routes} from 'react-router-dom';
import CalendarApp from './components/Calendar';
import { Navigate } from 'react-router-dom';

export default function App() {
    const { user, logout } = useAuth(); // get logout from AuthContext
    const [searchQuery, setSearchQuery] = useState('');
    const userRole = user ? (user.role.toLowerCase() as 'student' | 'organizer' | 'admin') : 'guest';
    
    // logging user out
    const handleLogout = () => {
        logout(); 
    };

    // for debugging
    console.log('Current user:', user);


    return (
        <div className="min-h-screen bg-background">
            {/* Header always visible */}
            <Header
                user={user}
                userRole={userRole}
                onLogout={handleLogout}   
                searchQuery={searchQuery} //needed to be implemnented
                onSearchChange={setSearchQuery}  //needed to be implemnented 
            />

            {/* Main content */}
            <main className="p-4 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={user?.role === "STUDENT" ? <StudentDashboard /> : <Navigate to="/login" />} />
                    <Route path="/create-event" element={user?.role === "ORGANIZER" ? <OrganizerCreateEvent /> : <Navigate to="/login" />} />
                    <Route path="/calendar" element={<CalendarApp />} />
                    <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
                </Routes>
            </main>
        </div>
    );
}
