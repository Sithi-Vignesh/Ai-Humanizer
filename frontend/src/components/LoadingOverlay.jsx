export default function LoadingOverlay({ isVisible, message }) {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay" id="loading-overlay">
      <div className="loading-card">
        <div className="spinner" />
        <p id="loading-msg">{message}</p>
      </div>
    </div>
  );
}
