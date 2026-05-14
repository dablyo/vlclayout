import { kv } from '../../lib/kv.js';
import { generateToken, comparePassword } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Prevent KV key injection via special characters
  if (typeof username !== 'string' || !/^[a-zA-Z0-9]{1,20}$/.test(username)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = await kv.get(`user:${username}`);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ username, isAdmin: user.isAdmin });
  return res.status(200).json({ token, isAdmin: user.isAdmin });
}
