import { kv } from '../../lib/kv.js';
import { generateToken, hashPassword } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const initialized = await kv.get('admin:initialized');
  if (initialized) {
    return res.status(409).json({ error: 'Admin already initialized' });
  }

  const { password } = req.body || {};
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const passwordHash = await hashPassword(password);
  await kv.set('user:admin', {
    passwordHash,
    isAdmin: true,
    createdAt: Date.now(),
  });
  await kv.set('admin:initialized', true);
  await kv.set('user:admin:layouts', []);

  const token = generateToken({ username: 'admin', isAdmin: true });
  return res.status(201).json({ token });
}
