const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
// Content Security Policy for local development (allow local connections)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:4000 ws://localhost:4000;"
  );
  next();
});
// Serve static files from `public` so DevTools probe at /.well-known works
app.use(express.static('public'));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Swagger / OpenAPI
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');

// Simple JWT auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid authorization format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Role check middleware
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'missing auth' });
    if (req.user.role !== role) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

// Auth endpoints (development-friendly: login by email)
// Register user with password
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, tenantId } = req.body;
    if (!email || !password || !tenantId) return res.status(400).json({ error: 'email, password and tenantId required' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'user already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, name, tenantId, passwordHash: hash } });
    res.status(201).json({ id: user.id, email: user.email, name: user.name, tenantId: user.tenantId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login with email + password
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'user not found' });
    if (!user.passwordHash) return res.status(401).json({ error: 'password not set for user' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, tenantId: user.tenantId, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, passwordMustChange: !!user.passwordMustChange });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json({ id: user.id, email: user.email, name: user.name, tenantId: user.tenantId, role: user.role, passwordMustChange: !!user.passwordMustChange });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password endpoint (authenticated)
app.post('/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: 'newPassword required' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'user not found' });
    // If user has a passwordHash, require currentPassword
    if (user.passwordHash) {
      if (!currentPassword) return res.status(400).json({ error: 'currentPassword required' });
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'invalid current password' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash, passwordMustChange: false } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve OpenAPI spec and Swagger UI
app.get('/openapi.json', (req, res) => res.json(openapiSpec));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Tenants
app.get('/tenants', authMiddleware, async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.user.tenantId } });
    res.json(tenant ? [tenant] : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/tenants/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.tenantId !== req.params.id) return res.status(403).json({ error: 'forbidden' });
    const tenant = await prisma.tenant.findUnique({ where: { id: req.params.id } });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tenants', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const tenant = await prisma.tenant.create({ data: { name } });
    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tenants/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.tenantId !== req.params.id) return res.status(403).json({ error: 'forbidden' });
    const { name } = req.body;
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { name } });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tenants/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    if (req.user.tenantId !== req.params.id) return res.status(403).json({ error: 'forbidden' });
    await prisma.tenant.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users (scoped to authenticated user's tenant)
app.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({ where: { tenantId: req.user.tenantId } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.tenantId !== req.user.tenantId) return res.status(403).json({ error: 'forbidden' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/users', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { email, name, tenantId } = req.body;
    const finalTenant = tenantId || req.user.tenantId;
    if (!email || !finalTenant) return res.status(400).json({ error: 'email and tenantId required' });
    if (finalTenant !== req.user.tenantId) return res.status(403).json({ error: 'forbidden' });
    const user = await prisma.user.create({ data: { email, name, tenantId: finalTenant } });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    const { email, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'User not found' });
    if (existing.tenantId !== req.user.tenantId) return res.status(403).json({ error: 'forbidden' });
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { email, name } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'User not found' });
    if (existing.tenantId !== req.user.tenantId) return res.status(403).json({ error: 'forbidden' });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Projects (scoped to authenticated user's tenant)
app.get('/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ where: { tenantId: req.user.tenantId } });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.tenantId !== req.user.tenantId) return res.status(403).json({ error: 'forbidden' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/projects', authMiddleware, async (req, res) => {
  try {
    const { name, tenantId } = req.body;
    const finalTenant = tenantId || req.user.tenantId;
    if (!name || !finalTenant) return res.status(400).json({ error: 'name and tenantId required' });
    if (finalTenant !== req.user.tenantId) return res.status(403).json({ error: 'forbidden' });
    const project = await prisma.project.create({ data: { name, tenantId: finalTenant } });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    if (existing.tenantId !== req.user.tenantId) return res.status(403).json({ error: 'forbidden' });
    const project = await prisma.project.update({ where: { id: req.params.id }, data: { name } });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/projects/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    if (existing.tenantId !== req.user.tenantId) return res.status(403).json({ error: 'forbidden' });
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tenant -> projects
app.get('/tenants/:id/projects', authMiddleware, async (req, res) => {
  try {
    if (req.user.tenantId !== req.params.id) return res.status(403).json({ error: 'forbidden' });
    const projects = await prisma.project.findMany({ where: { tenantId: req.params.id } });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  });
}

module.exports = app;

