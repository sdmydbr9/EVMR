const redis = require('redis');

/**
 * Connects to Redis server
 * @returns {Promise} Redis client promise
 */
const connectToRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = redis.createClient({ url: redisUrl });
    
    client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    await client.connect();
    console.log('Connected to Redis');
    
    return client;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Don't throw error to allow app to start without Redis
    return null;
  }
};

module.exports = { connectToRedis }; 