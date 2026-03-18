import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';
import AddItemModal from '../components/AddItemModal';
import Toast from '../components/Toast';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';
import { parsePrice, getBookmarkletParams } from '../utils/helpers';

const FILTERS = ['all', 'active', 'purchased'];
const FILTER_LABELS = { all: 'All', active: 'Wanted', purchased: 'Purchased' };

export default function WishlistPage() {
  const { items, boards, addItem, deleteItem, togglePurchased, saveNote, addBoard } = useWishlist();
  const { toast, showToast } = useToast();

  const [activeBoard,  setActiveBoard]  = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalInitial, setModalInitial] = useState(null);

  // ── Handle bookmarklet params on mount ─────────────────────────
  useEffect(() => {
    const params = getBookmarkletParams();
    if (params) {
      setModalInitial(params);
      setModalOpen(true);
    }
  }, []);

  // ── Derived data ───────────────────────────────────────────────
  let visibleItems = activeBoard === 'all'
    ? items
    : items.filter(i => i.board === activeBoard);

  if (activeFilter === 'active')    visibleItems = visibleItems.filter(i => !i.purchased);
  if (activeFilter === 'purchased') visibleItems = visibleItems.filter(i =>  i.purchased);

  const totalEst = visibleItems
    .reduce((acc, i) => acc + parsePrice(i.price), 0)
    .toFixed(2);

  // ── Handlers ───────────────────────────────────────────────────
  function openModal(initial = null) {
    setModalInitial(initial);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalInitial(null);
  }

  function handleSaveItem(itemData) {
    addItem(itemData);
    closeModal();
    showToast('Added to wishlist ✦');
  }

  function handleDelete(id) {
    deleteItem(id);
    showToast('Removed');
  }

  function handleToggle(id) {
    const item = items.find(i => i.id === id);
    togglePurchased(id);
    showToast(item?.purchased ? 'Moved back to wanted' : 'Marked as purchased 🛍️');
  }

  function handleAddBoard(name) {
    const success = addBoard(name);
    if (success) showToast(`Board "${name}" created`);
    return success;
  }

  return (
    <>
      <Header
        itemCount={visibleItems.length}
        totalEstimate={totalEst}
        onAddItem={() => openModal()}
      />

      <div className="layout">
        <Sidebar
          boards={boards}
          items={items}
          activeBoard={activeBoard}
          onSelectBoard={setActiveBoard}
          onAddBoard={handleAddBoard}
        />

        <main>
          <div className="section-header">
            <div className="section-title">
              {activeBoard === 'all' ? 'All Items' : activeBoard}
            </div>
            <div className="filter-row">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="items-grid">
            {visibleItems.length === 0 ? (
              <EmptyState />
            ) : (
              visibleItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onTogglePurchased={handleToggle}
                  onSaveNote={saveNote}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <AddItemModal
          boards={boards}
          activeBoard={activeBoard}
          initialData={modalInitial}
          onSave={handleSaveItem}
          onClose={closeModal}
        />
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}