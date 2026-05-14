import { kv } from '../../lib/kv.js';
import { withAuth } from '../../lib/middleware.js';

function validateModules(modules) {
  if (!Array.isArray(modules)) return false;
  for (const m of modules) {
    if (typeof m.id !== 'number' || m.id < 1) return false;
    if (typeof m.x !== 'number' || m.x < 0 || m.x > 1000) return false;
    if (typeof m.z !== 'number' || m.z < 0 || m.z > 1000) return false;
    if (typeof m.height !== 'number' || m.height < 200 || m.height > 250) return false;
    if (typeof m.angle !== 'number' || m.angle < 78 || m.angle > 110) return false;
    if (typeof m.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(m.color)) return false;
  }
  return true;
}

async function updatePublicList(layoutId, username, name, isPublic) {
  const list = (await kv.get('public-layouts')) || [];
  if (isPublic) {
    // Add if not already present
    if (!list.find((item) => item.id === layoutId)) {
      list.push({ id: layoutId, author: username, name });
      await kv.set('public-layouts', list);
    } else {
      // Update name if changed
      const item = list.find((i) => i.id === layoutId);
      if (item) item.name = name;
      await kv.set('public-layouts', list);
    }
  } else {
    // Remove from public list
    const filtered = list.filter((item) => item.id !== layoutId);
    await kv.set('public-layouts', filtered);
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { modules, id, public: isPublic } = req.body || {};
  if (!validateModules(modules)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { username } = req.user;
  const now = Date.now();
  const pub = !!isPublic;

  if (id) {
    // Update existing layout
    const existing = await kv.get(`layout:${username}:${id}`);
    if (!existing) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    existing.modules = modules;
    existing.public = pub;
    existing.updatedAt = now;
    await kv.set(`layout:${username}:${id}`, existing);
    await updatePublicList(id, username, existing.name, pub);
    return res.status(200).json({ id, name: existing.name, public: pub });
  }

  // Create new layout
  const newId = crypto.randomUUID();
  const date = new Date(now);
  const pad = (n) => String(n).padStart(2, '0');
  const name = `Layout ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

  const layout = {
    id: newId,
    name,
    modules,
    public: pub,
    author: username,
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(`layout:${username}:${newId}`, layout);

  const layoutIds = (await kv.get(`user:${username}:layouts`)) || [];
  layoutIds.push(newId);
  await kv.set(`user:${username}:layouts`, layoutIds);

  if (pub) {
    await updatePublicList(newId, username, name, true);
  }

  return res.status(201).json({ id: newId, name, public: pub });
}

export default withAuth(handler, { rejectAdmin: true });
