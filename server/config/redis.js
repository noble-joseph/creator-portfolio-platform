import { createClient } from 'redis';

const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: false,
  lazyConnect: false,
  disableOfflineQueue: true,
  logger: false,
});



redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', () => {
  // Ignore Redis connection errors to prevent spam
});

export default redisClient;
