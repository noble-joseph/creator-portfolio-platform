import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import User from '../models/User.js';
import Collaboration from '../models/Collaboration.js';

const router = express.Router();

// AI Collaboration Matchmaker
router.get('/collaboration-matches', protect, catchAsync(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Find potential matches based on role, skills, and interests
  const potentialMatches = await User.find({
    _id: { $ne: req.user._id },
    role: currentUser.role,
    'collaborationPreferences.interests': { $in: currentUser.collaborationPreferences?.interests || [] }
  }).limit(10);

  // Calculate match scores and generate suggestions
  const matches = potentialMatches.map(match => {
    const score = calculateMatchScore(currentUser, match);
    const reasons = generateMatchReasons(currentUser, match);
    const suggestions = generateCollaborationSuggestions(currentUser, match);

    return {
      user: match,
      score,
      compatibility: getCompatibilityLevel(score),
      reasons,
      suggestions
    };
  });

  // Sort by match score
  matches.sort((a, b) => b.score - a.score);

  // Generate collaboration ideas
  const ideas = generateCollaborationIdeas(currentUser);

  res.json({
    matches: matches.slice(0, 6), // Return top 6 matches
    ideas
  });
}));

// Naive Bayes-style specialization suggestions based on skills
// Trains a simple multinomial NB over existing users' (specialization <- skills)
router.get('/nb-specialization-suggestions', protect, catchAsync(async (req, res) => {
  const currentUser = await User.findById(req.user._id).lean();
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const corpus = await User.find({ _id: { $ne: req.user._id }, specialization: { $exists: true, $ne: null } })
    .select('specialization skills role')
    .limit(1000)
    .lean();

  if (corpus.length === 0) {
    return res.json({ suggestions: [] });
  }

  // Build counts
  const classCounts = new Map(); // specialization -> count
  const wordCounts = new Map();  // specialization -> Map(skill->count)
  const vocab = new Set();

  for (const u of corpus) {
    const cls = u.specialization;
    classCounts.set(cls, (classCounts.get(cls) || 0) + 1);
    if (!wordCounts.has(cls)) wordCounts.set(cls, new Map());
    for (const s of (u.skills || [])) {
      const w = String(s).toLowerCase().trim();
      if (!w) continue;
      vocab.add(w);
      const m = wordCounts.get(cls);
      m.set(w, (m.get(w) || 0) + 1);
    }
  }

  const classes = Array.from(classCounts.keys());
  const V = Math.max(vocab.size, 1);
  const N = Array.from(classCounts.values()).reduce((a,b)=>a+b, 0);
  const alpha = 1; // Laplace smoothing

  const userWords = (currentUser.skills || []).map(s => String(s).toLowerCase().trim()).filter(Boolean);

  // Precompute denominators per class
  const denomByClass = new Map();
  for (const c of classes) {
    const m = wordCounts.get(c) || new Map();
    const sumCounts = Array.from(m.values()).reduce((a,b)=>a+b, 0);
    denomByClass.set(c, sumCounts + alpha * V);
  }

  // Compute log-probabilities
  const scored = classes.map(c => {
    const prior = Math.log((classCounts.get(c) + alpha) / (N + alpha * classes.length));
    const m = wordCounts.get(c) || new Map();
    const denom = denomByClass.get(c);
    let loglike = 0;
    for (const w of userWords) {
      const count = m.get(w) || 0;
      const pwc = (count + alpha) / denom;
      loglike += Math.log(pwc);
    }
    return { specialization: c, score: prior + loglike };
  }).sort((a,b)=>b.score - a.score).slice(0, 5);

  // Attach example users for top classes
  const topSpecs = scored.map(s=>s.specialization);
  const examples = await User.find({ specialization: { $in: topSpecs } })
    .select('name username role specialization profilePhoto skills')
    .limit(10)
    .lean();

  const suggestions = scored.map(s => ({
    specialization: s.specialization,
    score: Number(s.score.toFixed(3)),
    examples: examples.filter(e => e.specialization === s.specialization).slice(0, 3)
  }));

  res.json({ suggestions });
}));

