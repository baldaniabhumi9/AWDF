import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuthToken, getAuthToken } from '../api';

export default function NavBar({ studentName, isDarkMode, onToggleTheme, showIntro, onToggleIntro }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    const updateAuthState = () => setIsAuthenticated(Boolean(getAuthToken()));
    window.addEventListener('auth:changed', updateAuthState);
    window.addEventListener('storage', updateAuthState);
    return () => {
      window.removeEventListener('auth:changed', updateAuthState);
      window.removeEventListener('storage', updateAuthState);
    };
  }, []);

  function handleLogout() {
    clearAuthToken();
    navigate('/login', { replace: true });
  }

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
        {isAuthenticated ? (
          <button type="button" className="nav-auth-button" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <NavLink to="/register" className="nav-register-link">Create account</NavLink>
          </>
        )}
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
