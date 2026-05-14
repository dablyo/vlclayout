export default function LayoutItem({ name, isDemo, isOwner = true, isPublic = false, isActive, onClick, onDelete }) {
  const badge = isDemo ? '' : isPublic ? '🌐' : isOwner ? '🔒' : '';
  const showDelete = isOwner && !isDemo && onDelete;

  return (
    <div
      className={`layout-item ${isActive ? 'active' : ''} ${isDemo ? 'demo' : ''}`}
      onClick={onClick}
    >
      <span>{badge} {name}</span>
      {showDelete && (
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
