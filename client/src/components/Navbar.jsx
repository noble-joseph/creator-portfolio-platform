import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../config";

export default function Navbar() {
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (response.ok) {
          const userData = await response.json();
          setSocialMedia(userData.socialMedia || {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/70 backdrop-blur-xl border-b border-purple-100/50 shadow-xl'
        : 'bg-transparent'
      }`}>
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-2xl font-bold font-display bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            whiz
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-neutral-600 hover:text-purple-600 hover:bg-purple-50/50 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/connections"
              className="text-neutral-600 hover:text-purple-600 hover:bg-purple-50/50 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              Connections
            </Link>
            <Link
              to="/discover"
              className="text-neutral-600 hover:text-purple-600 hover:bg-purple-50/50 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              Discover
            </Link>
            <Link
              to="/ai"
              className="text-neutral-600 hover:text-purple-600 hover:bg-purple-50/50 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              AI Features
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Social Media Icons */}
            <div className="hidden lg:flex items-center space-x-3">
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-accent-600 transition-colors duration-200 p-2 hover:bg-accent-50 rounded-lg"
                >
                  <FaFacebookF size={16} />
                </a>
              )}
              {socialMedia.twitter && (
                <a
                  href={socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-accent-600 transition-colors duration-200 p-2 hover:bg-accent-50 rounded-lg"
                >
                  <FaTwitter size={16} />
                </a>
              )}
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-accent-600 transition-colors duration-200 p-2 hover:bg-accent-50 rounded-lg"
                >
                  <FaInstagram size={16} />
                </a>
              )}
              {socialMedia.linkedin && (
                <a
                  href={socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-accent-600 transition-colors duration-200 p-2 hover:bg-accent-50 rounded-lg"
                >
                  <FaLinkedinIn size={16} />
                </a>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-neutral-600 hover:text-accent-600 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/dashboard"
              className="block py-2 text-neutral-600 hover:text-accent-600 transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/connections"
              className="block py-2 text-neutral-600 hover:text-accent-600 transition-colors duration-200 font-medium"
            >
              Connections
            </Link>
            <Link
              to="/discover"
              className="block py-2 text-neutral-600 hover:text-accent-600 transition-colors duration-200 font-medium"
            >
              Discover
            </Link>
            <Link
              to="/ai"
              className="block py-2 text-neutral-600 hover:text-accent-600 transition-colors duration-200 font-medium"
            >
              AI Features
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
