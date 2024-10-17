const redis = require('redis');

// Redis client
const redisClient = redis.createClient();


redisClient.connect()
    .then(() => console.log('Redis connected.'))
    .catch(err => console.error('Redis connection error:', err));

module.exports = redisClient;
