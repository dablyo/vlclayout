import { verifyToken } from './auth.js';

function sendJson(res, status, data) {
  res.status(status).json(data);
}

export function withAuth(handler, options = {}) {
  return async function (req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendJson(res, 401, { error: 'Invalid or missing token' });
      }

      const token = authHeader.slice(7);
      let user;
      try {
        user = verifyToken(token);
      } catch {
        return sendJson(res, 401, { error: 'Invalid or missing token' });
      }

      if (options.requireAdmin && !user.isAdmin) {
        return sendJson(res, 403, { error: 'Admin access required' });
      }

      if (options.rejectAdmin && user.isAdmin) {
        return sendJson(res, 403, { error: 'Admin cannot access this resource' });
      }

      req.user = user;
      return handler(req, res);
    } catch (err) {
      console.error('Middleware error:', err);
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  };
}
