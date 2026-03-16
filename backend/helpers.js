// ── HELPERS ────────────────────────────────────────────────────────

function formatPrice(raw) {
  if (!raw) return undefined;
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return undefined;
  return '$' + num.toFixed(2);
}

function parsePrice(raw) {
  if (!raw) return 0;
  return parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;
}

function cleanTitle(title) {
  return title.replace(/\s*[\|–—-].*$/, '').trim().slice(0, 120);
}

function shortUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname || url;
  } catch {
    return url;
  }
}

module.exports = {
  formatPrice,
  parsePrice,
  cleanTitle,
  shortUrl,
};
