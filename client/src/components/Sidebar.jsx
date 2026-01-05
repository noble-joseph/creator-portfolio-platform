import { Link, useLocation } from 'react-router-dom';
import {
    MdDashboard,
    MdPhotoLibrary,
    MdPermMedia,
    MdPerson,
    MdMessage,
    MdSettings
} from 'react-icons/md';

export default function Sidebar({ userRole = 'photographer' }) {
    const location = useLocation();
    const path = location.pathname;

    // Theme configuration based on role
    const getTheme = () => {
        if (userRole === 'musician') {
            return {
                accent: 'text-gold-500',
                hover: 'hover:bg-wood-900/50 hover:text-gold-500',
                active: 'bg-wood-900/50 text-gold-500 border-r-2 border-gold-500',
                logo: 'text-gold-500'
            };
        }
        return {
            accent: 'text-cinemaAccent-400',
            hover: 'hover:bg-cinematic-800/50 hover:text-cinemaAccent-400',
            active: 'bg-cinematic-800/50 text-cinemaAccent-400 border-r-2 border-cinemaAccent-400',
            logo: 'text-cinemaAccent-400'
        };
    };

    const theme = getTheme();

    const navItems = [
        { label: 'Dashboard', icon: MdDashboard, to: '/dashboard' },
        { label: 'My Portfolio', icon: MdPhotoLibrary, to: '/portfolio' },
        { label: 'Media Library', icon: MdPermMedia, to: '/media' },
        { label: 'Profile', icon: MdPerson, to: `/profile/edit` }, // Assuming edit profile route
        { label: 'Feedback', icon: MdMessage, to: '/feedback' },
        { label: 'Settings', icon: MdSettings, to: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/10 z-50 flex flex-col">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <h1 className={`text-xl font-bold font-display tracking-wider ${theme.logo}`}>
                    CREATOR<span className="text-white">PORTFOLIO</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = path === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center px-6 py-3 transition-all duration-200 group ${isActive ? theme.active : `text-neutral-400 ${theme.hover}`
                                }`}
                        >
                            <item.icon className={`text-xl mr-3 ${isActive ? theme.accent : 'group-hover:text-current'}`} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Version info */}
            <div className="p-6 border-t border-white/5">
                <p className="text-xs text-neutral-600">v2.0.0 Creator Dashboard</p>
            </div>
        </aside>
    );
}
