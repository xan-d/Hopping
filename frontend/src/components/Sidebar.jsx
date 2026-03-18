import { useState } from 'react';
import { boardEmoji } from '../utils/helpers';

export default function Sidebar({ boards, items, activeBoard, onSelectBoard, onAddBoard }) {
  const [newBoardName, setNewBoardName] = useState('');

  function handleAddBoard() {
    const name = newBoardName.trim();
    if (onAddBoard(name)) {
      setNewBoardName('');
    }
  }

  return (
    <aside>
      <div className="sidebar-label">Boards</div>

      <button
        className={`board-btn ${activeBoard === 'all' ? 'active' : ''}`}
        onClick={() => onSelectBoard('all')}
      >
        <span className="board-name-wrap">🏷 All Items</span>
        <span className="board-count">{items.length}</span>
      </button>

      {boards.map(b => (
        <button
          key={b}
          className={`board-btn ${activeBoard === b ? 'active' : ''}`}
          onClick={() => onSelectBoard(b)}
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
  );
}
