const puppeteer = require('puppeteer');

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

module.exports = { fetchMeta };
