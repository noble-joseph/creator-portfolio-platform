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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE}/api/auth/updateProfile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ specialization, specializationDetails, experiences, skills, bio }),
    });

    if (response.ok) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile.");
    }
  };

  if (loading) {
    return <div className="text-gray-300">Loading...</div>;
  }

  const currentSpecializations = userRole === "photographer" 
    ? photographerSpecializations 
    : musicianSpecializations;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-purple-400">Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Role</label>
          <div className="p-2 bg-gray-700 text-white rounded capitalize">
            {userRole}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Specialization</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
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
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Specialization Details</label>
          <input
            type="text"
            value={specializationDetails}
            onChange={(e) => setSpecializationDetails(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder="Additional details about your specialization"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Experiences</label>
          {experiences.map((experience, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
              <input
                type="text"
                name="title"
                value={experience.title}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Experience Title"
                className="w-full p-2 bg-gray-600 text-white rounded mb-2"
                required
              />
              <input
                type="text"
                name="company"
                value={experience.company}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Company"
                className="w-full p-2 bg-gray-600 text-white rounded mb-2"
                required
              />
              <input
                type="text"
                name="duration"
                value={experience.duration}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Duration (e.g., 2020-2022)"
                className="w-full p-2 bg-gray-600 text-white rounded mb-2"
                required
              />
              <textarea
                name="description"
                value={experience.description}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Description of your role and achievements"
                className="w-full p-2 bg-gray-600 text-white rounded mb-2"
                rows="3"
              />
              <button 
                type="button" 
                onClick={() => removeExperience(index)} 
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Remove Experience
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={addExperience} 
            className="text-blue-500 hover:text-blue-400 text-sm"
          >
            + Add Experience
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Skills</label>
          <input
            type="text"
            value={skills.join(", ")}
            onChange={(e) => setSkills(e.target.value.split(",").map(skill => skill.trim()))}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder="Comma-separated skills (e.g., Photography, Photoshop, Lighting)"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder="Tell us about yourself, your background, and what makes you unique"
            rows="4"
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