// Simple Decision Tree-style matcher
// Segments candidates into Top/Good/Explore using transparent rules over role/specialization/skills/experience
router.get('/decision-tree-matches', protect, catchAsync(async (req, res) => {
  const currentUser = await User.findById(req.user._id).lean();
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const candidates = await User.find({ _id: { $ne: req.user._id }, role: { $in: ['musician', 'photographer'] } })
    .select('role experienceLevel specialization skills name username profilePhoto')
    .limit(200)
    .lean();

  const expLevels = ['beginner', 'intermediate', 'professional'];
  const levelIdx = (lvl) => Math.max(0, expLevels.indexOf(lvl));

  const curSkills = new Set((currentUser.skills || []).map(s => String(s).toLowerCase()));

  const scored = candidates.map(u => {
    const shared = (u.skills || []).map(s => String(s).toLowerCase()).filter(s => curSkills.has(s));
    const sameRole = currentUser.role === u.role;
    const sameSpec = currentUser.specialization && u.specialization && (currentUser.specialization === u.specialization);
    const levelGap = Math.abs(levelIdx(currentUser.experienceLevel) - levelIdx(u.experienceLevel));

    // Decision rules
    let bucket = 'Explore';
    if (sameRole && sameSpec && shared.length >= 2 && levelGap <= 1) bucket = 'Top Match';
    else if (sameRole && shared.length >= 1) bucket = 'Good Match';

    // Priority for sorting
    const priority = bucket === 'Top Match' ? 2 : bucket === 'Good Match' ? 1 : 0;

    const reasons = [];
    if (sameRole) reasons.push(`Same role: ${u.role}`);
    if (sameSpec) reasons.push(`Same specialization: ${u.specialization}`);
    if (shared.length) reasons.push(`Shared skills: ${shared.slice(0,3).join(', ')}`);
    if (levelGap === 0) reasons.push(`Same experience level: ${u.experienceLevel}`);

    return { user: u, bucket, priority, reasons };
  });

  const matches = scored
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 12)
    .map(m => ({ ...m, user: { ...m.user } }));

  res.json({ matches });
}));

// AI-powered content recommendations
router.get('/content-recommendations', protect, catchAsync(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  
  // Find similar users based on role and specialization
  const similarUsers = await User.find({
    _id: { $ne: req.user._id },
    role: currentUser.role,
    specialization: currentUser.specialization
  }).limit(5);

  // Generate content recommendations
  const recommendations = similarUsers.map(user => ({
    user,
    reason: `Similar ${user.role} with ${user.specialization} specialization`,
    type: 'portfolio'
  }));

  res.json({ recommendations });
}));

