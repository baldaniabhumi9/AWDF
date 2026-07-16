import { useState } from 'react';
import { getMessages, saveMessage } from '../data/messages';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState(getMessages);

  const handleSubmit = (event) => {
    event.preventDefault();

    saveMessage({
      name,
      email,
      subject,
      message,
    });

    setMessages(getMessages());
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');

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
          Subject
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="What would you like to discuss?"
          />
        </label>
        <label>
          Message
          <textarea rows="4" value={message} onChange={(event) => setMessage(event.target.value)} required />
        </label>
        <p className="char-count">{message.length} / 280 characters</p>
        <button type="submit">Send Message</button>
      </form>

      <div className="message-log">
        <h3>Recent messages</h3>
        {messages.length === 0 ? (
          <p>No messages yet. Your sent feedback will appear here.</p>
        ) : (
          <ul>
            {messages.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.name || 'Anonymous'}</strong>
                <span>{entry.subject || 'No subject'}</span>
                <p>{entry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
