require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const healthRoutes = require('./src/routes/health');
const userRoutes = require('./src/routes/users');
const itemRoutes = require('./src/routes/items');
const metaRoutes = require('./src/routes/meta');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// API routes
app.use('/api', healthRoutes);
app.use('/api', userRoutes);
app.use('/api', itemRoutes);
app.use('/api', metaRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all: send index.html for any non-API route (SPA support)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✓ Database: ${process.env.DATABASE_URL}`);
});