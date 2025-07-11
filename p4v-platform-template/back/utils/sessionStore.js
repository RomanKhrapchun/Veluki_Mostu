const client = require("../helpers/redis");
const { redisClientConfig } = require("./constants");
const REDIS_SESSION_PREFIX = "session"
class SessionStore {
    async getSession(id) {
        return await client.get(`${REDIS_SESSION_PREFIX}:${id}`);
    }
    async setSession(id, value, ttl) {
        return await client.set(`${REDIS_SESSION_PREFIX}:${id}`, value, "EX", ttl);
    }
    async deleteSession(id) {
        await client.del(`${REDIS_SESSION_PREFIX}:${id}`)
    }
    async touch(id) {
        await client.expire(`${REDIS_SESSION_PREFIX}:${id}`, redisClientConfig.ttl)
    }
}

module.exports = new SessionStore();