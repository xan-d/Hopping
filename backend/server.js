require('dotenv').config();
const express = require('express');
const pool = require('./db');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');

app.use(express.json());
app.use(cors({
  origin: /.*/,
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

app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT create_user($1, $2, $3) AS id',
      [username, email, password]
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM get_user_by_id($1)',
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/items', async (req, res) => {
  const { user_id, name, price, url, source_url } = req.body;

  try {
    const result = await pool.query(
      'SELECT create_item($1, $2, $3, $4, $5) AS id',
      [user_id, name, price, url, source_url]
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM get_item_by_id($1)',
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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


// Get all items for a user (requires user_id as query param)
app.get('/api/items', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  try {
    const result = await pool.query(
      'SELECT * FROM Items WHERE user_id = $1 ORDER BY date_added DESC',
      [user_id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});


// Boards endpoints removed (no boards table in schema)


// Serve static frontend files
app.use(express.static(frontendDistPath));

// Catch-all: send index.html for any non-API route (needed for React Router)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
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
});
