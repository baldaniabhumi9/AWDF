import { useCallback, useEffect, useState } from 'react';

function Spinner() {
  return (
    <div className="status-panel" role="status" aria-live="polite">
      <div className="spinner" />
      <p>Loading repositories...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="status-panel error-state">
      <h3>Unable to load repositories</h3>
      <p>{message}</p>
      <button type="button" className="secondary-link retry-button" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

function RepoList({ repos, searchQuery, onSearchChange }) {
  const visibleRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="projects-toolbar">
        <label className="search-field" htmlFor="repo-search">
          <span>Search repositories</span>
          <input
            id="repo-search"
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Filter by repository name"
          />
        </label>
      </div>

      <div className="repo-list">
        {visibleRepos.length === 0 ? (
          <p className="empty-state">No repositories match your search.</p>
        ) : (
          visibleRepos.map((repo) => (
            <article key={repo.id} className="repo-card">
              <div className="repo-card-header">
                <h3>{repo.name}</h3>
                <span className="star-badge">★ {repo.stargazers_count}</span>
              </div>
              <p>{repo.description || 'No description provided.'}</p>
              <a href={repo.html_url} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </article>
          ))
        )}
      </div>
    </>
  );
}

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.github.com/users/baldaniabhumi9/repos?per_page=100');

      if (!response.ok) {
        throw new Error(`Unable to load repositories (${response.status})`);
      }

      const data = await response.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading your repositories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return (
    <section className="page-section">
      <h2>Projects</h2>
      <p className="section-intro">
        These repositories are loaded from the GitHub API so the portfolio stays up to date.
      </p>

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={fetchRepos} />}
      {!loading && !error && (
        <RepoList repos={repos} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      )}
    </section>
  );
}
