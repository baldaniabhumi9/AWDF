export default function Projects() {
  const projects = [
    {
      title: 'AI-Powered Document Search Portal',
      description:
        'Designed and developed an AI-powered document search portal that enables fast, semantic search across large document collections using NLP-based indexing techniques.',
    },
    {
      title: 'Healthcare Technology Project',
      description:
        'Built an IoT-based healthcare monitoring system using Arduino, microcontrollers, and integrated sensors for real-time neonatal data tracking.',
    },
    {
      title: 'Smart Asset System for Company Handling',
      description:
        'Developed a smart asset management solution to streamline company asset tracking, monitoring, and operational workflows.',
    },
    {
      title: 'Core Inventory Project',
      description:
        'Implemented a core inventory management system focused on organizing stock data, improving tracking efficiency, and supporting day-to-day business operations.',
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
