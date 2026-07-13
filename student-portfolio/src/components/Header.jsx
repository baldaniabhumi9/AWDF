export default function Header({ studentName, onNavigate }) {
  return (
    <header className="topbar">
      <div>
        <p className="brand-name">{studentName}</p>
        <h1>Portfolio</h1>
      </div>
      <nav className="nav-links">
        <a href="#" onClick={(event) => { event.preventDefault(); onNavigate('home'); }}>Home</a>
        <a href="#" onClick={(event) => { event.preventDefault(); onNavigate('about'); }}>About</a>
        <a href="#" onClick={(event) => { event.preventDefault(); onNavigate('projects'); }}>Projects</a>
      </nav>
    </header>
  );
}
