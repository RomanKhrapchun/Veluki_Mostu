const Redis = require('ioredis');
const redisClient = new Redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });
const Logger = require('../utils/logger');

redisClient.on('connect', () => {
    Logger.info('Redis connected', {})
})

redisClient.on("error", (err) => {
    Logger.error(err)
    process.exit(1)
})

module.exports = redisClient;