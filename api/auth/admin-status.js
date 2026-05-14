import { kv } from '../../lib/kv.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const initialized = await kv.get('admin:initialized');
  return res.status(200).json({ initialized: !!initialized });
}
