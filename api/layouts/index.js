import layoutList from './list.js';
import layoutSave from './save.js';
import layoutDelete from './delete.js';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return layoutList(req, res);
    case 'POST':
      return layoutSave(req, res);
    case 'DELETE':
      return layoutDelete(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
