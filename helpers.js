// ── STORAGE ────────────────────────────────────────────────────────
const STORAGE_KEY = 'wishlist_v2';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      boards: ['Clothes', 'Home', 'Beauty', 'Tech', 'Gifts'],
      items: []
    };
  } catch {
    return { boards: ['Clothes', 'Home', 'Beauty', 'Tech', 'Gifts'], items: [] };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── STATE ──────────────────────────────────────────────────────────
let state = loadData();
let activeBoard = 'all';
let activeFilter = 'all';
let fetchedImageUrl = '';

// ── HELPERS ────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shortUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url.slice(0, 30); }
}

function boardEmoji(name) {
  const map = {
    clothes: '👗', home: '🏠', beauty: '💄', tech: '💻',
    gifts: '🎁', food: '🍕', travel: '✈️', books: '📚'
  };
  return map[name.toLowerCase()] || '📌';
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── META FETCH ─────────────────────────────────────────────────────
async function fetchMeta() {
  const url = document.getElementById('inputUrl').value.trim();
  if (!url || !url.startsWith('http')) return;

  const status = document.getElementById('fetchStatus');
  status.innerHTML = '<span class="spinner"></span> Fetching…';
  status.className = 'fetch-status loading';

  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    const html = data.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = getMeta(doc, ['og:title', 'twitter:title']) || doc.title || '';
    const image = getMeta(doc, ['og:image', 'twitter:image']) || '';
    const price = getPrice(doc) || '';

    if (title) document.getElementById('inputTitle').value = cleanTitle(title);
    if (price) document.getElementById('inputPrice').value = formatPrice(price);

    if (image) {
      fetchedImageUrl = image;
      const img = document.getElementById('previewImg');
      img.src = image;
      img.style.display = 'block';
      img.onerror = () => { img.style.display = 'none'; fetchedImageUrl = ''; };
    }

    status.textContent = title ? '✓ Info fetched!' : '⚠ Fill in the details manually';
    status.className = 'fetch-status ' + (title ? 'success' : 'error');
  } catch {
    status.textContent = '⚠ Could not fetch — fill in manually';
    status.className = 'fetch-status error';
  }
}

function getMeta(doc, names) {
  for (const name of names) {
    const el = doc.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
    if (el && el.content) return el.content;
  }
  return '';
}

function getPrice(doc) {
  const patterns = [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    'meta[itemprop="price"]',
    '[itemprop="price"]',
    '.price', '#price', '.product-price', '.a-price-whole',
  ];
  for (const sel of patterns) {
    const el = doc.querySelector(sel);
    if (el) {
      const val = el.getAttribute('content') || el.textContent;
      const match = val.match(/[\$£€¥]?\s*\d[\d,]*(\.\d{1,2})?/);
      if (match) return match[0].trim();
    }
  }
  return '';
}

function formatPrice(raw) {
  if (!raw) return '';
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return raw;
  return '$' + num.toFixed(2);
}

function parsePrice(raw) {
  if (!raw) return 0;
  return parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;
}

function cleanTitle(t) {
  return t.replace(/\s*[\|–—-].*$/, '').trim().slice(0, 120);
}

function onUrlPaste() {
  setTimeout(() => fetchMeta(), 50);
}

// ── RENDER ─────────────────────────────────────────────────────────
function renderSidebar() {
  const list = document.getElementById('boardList');

  let html = `<button class="board-btn ${activeBoard === 'all' ? 'active' : ''}" onclick="selectBoard('all')">
    <span class="board-name-wrap">🏷 All Items</span>
    <span class="board-count">${state.items.length}</span>
  </button>`;

  state.boards.forEach(b => {
    const count = state.items.filter(i => i.board === b).length;
    html += `<button class="board-btn ${activeBoard === b ? 'active' : ''}" onclick="selectBoard('${esc(b)}')">
      <span class="board-name-wrap">${boardEmoji(b)} ${esc(b)}</span>
      <span class="board-count">${count}</span>
    </button>`;
  });

  list.innerHTML = html;
}

