import { kv } from '../../lib/kv.js';
import { withAuth } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const allKeys = await kv.keys('user:*');
    // Filter to single-colon format: "user:username" (not "user:xxx:layouts")
    const userKeys = allKeys.filter((k) => {
      const parts = k.split(':');
      return parts.length === 2;
    });

    const users = [];
    for (const key of userKeys) {
      const username = key.split(':')[1];
      const data = await kv.get(key);
      if (data) {
        users.push({
          username,
          createdAt: data.createdAt,
        });
      }
    }

    return res.status(200).json(users);
  }

  if (req.method === 'DELETE') {
    const { username } = req.query || {};
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (username === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin user' });
    }

    const user = await kv.get(`user:${username}`);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all user layouts
    const layoutIds = (await kv.get(`user:${username}:layouts`)) || [];
    for (const id of layoutIds) {
      await kv.del(`layout:${username}:${id}`);
    }
    await kv.del(`user:${username}:layouts`);
    await kv.del(`user:${username}`);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler, { requireAdmin: true });
