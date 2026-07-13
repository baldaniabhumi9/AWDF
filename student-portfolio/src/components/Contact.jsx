import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Thanks ${name || 'there'}! Your message has been received.`);
  };

  return (
    <section className="page-section">
      <h2>Contact Me</h2>
      <p>Feel free to reach out if you’d like to connect or collaborate.</p>
      <button type="button" className="secondary-link" onClick={() => setShowHint((prev) => !prev)}>
        {showHint ? 'Hide help' : 'Show help'}
      </button>
      {showHint && (
        <p className="help-tooltip">Tip: Include a short intro and your preferred contact method.</p>
      )}
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Message
          <textarea rows="4" value={message} onChange={(event) => setMessage(event.target.value)} required />
        </label>
        <button type="submit">Send Message</button>
      </form>
    </section>
  );
}