function renderItems() {
  const grid       = document.getElementById('itemsGrid');
  const totalCount = document.getElementById('totalCount');
  const totalPrice = document.getElementById('totalPrice');

  document.getElementById('sectionTitle').textContent =
    activeBoard === 'all' ? 'All Items' : activeBoard;

  let items = activeBoard === 'all' ? state.items : state.items.filter(i => i.board === activeBoard);
  if (activeFilter === 'active')    items = items.filter(i => !i.purchased);
  if (activeFilter === 'purchased') items = items.filter(i =>  i.purchased);

  totalCount.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  const priced = items.filter(i => i.price && parsePrice(i.price) > 0);
  totalPrice.textContent = priced.length
    ? '$' + priced.reduce((acc, i) => acc + parsePrice(i.price), 0).toFixed(2) + ' est.'
    : '';

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <div class="big-icon">🛍️</div>
      <h3>Nothing here yet</h3>
      <p>Paste a product URL and hit <strong>Add Item</strong><br>to start building your wishlist.</p>
    </div>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="item-card ${item.purchased ? 'purchased' : ''}">
      <div class="item-image-wrap">
        ${item.image
          ? `<img src="${esc(item.image)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=item-image-placeholder>🛍️</div>'" />`
          : `<div class="item-image-placeholder">🛍️</div>`}
        <div class="item-actions-overlay">
          <button class="overlay-btn purchase" title="${item.purchased ? 'Mark wanted' : 'Mark purchased'}"
            onclick="togglePurchased('${item.id}')">
            ${item.purchased ? '↩' : '✓'}
          </button>
          <button class="overlay-btn delete" title="Remove" onclick="deleteItem('${item.id}')">✕</button>
        </div>
      </div>
      <div class="item-body">
        <div class="item-title">${esc(item.title || 'Untitled')}</div>
        ${item.price
          ? `<div class="item-price">${esc(formatPrice(item.price))}</div>`
          : `<div class="item-price no-price">no price set</div>`}
        ${item.url ? `<a class="item-link" href="${esc(item.url)}" target="_blank" rel="noopener">🔗 ${shortUrl(item.url)}</a>` : ''}
        <textarea class="item-notes" placeholder="Add a note…"
          onblur="saveNote('${item.id}', this.value)">${esc(item.notes || '')}</textarea>
      </div>
      <div class="item-footer">
        <span class="item-board-tag">${boardEmoji(item.board)} ${esc(item.board)}</span>
      </div>
    </div>
  `).join('');
}

function render() { renderSidebar(); renderItems(); }

// ── BOARD ACTIONS ──────────────────────────────────────────────────
function selectBoard(name) { activeBoard = name; render(); }

function addBoard() {
  const input = document.getElementById('newBoardInput');
  const name = input.value.trim();
  if (!name || state.boards.includes(name)) { input.value = ''; return; }
  state.boards.push(name);
  input.value = '';
  saveData();
  render();
  showToast(`Board "${name}" created`);
}

// ── FILTER ─────────────────────────────────────────────────────────
function setFilter(f, el) {
  activeFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  render();
}

// ── MODAL ──────────────────────────────────────────────────────────
function populateBoardSelect() {
  const sel = document.getElementById('inputBoard');
  sel.innerHTML = state.boards.map(b => `<option value="${esc(b)}">${esc(b)}</option>`).join('');
  if (activeBoard !== 'all') sel.value = activeBoard;
}

function openModal() {
  fetchedImageUrl = '';
  document.getElementById('inputUrl').value    = '';
  document.getElementById('inputTitle').value  = '';
  document.getElementById('inputPrice').value  = '';
  document.getElementById('inputNotes').value  = '';
  document.getElementById('fetchStatus').textContent = '';
  document.getElementById('fetchStatus').className   = 'fetch-status';
  const img = document.getElementById('previewImg');
  img.style.display = 'none'; img.src = '';
  populateBoardSelect();
  document.getElementById('modalBackdrop').classList.add('open');
  setTimeout(() => document.getElementById('inputUrl').focus(), 100);
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'modalBackdrop') closeModal();
}

// ── ITEM CRUD ──────────────────────────────────────────────────────
function saveItem() {
  const title = document.getElementById('inputTitle').value.trim();
  const url   = document.getElementById('inputUrl').value.trim();
  const price = document.getElementById('inputPrice').value.trim();
  const board = document.getElementById('inputBoard').value;
  const notes = document.getElementById('inputNotes').value.trim();

  if (!title && !url) { showToast('Add a title or URL first'); return; }

  state.items.unshift({
    id: Date.now().toString(),
    title: title || shortUrl(url),
    url, price, board: board || (state.boards[0] || 'General'),
    notes, image: fetchedImageUrl,
    purchased: false,
    addedAt: new Date().toISOString(),
  });

  saveData(); render(); closeModal();
  showToast('Added to wishlist ✦');
}

function togglePurchased(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  item.purchased = !item.purchased;
  saveData(); render();
  showToast(item.purchased ? 'Marked as purchased 🛍️' : 'Moved back to wanted');
}

function deleteItem(id) {
  state.items = state.items.filter(i => i.id !== id);
  saveData(); render();
  showToast('Removed');
}

function saveNote(id, value) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  item.notes = value;
  saveData();
}

// ── BOOKMARKLET PUSH ───────────────────────────────────────────────
function checkBookmarkletParams() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title');
  const image = params.get('image');
  const price = params.get('price');
  const url   = params.get('url');

  if (!title && !url) return;

  window.history.replaceState({}, '', window.location.pathname);

  openModal();
  if (title) document.getElementById('inputTitle').value = title;
  if (price) document.getElementById('inputPrice').value = formatPrice(price);
  if (url)   document.getElementById('inputUrl').value   = url;
  if (image) {
    fetchedImageUrl = image;
    const img = document.getElementById('previewImg');
    img.src = image;
    img.style.display = 'block';
  }

  document.getElementById('fetchStatus').textContent = '✓ Grabbed from page!';
  document.getElementById('fetchStatus').className = 'fetch-status success';
}

// ── INIT ───────────────────────────────────────────────────────────
render();
window.addEventListener('load', checkBookmarkletParams);
