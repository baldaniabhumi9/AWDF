export default function Projects() {
  const projects = [
    {
      title: 'Responsive Portfolio',
      description: 'A polished personal website built with React and modern CSS styling.',
    },
    {
      title: 'Web App Prototype',
      description: 'A clean dashboard concept focused on usability and straightforward navigation.',
    },
  ];

  return (
    <section className="page-section">
      <h2>Projects</h2>
      <div className="card-grid">
        {projects.map((project, index) => (
          <article key={index} className="info-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
