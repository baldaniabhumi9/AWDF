export default function Skills({ technicalSkills }) {
  return (
    <section id="skills" style={{ padding: '2rem 1rem', backgroundColor: '#e9eef2' }}>
      <h2>My Skills</h2>
      <ul>
        {technicalSkills.map((skill, index) => (
          <li key={index} style={{ margin: '5px 0' }}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}
