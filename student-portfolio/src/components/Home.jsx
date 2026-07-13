export default function Home({ onNavigate }) {
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
          <a
            href="#"
            className="primary-link"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('about');
            }}
          >
            Learn more
          </a>
          <a
            href="#"
            className="secondary-link"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('projects');
            }}
          >
            View projects
          </a>
        </div>
      </div>
    </section>
  );
}
