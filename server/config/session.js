import session from 'express-session';
import { RedisStore } from 'connect-redis';

const createSessionConfig = (redisClient) => {
  const config = {
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' // CSRF protection
    }
  };

  if (redisClient && redisClient.isOpen) {
    config.store = new RedisStore({ client: redisClient });
  }

  return config;
};

export default createSessionConfig;
