import { kv } from '../../lib/kv.js';
import { withAuth } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query || {};
  if (!id) {
    return res.status(400).json({ error: 'Layout ID is required' });
  }

  const { username } = req.user;
  const layout = await kv.get(`layout:${username}:${id}`);
  if (!layout) {
    return res.status(404).json({ error: 'Layout not found' });
  }

  // Remove from public list if it was public
  if (layout.public) {
    const publicList = (await kv.get('public-layouts')) || [];
    const filtered = publicList.filter((item) => item.id !== id);
    await kv.set('public-layouts', filtered);
  }

  await kv.del(`layout:${username}:${id}`);

  const layoutIds = (await kv.get(`user:${username}:layouts`)) || [];
  const updated = layoutIds.filter((lid) => lid !== id);
  await kv.set(`user:${username}:layouts`, updated);

  return res.status(200).json({ success: true });
}

export default withAuth(handler, { rejectAdmin: true });
