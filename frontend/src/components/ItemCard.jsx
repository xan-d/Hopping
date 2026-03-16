import { useState } from 'react';
import { boardEmoji, formatPrice, shortUrl } from '../utils/helpers';

export default function ItemCard({ item, onDelete, onTogglePurchased, onSaveNote }) {
  const [notes, setNotes] = useState(item.notes || '');

  return (
    <div className={`item-card ${item.purchased ? 'purchased' : ''}`}>
      <div className="item-image-wrap">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.target.parentElement.innerHTML = '<div class="item-image-placeholder">🛍️</div>';
            }}
          />
        ) : (
          <div className="item-image-placeholder">🛍️</div>
        )}
        <div className="item-actions-overlay">
          <button
            className="overlay-btn purchase"
            title={item.purchased ? 'Mark wanted' : 'Mark purchased'}
            onClick={() => onTogglePurchased(item.id)}
          >
            {item.purchased ? '↩' : '✓'}
          </button>
          <button
            className="overlay-btn delete"
            title="Remove"
            onClick={() => onDelete(item.id)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="item-body">
        <div className="item-title">{item.title || 'Untitled'}</div>

        {item.price ? (
          <div className="item-price">{formatPrice(item.price)}</div>
        ) : (
          <div className="item-price no-price">no price set</div>
        )}

        {item.url && (
          <a
            className="item-link"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 {shortUrl(item.url)}
          </a>
        )}

        <textarea
          className="item-notes"
          placeholder="Add a note…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onSaveNote(item.id, notes)}
        />
      </div>

      <div className="item-footer">
        <span className="item-board-tag">
          {boardEmoji(item.board)} {item.board}
        </span>
      </div>
    </div>
  );
}