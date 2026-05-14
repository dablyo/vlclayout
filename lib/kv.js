import Redis from 'ioredis';
import { createClient } from '@vercel/kv';

// If KV_REST_API_URL is set, use Vercel KV (production)
// Otherwise use local Redis via ioredis with compatible interface
const useLocalRedis = !process.env.KV_REST_API_URL;

let kv;

if (useLocalRedis) {
  const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

  // Wrap ioredis to match @vercel/kv interface (get/set/del/keys)
  kv = {
    async get(key) {
      const val = await redis.get(key);
      if (val === null) return null;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    },
    async set(key, value) {
      await redis.set(key, JSON.stringify(value));
      return 'OK';
    },
    async del(key) {
      const result = await redis.del(key);
      return result;
    },
    async keys(pattern) {
      return await redis.keys(pattern);
    },
  };
} else {
  kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export { kv };
