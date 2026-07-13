import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="page-section hero-section">
      <div className="hero-card">
        <p className="eyebrow">Student Portfolio</p>
        <h2>Hi, I’m Bhumi Baldania</h2>
        <p>
          I enjoy building simple, thoughtful web experiences and learning modern web
          technologies with a strong focus on clean design.
        </p>
        <div className="button-row">
          <Link to="/about" className="primary-link">
            Learn more
          </Link>
          <Link to="/projects" className="secondary-link">
            View projects
          </Link>
        </div>
      </div>
    </section>
  );
}
