export default function Header({ toggleTheme }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">AI <em>Humanizer</em></span>
        </div>
        <div className="header-right">
          <button
            className="theme-toggle"
            id="themeToggle"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <span className="sun">☀️</span>
            <span className="moon">🌙</span>
          </button>
        </div>
      </div>
    </header>
  );
}
