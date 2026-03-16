require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

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

// Placeholder endpoints for items (for future database integration)
app.get('/api/items', (req, res) => {
  res.json({ items: [] });
});

app.post('/api/items', (req, res) => {
  const { title, url, price, image, notes, board } = req.body;
  if (!title && !url) return res.status(400).json({ error: 'Missing title or url' });
  res.status(201).json({ success: true, message: 'Item saved' });
});

// Placeholder endpoints for boards
app.get('/api/boards', (req, res) => {
  res.json({ boards: [] });
});

app.post('/api/boards', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing board name' });
  res.status(201).json({ success: true, message: 'Board created' });
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
