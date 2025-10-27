import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Portfolio from './models/Portfolio.js';

dotenv.config();
await connectDB();

const findByEmail = async (email) => User.findOne({ email });

const itemsFor = (userId, role) => {
  if (role === 'musician') {
    return [
      {
        user: userId,
        title: 'Midnight Drive',
        description: 'An energetic rock instrumental with soaring guitar leads.',
        category: 'music',
        mediaFiles: [{ type: 'audio', url: 'https://example.com/audio/midnight-drive.mp3', duration: 214 }],
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800',
        tags: ['rock', 'guitar'],
        isPublic: true,
      },
      {
        user: userId,
        title: 'Rainy City Blues',
        description: 'Bluesy guitar jam recorded live.',
        category: 'music',
        mediaFiles: [{ type: 'audio', url: 'https://example.com/audio/rainy-city-blues.mp3', duration: 198 }],
        thumbnail: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=800',
        tags: ['blues', 'live'],
        isPublic: false,
      }
    ];
  }
  if (role === 'photographer') {
    return [
      {
        user: userId,
        title: 'Moody Alley',
        description: 'Cinematic frame from a short film sequence.',
        category: 'photography',
        mediaFiles: [{ type: 'image', url: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1400' }],
        thumbnail: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=800',
        tags: ['cinematic', 'street'],
        isPublic: true,
      },
      {
        user: userId,
        title: 'Boardroom Lighting Setup',
        description: 'Behind-the-scenes from a corporate shoot.',
        category: 'photography',
        mediaFiles: [{ type: 'image', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1400' }],
        thumbnail: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800',
        tags: ['commercial', 'bts'],
        isPublic: false,
      }
    ];
  }
  return [];
};

try {
  const users = await User.find({ email: { $in: [
    'test1@example.com', // Rock Guitarist
    'test2@example.com', // Classical Pianist
    'test3@example.com', // EDM Producer
    'test4@example.com', // Moody Cinematographer
    'test5@example.com', // Corporate Commercial Photographer
  ] } });

  let created = 0;
  for (const u of users) {
    const existing = await Portfolio.find({ user: u._id });
    if (existing.length >= 2) {
      // Skip if already seeded
      continue;
    }
    const docs = itemsFor(u._id, u.role);
    if (docs.length) {
      await Portfolio.insertMany(docs);
      created += docs.length;
      console.log(`Seeded ${docs.length} portfolio items for ${u.name} (${u.email})`);
    }
  }

  console.log(`Portfolio seeding complete. Created ${created} items.`);
  process.exit(0);
} catch (err) {
  console.error('Error seeding portfolios:', err);
  process.exit(1);
}
