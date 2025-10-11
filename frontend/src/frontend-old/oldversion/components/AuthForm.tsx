import React, { useState } from 'react';
import './AuthForm.css';

interface AuthFormProps {
  onAuthSuccess: (email: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@') || password.length < 6) {
      setError('Invalid email or password (min 6 characters).');
      return;
    }

    try {
      // Call backend auth API here: sign-up or sign-in endpoint
      // Example: await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ email, password, isSigningUp }) });
      // On success:
      onAuthSuccess(email);
    } catch {
      setError('Authentication failed. Try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSigningUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit">{isSigningUp ? 'Sign Up' : 'Sign In'}</button>
      </form>
      <p className="auth-toggle" onClick={() => { setIsSigningUp(!isSigningUp); setError(''); }}>
        {isSigningUp ? 'Already have an account? Sign In' : 'New user? Sign Up'}
      </p>
    </div>
  );
};

export default AuthForm;
