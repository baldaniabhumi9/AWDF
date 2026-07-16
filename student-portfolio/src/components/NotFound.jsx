import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-section not-found">
      <p className="eyebrow">404</p>
      <h2>Page not found</h2>
      <p>The route you requested does not exist. Head back home to explore the portfolio.</p>
      <div className="button-row">
        <Link className="primary-link" to="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
