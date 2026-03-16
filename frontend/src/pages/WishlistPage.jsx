import { useState, useEffect } from 'react';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import Toast from '../components/Toast';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';
import { boardEmoji, parsePrice, getBookmarkletParams } from '../utils/helpers';

const FILTERS = ['all', 'active', 'purchased'];

export default function WishlistPage() {
  const { items, boards, addItem, deleteItem, togglePurchased, saveNote, addBoard } = useWishlist();
  const { toast, showToast } = useToast();

  const [activeBoard,  setActiveBoard]  = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalInitial, setModalInitial] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');

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
  function handleAddBoard() {
    const name = newBoardName.trim();
    if (addBoard(name)) {
      setNewBoardName('');
      showToast(`Board "${name}" created`);
    }
  }

  function handleSaveItem(itemData) {
    addItem(itemData);
    setModalOpen(false);
    setModalInitial(null);
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

  return (
    <>
      {/* ── HEADER ── */}
      <header>
        <div className="logo">✦ h<span>opping</span> ✦</div>
        <div className="header-actions">
          <div className="total-row">
            <span>{visibleItems.length} item{visibleItems.length !== 1 ? 's' : ''}</span>
            {parseFloat(totalEst) > 0 && (
              <span className="total-price">${totalEst} est.</span>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => { setModalInitial(null); setModalOpen(true); }}>
            + Add Item
          </button>
        </div>
      </header>

      <div className="layout">
        {/* ── SIDEBAR ── */}
        <aside>
          <div className="sidebar-label">Boards</div>

          <button
            className={`board-btn ${activeBoard === 'all' ? 'active' : ''}`}
            onClick={() => setActiveBoard('all')}
          >
            <span className="board-name-wrap">🏷 All Items</span>
            <span className="board-count">{items.length}</span>
          </button>

          {boards.map(b => (
            <button
              key={b}
              className={`board-btn ${activeBoard === b ? 'active' : ''}`}
              onClick={() => setActiveBoard(b)}
            >
              <span className="board-name-wrap">{boardEmoji(b)} {b}</span>
              <span className="board-count">{items.filter(i => i.board === b).length}</span>
            </button>
          ))}

          <div className="add-board-row">
            <input
              className="add-board-input"
              placeholder="New board…"
              maxLength={30}
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBoard()}
            />
            <button className="btn btn-icon" onClick={handleAddBoard}>＋</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
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
                  {f === 'all' ? 'All' : f === 'active' ? 'Wanted' : 'Purchased'}
                </button>
              ))}
            </div>
          </div>

          <div className="items-grid">
            {visibleItems.length === 0 ? (
              <div className="empty-state">
                <div className="big-icon">🛍️</div>
                <h3>Nothing here yet</h3>
                <p>Paste a product URL and hit <strong>Add Item</strong><br />to start building your wishlist.</p>
              </div>
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

      {/* ── MODAL ── */}
      {modalOpen && (
        <AddItemModal
          boards={boards}
          activeBoard={activeBoard}
          initialData={modalInitial}
          onSave={handleSaveItem}
          onClose={() => { setModalOpen(false); setModalInitial(null); }}
        />
      )}

      {/* ── TOAST ── */}
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}