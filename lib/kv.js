import Redis from 'ioredis';
import { createClient } from '@vercel/kv';

// Upstash Redis via Vercel marketplace uses UPSTASH_REDIS_REST_URL
// Old Vercel KV uses KV_REST_API_URL
// Otherwise fall back to local Redis via ioredis
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

let kv;

if (upstashUrl) {
  kv = createClient({
    url: upstashUrl,
    token: upstashToken,
  });
} else {
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
}

export { kv };
