import { useState, useCallback } from 'react';
import { loadData, saveData } from '../utils/helpers';

export function useWishlist() {
  const [state, setState] = useState(() => loadData());

  // ── persist helper ─────────────────────────────────────────────
  const update = useCallback((updater) => {
    setState(prev => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // ── items ──────────────────────────────────────────────────────
  const addItem = useCallback((item) => {
    update(prev => ({
      ...prev,
      items: [{ ...item, id: Date.now().toString(), purchased: false, addedAt: new Date().toISOString() }, ...prev.items],
    }));
  }, [update]);

  const deleteItem = useCallback((id) => {
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