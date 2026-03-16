// Utility functions for database operations
export function formatPrice(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return undefined;
  return '$' + num.toFixed(2);
}

export function parsePrice(raw: string | undefined): number {
  if (!raw) return 0;
  return parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;
}

export function cleanTitle(title: string): string {
  return title.replace(/\s*[\|–—-].*$/, '').trim().slice(0, 120);
}

export function shortUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname || url;
  } catch {
    return url;
  }
}
