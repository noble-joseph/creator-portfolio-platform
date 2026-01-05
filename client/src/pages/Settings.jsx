import { motion } from 'framer-motion';
import { FaUserEdit, FaBell, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Settings() {
    const settingsOptions = [
        { id: 'profile', icon: FaUserEdit, label: 'Profile Settings', sub: 'Edit your specialization, genre, and bio', link: '/profile/edit', color: 'text-blue-400' },
        { id: 'security', icon: FaShieldAlt, label: 'Security & Privacy', sub: 'Manage passwords and account visibility', color: 'text-purple-400' },
        { id: 'notifications', icon: FaBell, label: 'Notifications', sub: 'Configure email and platform alerts', color: 'text-green-400' },
        { id: 'logout', icon: FaSignOutAlt, label: 'Logout', sub: 'Securely sign out of your account', color: 'text-red-400' }
    ];

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-black text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
            >
                <h1 className="text-5xl font-bold mb-12 tracking-tighter uppercase text-center">
                    Command Center
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settingsOptions.map((opt) => (
                        opt.link ? (
                            <Link
                                to={opt.link}
                                key={opt.id}
                                className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-white/20 hover:bg-white/10 transition-all group"
                            >
                                <opt.icon className={`w-10 h-10 mb-6 ${opt.color} group-hover:scale-110 transition-transform`} />
                                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">{opt.label}</h3>
                                <p className="text-gray-500 text-sm font-serif italic">{opt.sub}</p>
                            </Link>
                        ) : (
                            <div
                                key={opt.id}
                                className="bg-white/5 border border-white/10 p-8 rounded-3xl opacity-50 cursor-not-allowed group"
                            >
                                <opt.icon className="w-10 h-10 mb-6 text-gray-600" />
                                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-gray-600">{opt.label}</h3>
                                <p className="text-gray-700 text-sm font-serif italic">Temporarily offline for maintenance</p>
                            </div>
                        )
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
