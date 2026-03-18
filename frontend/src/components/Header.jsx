export default function Header({ itemCount, totalEstimate, onAddItem }) {
  return (
    <header>
      <div className="logo">✦ h<span>opping</span> ✦</div>
      <div className="header-actions">
        <div className="total-row">
          <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          {parseFloat(totalEstimate) > 0 && (
            <span className="total-price">${totalEstimate} est.</span>
          )}
        </div>
        <button className="btn btn-primary" onClick={onAddItem}>
          + Add Item
        </button>
      </div>
    </header>
  );
}
