// ── STRING / DISPLAY HELPERS ───────────────────────────────────────

export function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function shortUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url.slice(0, 30); }
}

export function boardEmoji(name) {
  const map = {
    clothes: '👗', home: '🏠', beauty: '💄', tech: '💻',
    gifts: '🎁', food: '🍕', travel: '✈️', books: '📚',
  };
  return map[name?.toLowerCase()] || '📌';
}

export function cleanTitle(t) {
  return t.replace(/\s*[\|–—-].*$/, '').trim().slice(0, 120);
}

// ── PRICE HELPERS ──────────────────────────────────────────────────

export function formatPrice(raw) {
  if (!raw) return '';
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return raw;
  return '$' + num.toFixed(2);
}

export function parsePrice(raw) {
  if (!raw) return 0;
  return parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;
}

// ── STORAGE ────────────────────────────────────────────────────────

const STORAGE_KEY = 'wishlist_v2';

const DEFAULT_STATE = {
  boards: ['Clothes', 'Home', 'Beauty', 'Tech', 'Gifts'],
  items: [],
};

export function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveData(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── BOOKMARKLET PARAMS ─────────────────────────────────────────────

export function getBookmarkletParams() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title');
  const image = params.get('image');
  const price = params.get('price');
  const url   = params.get('url');

  if (!title && !url) return null;

  // Clean URL so refreshing doesn't re-trigger
  window.history.replaceState({}, '', window.location.pathname);

  return { title, image, price: formatPrice(price), url };
}