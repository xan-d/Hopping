import { useState, useCallback, useEffect } from 'react';
import { loadData, saveData } from '../utils/helpers';
import { fetchUserItems, createItem, deleteItemApi } from '../services/api';

// Map a DB row to the shape the frontend expects
function mapDbItem(row) {
  return {
    id: String(row.id),
    title: row.name || '',
    price: row.price,
    url: row.url || '',
    image: row.image || '',
    purchased: row.purchased || false,
    notes: row.notes || '',
    addedAt: row.date_added || new Date().toISOString(),
  };
}

export function useWishlist() {
  const [state, setState] = useState(() => ({
    ...loadData(),
    loaded: false,
  }));

  // ── fetch items from backend on mount ──────────────────────────
  useEffect(() => {
    fetchUserItems(1)
      .then(rows => {
        const items = rows.map(mapDbItem);
        setState(prev => ({ ...prev, items, loaded: true }));
        saveData({ boards: state.boards, items });
      })
      .catch(err => {
        console.error('Failed to load items from database:', err);
        setState(prev => ({ ...prev, loaded: true }));
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── persist helper ─────────────────────────────────────────────
  const update = useCallback((updater) => {
    setState(prev => {
      const next = updater(prev);
      saveData({ boards: next.boards, items: next.items });
      return next;
    });
  }, []);

  // ── items ──────────────────────────────────────────────────────
  const addItem = useCallback((item) => {
    const price = parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;

    createItem({
      user_id: 1, // TODO: replace with actual logged-in user id
      name: item.title || item.name || '',
      price,
      url: item.url || null,
      source_url: item.url || null,
      image: item.image || null,
    })
      .then(data => {
        const newItem = {
          id: String(data.id),
          title: item.title || item.name || '',
          price,
          url: item.url || '',
          image: item.image || '',
          purchased: false,
          notes: '',
          addedAt: new Date().toISOString(),
        };
        update(prev => ({ ...prev, items: [newItem, ...prev.items] }));
      })
      .catch(err => {
        console.error('Failed to save item to database:', err);
        const newItem = { ...item, id: Date.now().toString(), purchased: false, addedAt: new Date().toISOString() };
        update(prev => ({ ...prev, items: [newItem, ...prev.items] }));
      });
  }, [update]);

  const deleteItem = useCallback((id) => {
    deleteItemApi(id).catch(err => console.error('Failed to delete item from database:', err));
    update(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  }, [update]);

  const togglePurchased = useCallback((id) => {
    update(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, purchased: !i.purchased } : i),
    }));
  }, [update]);

  const saveNote = useCallback((id, notes) => {
    update(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, notes } : i),
    }));
  }, [update]);

  // ── boards ─────────────────────────────────────────────────────
  const addBoard = useCallback((name) => {
    if (!name || state.boards.includes(name)) return false;
    update(prev => ({ ...prev, boards: [...prev.boards, name] }));
    return true;
  }, [state.boards, update]);

  return {
    items: state.items,
    boards: state.boards,
    addItem,
    deleteItem,
    togglePurchased,
    saveNote,
    addBoard,
  };
}