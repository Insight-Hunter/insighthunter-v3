import React, { useState } from 'react';

interface AuthFormProps {
  onAuthSuccess: (email: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email.includes('@') || password.length < 6) {
      setError('Please enter a valid email and a password with at least 6 characters.');
      return;
    }

    // TODO: Integrate with auth backend or 3rd party service here

    onAuthSuccess(email); // Fake success callback; replace with real API response
  };

  return (
    <div className="auth-form-container">
      <h2>{isSigningUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete={isSigningUp ? 'new-password' : 'current-password'} />
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">{isSigningUp ? 'Sign Up' : 'Sign In'}</button>
      </form>
      <p className="toggle-link" onClick={() => { setIsSigningUp(!isSigningUp); setError(''); }}>
        {isSigningUp ? 'Already have an account? Sign In' : 'New user? Sign Up'}
      </p>
    </div>
  );
};

export default AuthForm;
