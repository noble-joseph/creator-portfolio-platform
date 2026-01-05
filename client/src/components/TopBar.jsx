import { MdLogout, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ user, userRole = 'photographer' }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getTheme = () => {
        if (userRole === 'musician') {
            return {
                accent: 'text-gold-500',
                button: 'bg-gold-500 text-black hover:bg-gold-600',
                badge: 'bg-gold-500/10 text-gold-500 border-gold-500/20'
            };
        }
        return {
            accent: 'text-cinemaAccent-400',
            button: 'bg-cinemaAccent-500 text-white hover:bg-cinemaAccent-600',
            badge: 'bg-cinemaAccent-500/10 text-cinemaAccent-400 border-cinemaAccent-500/20'
        };
    };

    const theme = getTheme();

    return (
        <header className="h-16 fixed top-0 right-0 left-64 bg-black/80 backdrop-blur-md border-b border-white/10 z-40 flex items-center justify-between px-8">
            {/* Left: Page Title / Breadcrumb could go here, for now empty or Welcome */}
            <div className="flex items-center space-x-4">
                {/* Placeholder for future breadcrumbs */}
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center space-x-6">
                {/* Visibility Toggle (Mock functionality for UI) */}
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Portfolio:</span>
                    <button className="flex items-center space-x-1.5 text-xs font-bold text-green-500 hover:text-green-400 transition-colors">
                        <MdVisibility className="text-sm" />
                        <span>Public</span>
                    </button>
                </div>

                {/* Preview Button */}
                <a
                    href={`/profile/${user?._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl ${theme.button}`}
                >
                    <span>Preview Portfolio</span>
                </a>

                <div className="h-6 w-px bg-white/10 mx-2"></div>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white leading-none">{user?.name || 'Creator'}</p>
                        <p className={`text-xs mt-1 capitalize ${theme.accent}`}>{userRole}</p>
                    </div>
                    <div className="relative group">
                        <img
                            src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
                        />
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title="Logout"
                    >
                        <MdLogout className="text-xl" />
                    </button>
                </div>
            </div>
        </header>
    );
}
