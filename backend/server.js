require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// ── DATABASE CONNECTION ──
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ── METADATA FETCHING ──
async function fetchMeta(url) {
  if (!url.startsWith('http')) return null;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    const meta = await page.evaluate(() => {
      const getMeta = (names) => {
        for (const name of names) {
          const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
          if (el && el.content) return el.content;
        }
        return '';
      };

      const getPrice = () => {
        const selectors = [
          'meta[property="product:price:amount"]',
          'meta[property="og:price:amount"]',
          'meta[itemprop="price"]',
          '[itemprop="price"]',
          '.price', '#price', '.product-price', '.a-price-whole',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) {
            const val = el.getAttribute('content') || el.textContent;
            const match = val.match(/[\$£€¥]?\s*\d[\d,]*(\.\d{1,2})?/);
            if (match) return match[0].trim();
          }
        }
        return '';
      };

      return {
        title: getMeta(['og:title', 'twitter:title']) || document.title || '',
        image: getMeta(['og:image', 'twitter:image']) || '',
        price: getPrice(),
      };
    });

    await browser.close();
    return meta;
  } catch (err) {
    await browser.close();
    return { title: '', image: '', price: '' };
  }
}

// ── API ROUTES ──

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err.message,
      database: 'disconnected'
    });
  }
});

// ── USERS ENDPOINTS ──

// Create User
app.post('/api/users', async (req, res) => {
  const { username, email, password_hash } = req.body;

  if (!username || !email || !password_hash) {
    return res.status(400).json({ error: 'Missing required fields: username, email, password_hash' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [username, email, password_hash]
    );
    const userId = result.rows[0].id;
    res.status(201).json({ success: true, id: userId, message: 'User created' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

// Get User by ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM get_user_by_id($1)',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update User Email
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  try {
    await pool.query(
      'SELECT update_user_email($1, $2)',
      [id, email]
    );
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'SELECT delete_user($1)',
      [id]
    );
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── ITEMS ENDPOINTS ──

// Create Item
app.post('/api/items', async (req, res) => {
  const { user_id, name, price, url, source_url, image } = req.body;

  if (!user_id || !name || !price) {
    return res.status(400).json({ error: 'Missing required fields: user_id, name, price' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Items (user_id, name, price, url, source_url, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, name, price, url || null, source_url || null, image || null]
    );
    const itemId = result.rows[0].id;
    res.status(201).json({ success: true, id: itemId, message: 'Item created' });
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: err.message || 'Failed to create item' });
  }
});

// Get Item by ID
app.get('/api/items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM get_item_by_id($1)',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Items for a User
app.get('/api/users/:user_id/items', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM Items WHERE user_id = $1 ORDER BY date_added DESC',
      [user_id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update Item Price
app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  if (!price) {
    return res.status(400).json({ error: 'Missing price' });
  }

  try {
    await pool.query(
      'SELECT update_item_price($1, $2)',
      [id, price]
    );
    res.json({ success: true, message: 'Item updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Item
app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'SELECT delete_item($1)',
      [id]
    );
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch metadata from URL
app.post('/api/fetch-meta', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const meta = await fetchMeta(url);
    res.json(meta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all: send index.html for any non-API route (needed for React Router)
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