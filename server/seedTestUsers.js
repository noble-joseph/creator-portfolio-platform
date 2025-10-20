import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();
connectDB();

const seedTestUsers = async () => {
  try {
    // Clear existing test users (optional, comment out if you want to keep existing)
    await User.deleteMany({ email: { $regex: /test[0-9]+@example\.com/ } });

    const testUsers = [
      // Musicians
      {
        name: "Rock Guitarist",
        username: "rockguitarist",
        email: "test1@example.com",
        password: "Test123!",
        role: "musician",
        specialization: "Rock Guitar",
        specializationDetails: "Specializing in electric guitar, blues, rock, and metal genres",
        experiences: [
          { title: "Lead Guitarist", company: "The Thunderbolts", duration: "2018-Present", description: "Touring rock band" }
        ],
        skills: ["Electric Guitar", "Blues", "Rock", "Metal", "Songwriting"],
        bio: "Passionate rock guitarist with 10+ years experience in live performances and studio recordings."
      },
      {
        name: "Classical Pianist",
        username: "classicalpianist",
        email: "test2@example.com",
        password: "Test123!",
        role: "musician",
        specialization: "Classical Piano",
        specializationDetails: "Classical music performance and teaching",
        experiences: [
          { title: "Concert Pianist", company: "City Symphony Orchestra", duration: "2015-Present", description: "Performing classical repertoire" }
        ],
        skills: ["Piano", "Classical Music", "Music Theory", "Teaching"],
        bio: "Dedicated classical pianist with degrees from Juilliard, specializing in Beethoven and Chopin."
      },
      {
        name: "EDM Producer",
        username: "edmproducer",
        email: "test3@example.com",
        password: "Test123!",
        role: "musician",
        specialization: "EDM Production",
        specializationDetails: "Electronic music production and DJing",
        experiences: [
          { title: "Music Producer", company: "Digital Beats Studio", duration: "2019-Present", description: "Creating electronic music tracks" }
        ],
        skills: ["Ableton Live", "FL Studio", "DJing", "Music Production", "Sound Design"],
        bio: "Innovative EDM producer creating futuristic sounds for the digital age."
      },
      // Photographers
      {
        name: "Moody Cinematographer",
        username: "moodycinema",
        email: "test4@example.com",
        password: "Test123!",
        role: "photographer",
        specialization: "Cinematography",
        specializationDetails: "Dark, moody short films and documentaries",
        experiences: [
          { title: "Cinematographer", company: "Shadow Films", duration: "2017-Present", description: "Directing moody short films" }
        ],
        skills: ["Cinematography", "Film Direction", "Lighting", "Post-Production"],
        bio: "Cinematographer specializing in atmospheric storytelling through dark, moody visuals."
      },
      {
        name: "Corporate Commercial Photographer",
        username: "corpphoto",
        email: "test5@example.com",
        password: "Test123!",
        role: "photographer",
        specialization: "Commercial Photography",
        specializationDetails: "Bright, corporate commercials and brand photography",
        experiences: [
          { title: "Commercial Photographer", company: "Bright Light Studios", duration: "2016-Present", description: "Corporate and brand photography" }
        ],
        skills: ["Commercial Photography", "Brand Photography", "Studio Lighting", "Adobe Creative Suite"],
        bio: "Professional commercial photographer creating bright, engaging visuals for corporate clients."
      },
      // Models
      {
        name: "High Fashion Model",
        username: "fashionmodel",
        email: "test6@example.com",
        password: "Test123!",
        role: "photographer", // Note: models might be under photographer role or we need to add model role
        specialization: "Fashion Modeling",
        specializationDetails: "High fashion runway and editorial work",
        experiences: [
          { title: "Fashion Model", company: "Elite Model Management", duration: "2018-Present", description: "High fashion modeling" }
        ],
        skills: ["Runway", "Editorial", "Posing", "Fashion"],
        bio: "Versatile high fashion model with experience in runway shows and editorial photography."
      },
      {
        name: "Fitness Model",
        username: "fitnessmodel",
        email: "test7@example.com",
        password: "Test123!",
        role: "photographer",
        specialization: "Fitness Modeling",
        specializationDetails: "Fitness and wellness photography",
        experiences: [
          { title: "Fitness Model", company: "FitLife Magazine", duration: "2019-Present", description: "Fitness modeling and content creation" }
        ],
        skills: ["Fitness", "Wellness", "Nutrition", "Content Creation"],
        bio: "Fitness enthusiast and model promoting healthy lifestyle through photography."
      },
      // Additional musicians for better testing
      {
        name: "Jazz Saxophonist",
        username: "jazzsax",
        email: "test8@example.com",
        password: "Test123!",
        role: "musician",
        specialization: "Jazz Saxophone",
        specializationDetails: "Jazz and improvisational music",
        experiences: [
          { title: "Jazz Musician", company: "Blue Note Ensemble", duration: "2014-Present", description: "Jazz performances" }
        ],
        skills: ["Saxophone", "Jazz", "Improvisation", "Music Theory"],
        bio: "Passionate jazz saxophonist with a love for improvisation and live performances."
      },
      {
        name: "Pop Singer",
        username: "popsinger",
        email: "test9@example.com",
        password: "Test123!",
        role: "musician",
        specialization: "Pop Music",
        specializationDetails: "Contemporary pop music and vocals",
        experiences: [
          { title: "Vocalist", company: "Pop Star Records", duration: "2020-Present", description: "Recording pop songs" }
        ],
        skills: ["Vocals", "Pop Music", "Songwriting", "Performance"],
        bio: "Energetic pop singer bringing joy through music and performance."
      },
      // New user with empty portfolio
      {
        name: "New Creator",
        username: "newcreator",
        email: "test10@example.com",
        password: "Test123!",
        role: "musician",
        specialization: "General",
        specializationDetails: "",
        experiences: [],
        skills: [],
        bio: ""
      }
    ];

    for (const userData of testUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        await User.create(userData);
        console.log(`Created user: ${userData.name} (${userData.email})`);
      } else {
        console.log(`User already exists: ${userData.name} (${userData.email})`);
      }
    }

    console.log("Test users seeding completed!");
    process.exit();
  } catch (error) {
    console.error("Error seeding test users:", error);
    process.exit(1);
  }
};

seedTestUsers();
