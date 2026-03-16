import { cleanTitle, formatPrice } from '../utils/helpers';

// ── META FETCH ─────────────────────────────────────────────────────
// Uses allorigins.win as a CORS proxy to scrape OG meta tags.
// For sites that block scrapers (Amazon etc.) the bookmarklet is more reliable.

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