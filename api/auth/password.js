import { kv } from '../../lib/kv.js';
import { hashPassword } from '../../lib/auth.js';
import { withAuth } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { newPassword } = req.body || {};

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const { username } = req.user;
  const user = await kv.get(`user:${username}`);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.passwordHash = await hashPassword(newPassword);
  await kv.set(`user:${username}`, user);

  return res.status(200).json({ success: true });
}

export default withAuth(handler);
