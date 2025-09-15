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

  const currentSpecializations = userRole === "photographer"
    ? photographerSpecializations
    : musicianSpecializations;

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-8 text-purple-400 text-center">Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-purple-300">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Role</label>
              <div className="p-3 bg-gray-600 text-white rounded-lg capitalize font-semibold">
                {userRole}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
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
            <label className="block text-gray-300 mb-2 font-medium">Specialization Details</label>
            <input
              type="text"
              value={specializationDetails}
              onChange={(e) => setSpecializationDetails(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Additional details about your specialization"
            />
          </div>
        </div>

        {/* Experiences Section */}
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-purple-300">Experiences</h3>
          {experiences.map((experience, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-600 rounded-lg border border-gray-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="title"
                  value={experience.title}
                  onChange={(e) => handleExperienceChange(index, e)}
                  placeholder="Experience Title"
                  className="p-3 bg-gray-500 text-white rounded-lg border border-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                  required
                />
                <input
                  type="text"
                  name="company"
                  value={experience.company}
                  onChange={(e) => handleExperienceChange(index, e)}
                  placeholder="Company"
                  className="p-3 bg-gray-500 text-white rounded-lg border border-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              <input
                type="text"
                name="duration"
                value={experience.duration}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Duration (e.g., 2020-2022)"
                className="w-full p-3 bg-gray-500 text-white rounded-lg border border-gray-400 focus:border-purple-400 focus:outline-none transition-colors mb-4"
                required
              />
              <textarea
                name="description"
                value={experience.description}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Description of your role and achievements"
                className="w-full p-3 bg-gray-500 text-white rounded-lg border border-gray-400 focus:border-purple-400 focus:outline-none transition-colors resize-none"
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
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-purple-300">Skills & Bio</h3>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Skills</label>
            <input
              type="text"
              value={skills.join(", ")}
              onChange={(e) => setSkills(e.target.value.split(",").map(skill => skill.trim()))}
              className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Comma-separated skills (e.g., Photography, Photoshop, Lighting)"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors resize-none"
              placeholder="Tell us about yourself, your background, and what makes you unique"
              rows="4"
            />
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-purple-300">Photos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Profile Photo</label>
              {profilePhoto && (
                <div className="mb-3">
                  <img src={`${API_BASE}/uploads/${profilePhoto}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-purple-400" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors mb-3"
              />
              <button
                type="button"
                onClick={handleProfilePhotoUpload}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Upload Profile Picture
              </button>
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Cover Photo URL</label>
              {coverPhoto && (
                <div className="mb-3">
                  <img src={coverPhoto} alt="Cover" className="w-full h-20 object-cover rounded-lg border border-gray-500" />
                </div>
              )}
              <input
                type="text"
                value={coverPhoto}
                onChange={(e) => setCoverPhoto(e.target.value)}
                className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
                placeholder="URL to your cover photo"
              />
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-purple-300">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={socialMedia.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              className="p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Facebook profile URL"
            />
            <input
              type="text"
              value={socialMedia.twitter}
              onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              className="p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Twitter profile URL"
            />
            <input
              type="text"
              value={socialMedia.instagram}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              className="p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Instagram profile URL"
            />
            <input
              type="text"
              value={socialMedia.linkedin}
              onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
              className="p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="LinkedIn profile URL"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold text-lg shadow-lg"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
