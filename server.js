import express from 'express';
import 'dotenv/config';

// Import all API handlers
import register from './api/auth/register.js';
import login from './api/auth/login.js';
import password from './api/auth/password.js';
import adminInit from './api/auth/admin-init.js';
import adminStatus from './api/auth/admin-status.js';
import layoutList from './api/layouts/list.js';
import layoutSave from './api/layouts/save.js';
import layoutDelete from './api/layouts/delete.js';
import adminUsers from './api/admin/users.js';

const app = express();
app.use(express.json());

// Convert Vercel serverless handler (req, res) to Express
function wrap(handler) {
  return async (req, res) => {
    // Express 5: req.query is read-only getter, build a plain object instead
    const vercelReq = {
      method: req.method,
      headers: req.headers,
      query: { ...req.query },
      body: req.body || {},
    };
    handler(vercelReq, res);
  };
}

// Auth
app.post('/api/auth/register', wrap(register));
app.post('/api/auth/login', wrap(login));
app.put('/api/auth/password', wrap(password));
app.post('/api/auth/admin-init', wrap(adminInit));
app.get('/api/auth/admin-status', wrap(adminStatus));

// Layouts
app.get('/api/layouts', wrap(layoutList));
app.post('/api/layouts', wrap(layoutSave));
app.delete('/api/layouts', wrap(layoutDelete));

// Admin
app.get('/api/admin/users', wrap(adminUsers));
app.delete('/api/admin/users', wrap(adminUsers));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/admin-status');
  console.log('  POST /api/auth/admin-init');
  console.log('  PUT  /api/auth/password');
  console.log('  GET  /api/layouts');
  console.log('  POST /api/layouts');
  console.log('  DELETE /api/layouts?id=xxx');
  console.log('  GET  /api/admin/users');
  console.log('  DELETE /api/admin/users?username=xxx');
});
