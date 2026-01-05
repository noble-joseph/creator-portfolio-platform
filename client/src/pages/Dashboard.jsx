import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { MdCheckCircle, MdPending, MdArrowForward, MdGridView, MdAudiotrack, MdPermMedia } from "react-icons/md";
import { API_BASE } from "../config";

export default function Dashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState({
    totalProjects: 0,
    mediaItems: 0,
    published: 0,
    drafts: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const res = await fetch(`${API_BASE}/api/creator/portfolio`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Calculate stats
          const total = data.length;
          const pub = data.filter(i => i.isPublic !== false).length;
          const drafts = total - pub;
          const media = data.reduce((acc, curr) => acc + (curr.mediaFiles?.length || 0), 0);

          setStats({
            totalProjects: total,
            mediaItems: media,
            published: pub,
            drafts: drafts
          });

          // Recent items for preview
          setRecentItems(data.slice(0, 3));

          // Real actions from portfolio data
          const actions = data.slice(0, 3).map(item => ({
            id: item._id,
            icon: item.category === 'music' ? "🎵" : "🎞️",
            text: `Uploaded "${item.title}"`,
            time: new Date(item.createdAt).toLocaleDateString()
          }));

          // Add profile update action if it's recent
          if (user.updatedAt) {
            actions.unshift({
              id: 'profile-update',
              icon: "✨",
              text: "Updated profile bio",
              time: new Date(user.updatedAt).toLocaleDateString()
            });
          }

          setRecentItems(data.slice(0, 3));
          // We'll use a local variable for actions in the render or add state
          setActions(actions.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const [actions, setActions] = useState([]);

  // Calculate real profile completion
  const calculateCompletion = () => {
    if (!user) return 0;
    let score = 0;
    if (user.bio) score += 20;
    if (user.profilePhoto) score += 20;
    if (user.skills?.length > 0) score += 20;
    if (user.experiences?.length > 0) score += 20;
    if (user.specialization) score += 20;
    return score;
  };

  const completion = calculateCompletion();

  // Theme helpers
  const getTheme = () => {
    if (user?.role === 'musician') {
      return {
        accent: 'text-gold-500',
        bg: 'bg-wood-900/40',
        border: 'border-gold-500/20',
        gradient: 'bg-wood-gradient',
        tip: "Adding tags to your tracks increases discovery by music supervisors by 40%."
      };
    }
    return {
      accent: 'text-cinemaAccent-400',
      bg: 'bg-cinematic-900/40',
      border: 'border-cinemaAccent-500/20',
      gradient: 'bg-cinematic-gradient',
      tip: "High-contrast thumbnails for your videos increase click-through rates by 25%."
    };
  };

  const theme = getTheme();

  if (loading) return null;

  return (
    <div className="space-y-8 fade-in">

      {/* Section 1: Creator Snapshot */}
      <section className={`p-8 rounded-2xl border border-white/10 relative overflow-hidden ${theme.bg}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {/* Progress Circle */}
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-700" />
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={226} strokeDashoffset={226 * (1 - completion / 100)} className={`${theme.accent}`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{completion}%</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-display">
                Profile Completion
              </h2>
              <div className="flex items-center space-x-3 mt-1 text-neutral-400">
                <span className="capitalize">{user?.role}</span>
                <span>•</span>
                <span className="capitalize">{user?.experienceLevel || 'Beginner'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 flex items-center space-x-4">
            <div className="px-4 py-2 bg-black/40 rounded-lg border border-white/10 flex items-center space-x-2">
              <span className="text-sm text-neutral-400">portfolio.com/</span>
              <span className="text-sm font-medium text-white">{user?.username || 'user'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/profile/${user?._id}`)}
                className={`ml-2 text-xs uppercase font-bold ${theme.accent} hover:opacity-80`}
              >
                Copy
              </button>
            </div>
            <Link to="/profile/edit" className="btn btn-secondary">
              Edit Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Portfolio Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={stats.totalProjects} icon={<MdGridView />} theme={theme} />
        <StatCard title="Media Items" value={stats.mediaItems} icon={<MdPermMedia />} theme={theme} />
        <StatCard title="Published" value={stats.published} icon={<MdCheckCircle />} theme={theme} />
        <StatCard title="Drafts" value={stats.drafts} icon={<MdPending />} theme={theme} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Section 3: Portfolio Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Portfolio Preview</h3>
            <span className="text-sm text-neutral-400">As seen by public</span>
          </div>

          <div className={`min-h-[300px] rounded-xl border border-white/5 bg-black/40 p-6 ${theme.border}`}>
            {recentItems.length > 0 ? (
              user?.role === 'musician' ? (
                // Musician Preview (Playlist Style)
                <div className="space-y-3">
                  {recentItems.map((item, i) => (
                    <div key={item._id} className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                      <span className="w-8 text-neutral-500 font-mono text-sm">{i + 1}</span>
                      <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center mr-4">
                        {item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover rounded" /> : <MdAudiotrack />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white group-hover:text-gold-400 transition-colors">{item.title}</h4>
                        <p className="text-xs text-neutral-500">{item.category}</p>
                      </div>
                      <span className="text-xs text-neutral-500">{item.mediaFiles?.[0]?.duration ? `${Math.floor(item.mediaFiles[0].duration / 60)}:${(item.mediaFiles[0].duration % 60).toString().padStart(2, '0')}` : '--:--'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                // Photographer/Cinematographer Preview (Grid Style)
                <div className="grid grid-cols-3 gap-4">
                  {recentItems.map((item) => (
                    <div key={item._id} className="aspect-square rounded-lg bg-neutral-800 overflow-hidden relative group">
                      <img
                        src={item.thumbnail || item.mediaFiles?.[0]?.url || 'https://via.placeholder.com/300'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-medium text-white px-2 py-1 bg-black/60 rounded backdrop-blur-sm">View</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500 py-12">
                <p>No published items yet.</p>
                <Link to="/portfolio" className={`mt-4 text-sm font-medium ${theme.accent}`}>Add your first project &rarr;</Link>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Recent Actions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Actions</h3>
          </div>

          <div className="space-y-4">
            {actions.length > 0 ? actions.map(action => (
              <ActionItem
                key={action.id}
                icon={action.icon}
                text={action.text}
                time={action.time}
              />
            )) : (
              <p className="text-sm text-neutral-500">No recent actions recorded.</p>
            )}
          </div>

          <div className={`p-6 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-white/10 mt-8`}>
            <h4 className="font-bold text-white mb-2">Pro Tip</h4>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {theme.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, theme }) {
  return (
    <div className="bg-black/40 border border-white/10 p-6 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-neutral-400 font-medium text-sm">{title}</span>
        <span className={`text-xl text-neutral-600 group-hover:${theme.accent} transition-colors`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold font-display">{value}</div>
    </div>
  );
}

function ActionItem({ icon, text, time }) {
  return (
    <div className="flex items-center p-4 rounded-lg border border-white/5 bg-white/5 hover:border-white/10 transition-colors">
      <span className="text-xl mr-4">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{text}</p>
        <p className="text-xs text-neutral-500">{time}</p>
      </div>
      <MdArrowForward className="text-neutral-600" />
    </div>
  );
}