// KNN-based user discovery recommendations
// Returns nearest creators to the current user based on role, experience, specialization and skills
router.get('/discover', protect, catchAsync(async (req, res) => {
  const currentUser = await User.findById(req.user._id).lean();
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Fetch candidate users (exclude self and admins)
  const candidates = await User.find({
    _id: { $ne: req.user._id },
    role: { $in: ['musician', 'photographer'] }
  })
    .select('role experienceLevel specialization skills name username profilePhoto genre style location')
    .limit(300)
    .lean();

  if (candidates.length === 0) {
    const recent = await User.find({ _id: { $ne: req.user._id }, role: { $in: ['musician', 'photographer'] } })
      .select('name username role specialization profilePhoto genre style location skills')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return res.json({
      recommendations: recent.map(u => ({
        user: u,
        reasons: ['Showing recent creators due to low dataset for KNN']
      }))
    });
  }

  // Build vocabularies for one-hot encoding
  const roles = ['musician', 'photographer'];
  const expLevels = ['beginner', 'intermediate', 'professional'];

  // Limit vocab sizes to keep vectors small and robust
  const specCounts = new Map();
  const skillCounts = new Map();
  for (const u of candidates) {
    if (u.specialization) specCounts.set(u.specialization, (specCounts.get(u.specialization) || 0) + 1);
    for (const s of (u.skills || [])) {
      const key = String(s).toLowerCase();
      skillCounts.set(key, (skillCounts.get(key) || 0) + 1);
    }
  }
  const topSpecs = Array.from(specCounts.entries()).sort((a,b)=>b[1]-a[1]).slice(0, 25).map(([k])=>k);
  const topSkills = Array.from(skillCounts.entries()).sort((a,b)=>b[1]-a[1]).slice(0, 60).map(([k])=>k);

  const roleIndex = new Map(roles.map((r,i)=>[r,i]));
  const expIndex = new Map(expLevels.map((e,i)=>[e,i]));
  const specIndex = new Map(topSpecs.map((s,i)=>[s,i]));
  const skillIndex = new Map(topSkills.map((s,i)=>[s,i]));

  const vectorSize = roles.length + expLevels.length + topSpecs.length + topSkills.length;

  const encode = (user) => {
    const vec = new Array(vectorSize).fill(0);
    let offset = 0;
    // role one-hot
    if (roleIndex.has(user.role)) vec[offset + roleIndex.get(user.role)] = 1; 
    offset += roles.length;
    // experience one-hot
    if (expIndex.has(user.experienceLevel)) vec[offset + expIndex.get(user.experienceLevel)] = 1; 
    offset += expLevels.length;
    // specialization one-hot (limited vocab)
    if (user.specialization && specIndex.has(user.specialization)) vec[offset + specIndex.get(user.specialization)] = 1;
    offset += topSpecs.length;
    // skills bag-of-words (binary presence for top skills)
    for (const s of (user.skills || [])) {
      const key = String(s).toLowerCase();
      if (skillIndex.has(key)) vec[offset + skillIndex.get(key)] = 1;
    }
    return vec;
  };

  const X = candidates.map(encode);
  const currentVec = encode(currentUser);

  // Rank candidates by cosine similarity (no external KNN dependency)
  const sims = X.map((vec, idx) => {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < vec.length; i++) {
      const ai = vec[i];
      const bi = currentVec[i];
      dot += ai * bi;
      na += ai * ai;
      nb += bi * bi;
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
    const sim = dot / denom; // [0,1]
    return { idx, sim };
  })
  .filter(x => x.sim > 0) // only show some relevance
  .sort((a, b) => b.sim - a.sim)
  .slice(0, 10);

  // Prepare response with reasons
  const recs = sims
    .map(({ idx }) => {
      const u = candidates[idx];
      const commonSkills = (currentUser.skills || []).map(s=>String(s).toLowerCase())
        .filter(s => (u.skills || []).map(x=>String(x).toLowerCase()).includes(s));
      const reasons = [];
      if (currentUser.role === u.role) reasons.push(`Both are ${u.role}s`);
      if (currentUser.specialization && u.specialization && currentUser.specialization === u.specialization) {
        reasons.push(`Same specialization: ${u.specialization}`);
      }
      if (commonSkills.length) reasons.push(`Shared skills: ${commonSkills.slice(0,5).join(', ')}`);
      return {
        user: {
          _id: u._id,
          name: u.name,
          username: u.username,
          role: u.role,
          specialization: u.specialization,
          profilePhoto: u.profilePhoto,
          genre: u.genre,
          style: u.style,
          location: u.location,
          skills: u.skills
        },
        reasons,
      };
    })
    .slice(0, 10);

  res.json({ recommendations: recs });
}));

// AI analytics for creators
router.get('/analytics/:userId', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if user is requesting their own analytics or is admin
  if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to view these analytics' });
  }

  // Generate AI insights
  const insights = {
    profilePerformance: {
      views: user.analytics?.profileViews || 0,
      growth: calculateGrowthRate(user),
      engagement: calculateEngagementRate(user)
    },
    collaborationPotential: {
      score: calculateCollaborationScore(user),
      suggestions: generateCollaborationInsights(user)
    },
    marketTrends: {
      roleDemand: getRoleDemand(user.role),
      skillTrends: getSkillTrends(user.skills || [])
    },
    recommendations: generatePersonalizedRecommendations(user)
  };

  res.json(insights);
}));

// Helper functions
function calculateMatchScore(user1, user2) {
  let score = 0;
  
  // Role compatibility (40 points)
  if (user1.role === user2.role) {
    score += 40;
  }
  
  // Skills overlap (30 points)
  const user1Skills = user1.skills || [];
  const user2Skills = user2.skills || [];
  const commonSkills = user1Skills.filter(skill => user2Skills.includes(skill));
  score += (commonSkills.length / Math.max(user1Skills.length, user2Skills.length, 1)) * 30;
  
  // Interests overlap (20 points)
  const user1Interests = user1.collaborationPreferences?.interests || [];
  const user2Interests = user2.collaborationPreferences?.interests || [];
  const commonInterests = user1Interests.filter(interest => user2Interests.includes(interest));
  score += (commonInterests.length / Math.max(user1Interests.length, user2Interests.length, 1)) * 20;
  
  // Experience level compatibility (10 points)
  const experienceLevels = ['beginner', 'intermediate', 'professional'];
  const user1Level = experienceLevels.indexOf(user1.experienceLevel);
  const user2Level = experienceLevels.indexOf(user2.experienceLevel);
  const levelDiff = Math.abs(user1Level - user2Level);
  score += (2 - levelDiff) * 5; // Closer levels get higher scores
  
  return Math.round(score);
}

