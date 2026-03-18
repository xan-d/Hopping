import { cleanTitle, formatPrice } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || '';

// ── META FETCH ─────────────────────────────────────────────────────

function getMeta(doc, names) {
  for (const name of names) {
    const el = doc.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
    if (el && el.content) return el.content;
  }
  return '';
}

function getPrice(doc) {
  const selectors = [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    'meta[itemprop="price"]',
    '[itemprop="price"]',
    '.price', '#price', '.product-price', '.a-price-whole',
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el) {
      const val = el.getAttribute('content') || el.textContent;
      const match = val.match(/[\$£€¥]?\s*\d[\d,]*(\.\d{1,2})?/);
      if (match) return match[0].trim();
    }
  }
  return '';
}

export async function fetchProductMeta(url) {
  if (!url || !url.startsWith('http')) {
    throw new Error('Invalid URL');
  }

  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy, { signal: AbortSignal.timeout(10000) });
  const data = await res.json();

  const parser = new DOMParser();
  const doc = parser.parseFromString(data.contents, 'text/html');

  const title = getMeta(doc, ['og:title', 'twitter:title']) || doc.title || '';
  const image = getMeta(doc, ['og:image', 'twitter:image']) || '';
  const price = getPrice(doc) || '';

  return {
    title: title ? cleanTitle(title) : '',
    image,
    price: formatPrice(price),
  };
}

// ── ITEM CRUD ──────────────────────────────────────────────────────

export async function fetchUserItems(userId) {
  const res = await fetch(`${API_URL}/api/users/${userId}/items`);
  const data = await res.json();
  return data.items || [];
}

export async function createItem({ user_id, name, price, url, source_url, image }) {
  const res = await fetch(`${API_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, name, price, url, source_url, image }),
  });
  return res.json();
}

export async function deleteItemApi(id) {
  return fetch(`${API_URL}/api/items/${id}`, { method: 'DELETE' });
}