import { kv } from '../../lib/kv.js';
import { withAuth } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.user;
  const layoutIds = (await kv.get(`user:${username}:layouts`)) || [];

  const layouts = [];

  // Own layouts
  for (const id of layoutIds) {
    const layout = await kv.get(`layout:${username}:${id}`);
    if (layout) {
      layouts.push({
        id: layout.id,
        name: layout.name,
        modules: layout.modules,
        public: !!layout.public,
        author: username,
        isOwner: true,
        createdAt: layout.createdAt,
        updatedAt: layout.updatedAt,
      });
    }
  }

  // Public layouts from other users
  const publicList = (await kv.get('public-layouts')) || [];
  for (const item of publicList) {
    // Skip own layouts (already included above)
    if (item.author === username) continue;
    // Skip if already in the list
    if (layouts.find((l) => l.id === item.id)) continue;

    const layout = await kv.get(`layout:${item.author}:${item.id}`);
    if (layout) {
      layouts.push({
        id: layout.id,
        name: layout.name,
        modules: layout.modules,
        public: true,
        author: item.author,
        isOwner: false,
        createdAt: layout.createdAt,
        updatedAt: layout.updatedAt,
      });
    }
  }

  return res.status(200).json(layouts);
}

export default withAuth(handler, { rejectAdmin: true });
