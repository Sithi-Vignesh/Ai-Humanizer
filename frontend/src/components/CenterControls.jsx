export default function CenterControls({ onHumanizeClick }) {
  return (
    <div className="center-col">
      <button className="btn-humanize" id="humanize-btn" onClick={onHumanizeClick}>
        <span className="btn-text">Humanize</span>
        <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}
