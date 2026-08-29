const STRENGTHS = ['light', 'medium', 'heavy'];

export default function CenterControls({ strength, onStrengthChange, onHumanizeClick }) {
  return (
    <div className="center-col">
      <div className="strength-group">
        <span className="strength-label">Strength</span>
        <div className="strength-pills">
          {STRENGTHS.map((s) => (
            <button
              key={s}
              className={`pill${strength === s ? ' active' : ''}`}
              data-value={s}
              onClick={() => onStrengthChange(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <button className="btn-humanize" id="humanize-btn" onClick={onHumanizeClick}>
        <span className="btn-text">Humanize</span>
        <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}