function generateMatchReasons(user1, user2) {
  const reasons = [];
  
  if (user1.role === user2.role) {
    reasons.push(`Both are ${user1.role}s`);
  }
  
  const commonSkills = (user1.skills || []).filter(skill => (user2.skills || []).includes(skill));
  if (commonSkills.length > 0) {
    reasons.push(`Shared skills: ${commonSkills.join(', ')}`);
  }
  
  const commonInterests = (user1.collaborationPreferences?.interests || []).filter(
    interest => (user2.collaborationPreferences?.interests || []).includes(interest)
  );
  if (commonInterests.length > 0) {
    reasons.push(`Common interests: ${commonInterests.join(', ')}`);
  }
  
  if (user1.experienceLevel === user2.experienceLevel) {
    reasons.push(`Similar experience level (${user1.experienceLevel})`);
  }
  
  return reasons;
}

function generateCollaborationSuggestions(user1, user2) {
  const suggestions = [];
  
  if (user1.role === 'musician' && user2.role === 'musician') {
    suggestions.push('Create a collaborative music track');
    suggestions.push('Produce a joint EP or album');
    suggestions.push('Organize a virtual concert together');
  } else if (user1.role === 'photographer' && user2.role === 'photographer') {
    suggestions.push('Collaborate on a photo series');
    suggestions.push('Create a joint portfolio project');
    suggestions.push('Organize a photography workshop');
  }
  
  // Add generic suggestions
  suggestions.push('Share knowledge and techniques');
  suggestions.push('Cross-promote each other\'s work');
  suggestions.push('Create educational content together');
  
  return suggestions;
}

function generateCollaborationIdeas(user) {
  const ideas = [];
  
  if (user.role === 'musician') {
    ideas.push({
      title: 'Cross-Genre Collaboration',
      description: 'Partner with musicians from different genres to create unique fusion tracks',
      tags: ['music', 'collaboration', 'fusion', 'innovation']
    });
    ideas.push({
      title: 'Virtual Concert Series',
      description: 'Organize online concerts featuring multiple artists',
      tags: ['music', 'virtual', 'concert', 'community']
    });
  } else if (user.role === 'photographer') {
    ideas.push({
      title: 'Documentary Photography Project',
      description: 'Collaborate on a long-form documentary photography project',
      tags: ['photography', 'documentary', 'storytelling', 'social']
    });
    ideas.push({
      title: 'Photo Workshop Series',
      description: 'Create educational photography workshops for the community',
      tags: ['photography', 'education', 'workshop', 'teaching']
    });
  }
  
  return ideas;
}

function getCompatibilityLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
}

function calculateGrowthRate(user) {
  // This would typically use historical data
  // For now, return a mock calculation
  const baseViews = user.analytics?.profileViews || 0;
  return Math.min(baseViews * 0.1, 50); // Mock 10% growth, max 50
}

function calculateEngagementRate(user) {
  // Mock engagement calculation
  const views = user.analytics?.profileViews || 0;
  const connections = user.connections?.length || 0;
  return connections > 0 ? (views / connections).toFixed(2) : 0;
}

function calculateCollaborationScore(user) {
  // Mock collaboration score based on various factors
  let score = 0;
  score += (user.connections?.length || 0) * 2;
  score += (user.analytics?.profileViews || 0) * 0.1;
  score += (user.skills?.length || 0) * 5;
  return Math.min(score, 100);
}

function generateCollaborationInsights(user) {
  const insights = [];
  
  if (user.connections?.length < 5) {
    insights.push('Consider connecting with more creators to expand your network');
  }
  
  if (user.skills?.length < 3) {
    insights.push('Adding more skills to your profile can increase collaboration opportunities');
  }
  
  insights.push('Your profile is performing well in the community');
  
  return insights;
}

function getRoleDemand(role) {
  // Mock role demand data
  const demand = {
    musician: 'High',
    photographer: 'Medium',
    admin: 'Low'
  };
  return demand[role] || 'Medium';
}

function getSkillTrends(skills) {
  // Mock skill trends
  return skills.map(skill => ({
    skill,
    trend: 'Growing',
    demand: 'High'
  }));
}

function generatePersonalizedRecommendations(user) {
  const recommendations = [];
  
  recommendations.push('Update your portfolio with recent work');
  recommendations.push('Engage with other creators in your field');
  recommendations.push('Consider creating educational content');
  
  return recommendations;
}

export default router;
