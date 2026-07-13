export default function About({ skills }) {
  return (
    <section className="page-section">
      <h2>About Me</h2>
      <p>
        I am a dedicated student passionate about software development, embedded systems,
        and building practical solutions with modern tools.
      </p>
      <div className="skills-panel">
        <h3>Core Skills</h3>
        <ul>
          {skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
