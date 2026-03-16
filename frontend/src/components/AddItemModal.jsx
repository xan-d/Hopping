import { useState, useEffect } from 'react';
import { fetchProductMeta } from '../services/api';
import { formatPrice, shortUrl } from '../utils/helpers';

export default function AddItemModal({ boards, activeBoard, initialData, onSave, onClose }) {
  const [url,    setUrl]    = useState(initialData?.url   || '');
  const [title,  setTitle]  = useState(initialData?.title || '');
  const [price,  setPrice]  = useState(initialData?.price || '');
  const [board,  setBoard]  = useState(activeBoard !== 'all' ? activeBoard : boards[0] || '');
  const [notes,  setNotes]  = useState('');
  const [image,  setImage]  = useState(initialData?.image || '');
  const [status, setStatus] = useState(initialData ? { type: 'success', text: '✓ Grabbed from page!' } : null);
  const [loading, setLoading] = useState(false);

  // Auto-fetch when opened from bookmarklet with a URL but no title
  useEffect(() => {
    if (initialData?.url && !initialData?.title) {
      handleFetch();
    }
  }, []);

  async function handleFetch() {
    const target = url.trim();
    if (!target || !target.startsWith('http')) return;

    setLoading(true);
    setStatus({ type: 'loading', text: 'Fetching…' });

    try {
      const meta = await fetchProductMeta(target);
      if (meta.title) setTitle(meta.title);
      if (meta.price) setPrice(meta.price);
      if (meta.image) setImage(meta.image);
      setStatus({ type: meta.title ? 'success' : 'error', text: meta.title ? '✓ Info fetched!' : '⚠ Fill in manually' });
    } catch {
      setStatus({ type: 'error', text: '⚠ Could not fetch — fill in manually' });
    } finally {
      setLoading(false);
    }
  }

  function handlePaste(e) {
    setTimeout(() => handleFetch(), 50);
  }

  function handleSave() {
    if (!title && !url) return;
    onSave({
      title: title || shortUrl(url),
      url,
      price,
      board: board || boards[0] || 'General',
      notes,
      image,
    });
  }

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains('modal-backdrop') && onClose()}>
      <div className="modal">
        <div className="modal-title">Add to Wishlist</div>

        <div className="form-group">
          <label className="form-label">Product URL</label>
          <div className="url-row">
            <input
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handlePaste}
              placeholder="https://..."
              autoFocus
            />
            <button className="btn btn-ghost" onClick={handleFetch} disabled={loading}>
              Fetch
            </button>
          </div>
          {status && (
            <div className={`fetch-status ${status.type}`}>
              {loading && <span className="spinner" />}
              {status.text}
            </div>
          )}
        </div>

        {image && (
          <img
            src={image}
            className="preview-image"
            alt=""
            onError={(e) => { e.target.style.display = 'none'; setImage(''); }}
          />
        )}

        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product name" />
        </div>

        <div className="form-group">
          <label className="form-label">Price</label>
          <input className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$0.00" />
        </div>

        <div className="form-group">
          <label className="form-label">Board</label>
          <select className="form-select" value={board} onChange={(e) => setBoard(e.target.value)}>
            {boards.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Size, color, why you love it…"
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save ✦</button>
        </div>
      </div>
    </div>
  );
}