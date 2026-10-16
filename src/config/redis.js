const { createClient } = require('redis');
const { redisUrl } = require('./env');

const redis = createClient({ url: redisUrl });

redis.on('error', (error) => {
  console.error('Erro Redis:', error.message);
});

module.exports = redis;