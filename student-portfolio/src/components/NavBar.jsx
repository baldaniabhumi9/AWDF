import { Link } from 'react-router-dom';

export default function NavBar({ studentName }) {
  return (
    <header className="topbar">
      <div>
        <p className="brand-name">{studentName}</p>
        <h1>Portfolio</h1>
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
}
