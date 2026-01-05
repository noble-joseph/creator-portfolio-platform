import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaRegCircle, FaFileAlt, FaCalendarAlt, FaChevronLeft, FaPaperPlane } from 'react-icons/fa';

const ProjectWorkspace = ({ collaboration, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const progress = collaboration.progressPercentage || 0;

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white p-8 rounded-3xl border border-white/5 shadow-2xl">
            {/* Workspace Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-6">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white/5 rounded-full hover:bg-[#008080] transition-all group"
                    >
                        <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <span className="px-3 py-0.5 bg-[#008080]/20 text-[#008080] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#008080]/30">
                                {collaboration.status}
                            </span>
                            <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                                ID: {collaboration._id?.slice(-6)}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{collaboration.title}</h1>
                    </div>
                </div>

                <div className="flex items-center space-x-8">
                    <div className="text-right">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Completion</p>
                        <div className="flex items-center space-x-3">
                            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-[#008080] to-[#00CED1]"
                                />
                            </div>
                            <span className="text-lg font-bold text-[#008080]">{progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workspace Navigation */}
            <div className="flex space-x-12 border-b border-white/5 mb-10">
                {['overview', 'milestones', 'assets', 'communication'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-[#008080]' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008080]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-10">
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Perspective</h3>
                                    <p className="text-xl font-serif italic text-gray-300 leading-relaxed">
                                        "{collaboration.description}"
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Active Participants</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {collaboration.participants?.map((p, i) => (
                                            <div key={i} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <img
                                                    src={p.user?.profilePhoto || '/default-avatar.png'}
                                                    alt={p.user?.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                                                />
                                                <div>
                                                    <p className="font-bold text-white text-sm">{p.user?.name}</p>
                                                    <p className="text-[10px] text-[#008080] font-bold uppercase tracking-widest">{p.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8">
                                <div className="p-6 bg-[#CC5500]/10 border border-[#CC5500]/20 rounded-3xl">
                                    <h4 className="text-[#CC5500] text-xs font-bold uppercase tracking-widest mb-4 flex items-center">
                                        <FaCalendarAlt className="mr-2" /> Timeline
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Started:</span>
                                            <span className="text-white font-medium">{new Date(collaboration.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {collaboration.timeline?.endDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Deadline:</span>
                                                <span className="text-white font-medium">{new Date(collaboration.timeline.endDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Resources</h4>
                                    <div className="space-y-3">
                                        {collaboration.resources?.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-300">{r.name}</span>
                                                <span className={`px-2 py-0.5 rounded-full ${r.status === 'provided' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                                    {r.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'milestones' && (
                        <div className="max-w-2xl space-y-6">
                            {collaboration.timeline?.milestones?.length > 0 ? (
                                collaboration.timeline.milestones.map((m, i) => (
                                    <div key={i} className={`p-6 rounded-2xl border transition-all ${m.completed ? 'bg-[#008080]/5 border-[#008080]/20' : 'bg-white/5 border-white/10'}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex space-x-4">
                                                {m.completed ? <FaCheckCircle className="text-[#008080] mt-1" /> : <FaRegCircle className="text-gray-600 mt-1" />}
                                                <div>
                                                    <h4 className={`font-bold ${m.completed ? 'text-gray-400 line-through' : 'text-white'}`}>{m.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                                                    {m.dueDate && <p className="text-[10px] text-[#CC5500] font-bold uppercase tracking-widest mt-2">Due {new Date(m.dueDate).toLocaleDateString()}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No milestones defined for this phase</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assets' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {collaboration.deliverables?.flatMap(d => d.files || [])?.map((f, i) => (
                                <div key={i} className="group relative bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-[#008080] transition-all">
                                    <FaFileAlt className="text-3xl text-gray-600 group-hover:text-[#008080] transition-colors mb-4" />
                                    <h4 className="font-bold text-sm truncate">{f.name}</h4>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{f.type} • {(f.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <a href={f.url} className="absolute inset-0" target="_blank" rel="noopener noreferrer"></a>
                                </div>
                            ))}
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-[#008080]/50 transition-all cursor-pointer group">
                                <div className="p-3 bg-white/5 rounded-full group-hover:bg-[#008080]/20 mb-3 transition-all">
                                    <FaPlus className="text-gray-600 group-hover:text-[#008080]" />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Upload Asset</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'communication' && (
                        <div className="bg-white/5 rounded-3xl border border-white/5 h-[500px] flex flex-col">
                            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                                {collaboration.communication?.map((c, i) => (
                                    <div key={i} className={`flex ${c.author === collaboration.initiator._id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${c.author === collaboration.initiator._id ? 'bg-[#008080] text-white' : 'bg-white/10 text-gray-300'}`}>
                                            <p>{c.content}</p>
                                            <span className="text-[10px] opacity-40 mt-1 block">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 border-t border-white/5 flex space-x-4">
                                <input
                                    type="text"
                                    placeholder="Type a message to the team..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-sm focus:border-[#008080] outline-none transition-all"
                                />
                                <button className="p-4 bg-[#008080] text-white rounded-xl hover:scale-105 transition-all">
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ProjectWorkspace;
