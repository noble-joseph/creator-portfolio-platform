import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";
import {
  PortfolioStatsWidget,
  RecentActivityWidget,
  ConnectionRequestsWidget,
  QuickActionsWidget
} from "../components/DashboardWidget";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data including specialization and profile photo
        const userResponse = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (userResponse.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (userResponse.ok) {
          const data = await userResponse.json();
          setUserData(data);
        }

        // Fetch portfolio data (latest 3 works)
        const portfolioResponse = await fetch(`${API_BASE}/api/portfolio/latest?limit=3`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (portfolioResponse.ok) {
          const data = await portfolioResponse.json();
          setPortfolio(data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);

  const getTheme = (role) => {
    if (role === 'musician') {
      return {
        bg: 'bg-wood-gradient',
        text: 'text-wood-50',
        accent: 'text-gold-500',
        gradient: 'bg-gradient-to-r from-gold-500 to-gold-700',
        cardHeader: 'border-gold-600/20'
      };
    }
    return {
      bg: 'bg-cinematic-gradient',
      text: 'text-cinematic-100',
      accent: 'text-cinemaAccent-400',
      gradient: 'bg-gradient-to-r from-cinemaAccent-400 to-cinemaAccent-600',
      cardHeader: 'border-cinemaAccent-500/20'
    };
  };

  const theme = userData ? getTheme(userData.role) : getTheme('musician'); // Default fallbacks

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <Navbar />
      <div className="container pt-24 pb-16">
        {/* Header Section */}
        {userData && (
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-white">
              Welcome back, <span className={`${theme.gradient} bg-clip-text text-transparent`}>{userData.name}</span>
            </h1>
            <p className={`${theme.text} max-w-2xl mx-auto text-lg capitalize`}>
              {userData.role} • {userData.specialization}
            </p>
          </div>
        )}

        {/* Cover Photo Section */}
        {userData && (
          <div className="relative bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden max-w-4xl mx-auto mb-20 shadow-medium border border-white/10">
            {userData.coverPhoto ? (
              <img
                src={userData.coverPhoto}
                alt="Cover Photo"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-cover').style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`fallback-cover w-full h-48 ${userData.role === 'musician' ? 'bg-wood-accent' : 'bg-cinematic-accent'} flex items-center justify-center ${userData.coverPhoto ? 'hidden' : 'flex'}`}
            >
              <h2 className="text-3xl font-semibold text-white">
                {userData.specialization || "Your Specialization"}
              </h2>
            </div>
            {userData.coverPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <h2 className="text-3xl font-semibold text-white">
                  {userData.specialization || "Your Specialization"}
                </h2>
              </div>
            )}

            {/* Profile Photo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 z-10">
              {userData.profilePhoto ? (
                <img
                  src={userData.profilePhoto}
                  alt="Profile Photo"
                  className="w-32 h-32 rounded-2xl border-4 border-white object-cover shadow-large"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-32 h-32 rounded-2xl border-4 border-black/50 ${userData.role === 'musician' ? 'bg-wood-accent' : 'bg-cinematic-accent'} flex items-center justify-center shadow-large ${userData.profilePhoto ? 'hidden' : 'flex'}`}
              >
                <span className="text-3xl font-bold text-white">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Profile Information Section */}
        {userData && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="card">
              <div className="card-header">
                <h2 className={`card-title ${theme.gradient} bg-clip-text text-transparent`}>Profile Information</h2>
              </div>
              <div className="card-content">
                <Profile />
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Portfolio</h2>
            <button
              onClick={() => navigate("/portfolio")}
              className="btn btn-primary"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolio.length > 0 ? (
              portfolio.map((item) => (
                <div key={item._id} className="card card-hover group border-white/10 bg-black/40">
                  <div className="aspect-video overflow-hidden rounded-t-2xl">
                    <img
                      src={item.image || "/default-work.png"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-neutral-400 text-sm line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-neutral-400">No portfolio items to display.</p>
                <button
                  onClick={() => navigate("/portfolio")}
                  className="btn btn-primary mt-4"
                >
                  Add Your First Work
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Widgets Section */}
        {userData && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <PortfolioStatsWidget userId={userData._id} />
              <ConnectionRequestsWidget userId={userData._id} />
              <RecentActivityWidget userId={userData._id} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActionsWidget navigate={navigate} />
              {/* Analytics Card */}
              <div className="card">
                <div className="card-header">
                  <h3 className={`card-title ${theme.gradient} bg-clip-text text-transparent`}>Analytics</h3>
                  <p className="card-description text-neutral-400">Track your portfolio performance and engagement</p>
                </div>
                <div className="card-content">
                  {analytics ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-neutral-300 font-medium">Profile Views:</span>
                        <span className="text-white font-semibold">{analytics.profileViews}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-neutral-300 font-medium">Connections:</span>
                        <span className="text-white font-semibold">{analytics.connectionsCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-neutral-300 font-medium">Followers:</span>
                        <span className="text-white font-semibold">{analytics.followersCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-neutral-300 font-medium">Following:</span>
                        <span className="text-white font-semibold">{analytics.followingCount}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_BASE}/api/auth/analytics`, {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                          });
                          if (response.ok) {
                            const data = await response.json();
                            setAnalytics(data);
                          }
                        } catch (error) {
                          console.error("Failed to fetch analytics", error);
                        }
                      }}
                      className="btn btn-secondary w-full"
                    >
                      Load Analytics
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
