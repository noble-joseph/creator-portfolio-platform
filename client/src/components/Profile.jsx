import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";

const Profile = () => {
  const [specialization, setSpecialization] = useState("");
  const [specializationDetails, setSpecializationDetails] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([{ title: "", company: "", duration: "", description: "" }]);
  const [skills, setSkills] = useState([]);
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioFiles, setPortfolioFiles] = useState([]);

  // Role-specific specializations
  const photographerSpecializations = [
    "Portrait Photography",
    "Landscape Photography",
    "Wedding Photography",
    "Fashion Photography",
    "Product Photography",
    "Street Photography",
    "Wildlife Photography",
    "Sports Photography",
    "Architectural Photography",
    "Food Photography"
  ];

  const musicianSpecializations = [
    "Vocalist",
    "Guitarist",
    "Pianist",
    "Drummer",
    "Bassist",
    "Violinist",
    "Music Producer",
    "Composer",
    "Sound Engineer",
    "DJ",
    "Music Teacher",
    "Session Musician"
  ];

  useEffect(() => {
    // Fetch user data to get the role
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
          setSpecialization(userData.specialization || "");
          setSpecializationDetails(userData.specializationDetails || "");
          setExperiences(userData.experiences || []);
          setSkills(userData.skills || []);
          setBio(userData.bio || "");
          setProfilePhoto(userData.profilePhoto || "");
          setCoverPhoto(userData.coverPhoto || "");
          setSocialMedia(userData.socialMedia || {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
          });
          setPortfolio(userData.portfolio || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleExperienceChange = (index, event) => {
    const newExperiences = [...experiences];
    newExperiences[index][event.target.name] = event.target.value;
    setExperiences(newExperiences);
  };

  const addExperience = () => {
    setExperiences([...experiences, { title: "", company: "", duration: "", description: "" }]);
  };

  const removeExperience = (index) => {
    const newExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(newExperiences);
  };

  const handleSocialMediaChange = (platform, value) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleProfilePhotoChange = (e) => {
    setProfilePhotoFile(e.target.files[0]);
  };

  const handleProfilePhotoUpload = async () => {
    if (!profilePhotoFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', profilePhotoFile);

    try {
      const response = await fetch(`${API_BASE}/api/auth/updateProfilePicture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePhoto(data.user.profilePhoto);
        setProfilePhotoFile(null);
        alert("Profile picture updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to upload profile picture: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture.");
    }
  };

  const handlePortfolioFileChange = (e) => {
    setPortfolioFiles(Array.from(e.target.files));
  };

  const handlePortfolioUpload = async () => {
    if (portfolioFiles.length === 0) {
      alert("Please select files first.");
      return;
    }

    const formData = new FormData();
    portfolioFiles.forEach(file => {
      formData.append('portfolio', file);
    });

    try {
      const response = await fetch(`${API_BASE}/api/auth/uploadPortfolio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolio(data.user.portfolio);
        setPortfolioFiles([]);
        alert("Portfolio updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to upload portfolio: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error uploading portfolio:", error);
      alert("Error uploading portfolio.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE}/api/auth/updateProfile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ specialization, specializationDetails, experiences, skills, bio, profilePhoto, coverPhoto, socialMedia }),
    });

    if (response.ok) {
      alert("Profile updated successfully!");
    } else {
      const errorData = await response.json();
      alert(`Failed to update profile: ${errorData.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="text-gray-300">Loading...</div>;
  }

  const getTheme = (role) => {
    if (role === 'musician') {
      return {
        text: 'text-wood-50',
        accent: 'text-gold-500',
        gradient: 'bg-gradient-to-r from-gold-500 to-gold-700',
        border: 'focus:border-gold-500 focus:ring-gold-500/20',
        title: 'text-gold-500'
      };
    }
    return {
      text: 'text-cinematic-50',
      accent: 'text-cinemaAccent-500',
      gradient: 'bg-gradient-to-r from-cinemaAccent-400 to-cinemaAccent-600',
      border: 'focus:border-cinemaAccent-500 focus:ring-cinemaAccent-500/20',
      title: 'text-cinemaAccent-400'
    };
  };

  const theme = getTheme(userRole || 'musician');
  const currentSpecializations = userRole === 'musician' ? musicianSpecializations : photographerSpecializations;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className={`text-3xl font-bold mb-8 ${theme.gradient} bg-clip-text text-transparent text-center`}>Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="card p-6 border-white/10 bg-black/40">
          <h3 className={`text-xl font-semibold mb-4 ${theme.title}`}>Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-neutral-300 mb-2 font-medium">Role</label>
              <div className="p-3 bg-white/5 text-white rounded-lg capitalize font-semibold border border-white/10">
                {userRole}
              </div>
            </div>
            <div>
              <label className="block text-neutral-300 mb-2 font-medium">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className={`w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
                required
              >
                <option value="">Select your specialization</option>
                {currentSpecializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-neutral-300 mb-2 font-medium">Specialization Details</label>
            <input
              type="text"
              value={specializationDetails}
              onChange={(e) => setSpecializationDetails(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
              placeholder="Additional details about your specialization"
            />
          </div>
        </div>

        {/* Experiences Section */}
        <div className="card p-6 border-white/10 bg-black/40">
          <h3 className={`text-xl font-semibold mb-4 ${theme.title}`}>Experiences</h3>
          {experiences.map((experience, index) => (
            <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="title"
                  value={experience.title}
                  onChange={(e) => handleExperienceChange(index, e)}
                  placeholder="Experience Title"
                  className={`p-3 bg-black/20 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
                  required
                />
                <input
                  type="text"
                  name="company"
                  value={experience.company}
                  onChange={(e) => handleExperienceChange(index, e)}
                  placeholder="Company"
                  className={`p-3 bg-black/20 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
                  required
                />
              </div>
              <input
                type="text"
                name="duration"
                value={experience.duration}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Duration (e.g., 2020-2022)"
                className={`w-full p-3 bg-black/20 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all mb-4 ${theme.border}`}
                required
              />
              <textarea
                name="description"
                value={experience.description}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Description of your role and achievements"
                className={`w-full p-3 bg-black/20 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all resize-none ${theme.border}`}
                rows="3"
              />
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Remove Experience
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperience}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            + Add Experience
          </button>
        </div>

        {/* Skills and Bio Section */}
        <div className="card p-6 border-white/10 bg-black/40">
          <h3 className={`text-xl font-semibold mb-4 ${theme.title}`}>Skills & Bio</h3>
          <div className="mb-6">
            <label className="block text-neutral-300 mb-2 font-medium">Skills</label>
            <input
              type="text"
              value={skills.join(", ")}
              onChange={(e) => setSkills(e.target.value.split(",").map(skill => skill.trim()))}
              className={`w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
              placeholder="Comma-separated skills (e.g., Photography, Photoshop, Lighting)"
            />
          </div>
          <div>
            <label className="block text-neutral-300 mb-2 font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all resize-none ${theme.border}`}
              placeholder="Tell us about yourself, your background, and what makes you unique"
              rows="4"
            />
          </div>
        </div>

        {/* Photos Section */}
        <div className="card p-6 border-white/10 bg-black/40">
          <h3 className={`text-xl font-semibold mb-4 ${theme.title}`}>Photos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-neutral-300 mb-2 font-medium">Profile Photo</label>
              {profilePhoto && (
                <div className="mb-3">
                  <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-purple-400" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className={`w-full p-3 bg-white/5 text-neutral-300 rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all mb-3 ${theme.border}`}
              />
              <button
                type="button"
                onClick={handleProfilePhotoUpload}
                className="px-6 py-2 btn btn-primary"
              >
                Upload Profile Picture
              </button>
            </div>
            <div>
              <label className="block text-neutral-300 mb-2 font-medium">Cover Photo URL</label>
              {coverPhoto && (
                <div className="mb-3">
                  <img src={coverPhoto} alt="Cover" className="w-full h-20 object-cover rounded-lg border border-white/20" />
                </div>
              )}
              <input
                type="text"
                value={coverPhoto}
                onChange={(e) => setCoverPhoto(e.target.value)}
                className={`w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
                placeholder="URL to your cover photo"
              />
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="card p-6 border-white/10 bg-black/40">
          <h3 className={`text-xl font-semibold mb-4 ${theme.title}`}>Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={socialMedia.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              className={`p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
              placeholder="Facebook profile URL"
            />
            <input
              type="text"
              value={socialMedia.twitter}
              onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              className={`p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
              placeholder="Twitter profile URL"
            />
            <input
              type="text"
              value={socialMedia.instagram}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              className={`p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
              placeholder="Instagram profile URL"
            />
            <input
              type="text"
              value={socialMedia.linkedin}
              onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
              className={`p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 transition-all ${theme.border}`}
              placeholder="LinkedIn profile URL"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 btn btn-primary btn-lg"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
