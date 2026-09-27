import { NavLink } from 'react-router-dom';

export default function NavBar({ studentName, isDarkMode, onToggleTheme, showIntro, onToggleIntro }) {
  return (
    <header className="topbar">
      <div>
        <p className="brand-name">{studentName}</p>
        <h1>Portfolio</h1>
      </div>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/about">About</NavLink>
        <button type="button" className="secondary-link theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button type="button" className="secondary-link" onClick={onToggleIntro}>
          {showIntro ? 'Hide intro' : 'Show intro'}
        </button>
      </nav>
    </header>
  );
}
