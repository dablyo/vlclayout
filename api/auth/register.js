import { kv } from '../../lib/kv.js';
import { generateToken, hashPassword } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters' });
  }

  if (username === 'admin') {
    return res.status(400).json({ error: 'Username "admin" is reserved' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = await kv.get(`user:${username}`);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const passwordHash = await hashPassword(password);
  await kv.set(`user:${username}`, {
    passwordHash,
    isAdmin: false,
    createdAt: Date.now(),
  });
  await kv.set(`user:${username}:layouts`, []);

  const token = generateToken({ username, isAdmin: false });
  return res.status(201).json({ token });
}
