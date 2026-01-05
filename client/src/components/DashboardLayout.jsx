import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config';

export default function DashboardLayout() {
    const { token, user: contextUser, loading: authLoading } = useAuth();
    const [user, setUser] = useState(contextUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If context already has user, use it
        if (contextUser) {
            setUser(contextUser);
            setLoading(false);
            return;
        }

        // Otherwise fetch it if we have a token
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchUser();
        }
    }, [token, contextUser, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            <Sidebar userRole={user?.role} />
            <TopBar user={user} userRole={user?.role} />

            {/* Main Content Area */}
            <main className="pl-64 pt-16 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet context={{ user, setUser }} />
                </div>
            </main>
        </div>
    );
}
