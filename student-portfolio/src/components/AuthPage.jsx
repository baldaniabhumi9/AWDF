import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser, registerUser } from '../api';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (isRegister) {
        await registerUser({ email, password });
        navigate('/login?registered=1', { replace: true });
      } else {
        await loginUser({ email, password });
        navigate('/tasks', { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section auth-page">
      <div className="auth-mark" aria-hidden="true">TM</div>
      <p className="eyebrow">Task Manager / Practical 7</p>
      <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
      <p className="auth-intro">
        {isRegister ? 'Create an account to keep your tasks private and synced.' : 'Sign in to continue to your task list.'}
      </p>

      {searchParams.get('expired') === '1' && (
        <p className="auth-notice" role="status">Your session expired. Please sign in again.</p>
      )}
      {searchParams.get('registered') === '1' && (
        <p className="auth-notice" role="status">Account created. Sign in with your new credentials.</p>
      )}
      {error && <p className="auth-error" role="alert">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={254}
          required
        />
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          maxLength={128}
          required
        />
        {isRegister && <span className="auth-hint">Use at least 8 characters.</span>}
        <button className="task-primary-button" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        {isRegister ? 'Already registered?' : 'New to Task Manager?'}{' '}
        <Link to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </section>
  );
}