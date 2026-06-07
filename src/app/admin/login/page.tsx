'use client';

import { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { login } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.redirect) {
        window.location.href = result.redirect;
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <Heart size={28} fill="white" />
          </div>
          <h1>Admin Panel</h1>
          <p>Sign in to manage your practice</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            {error}
          </div>
        )}

        <form action={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email" style={{ color: 'var(--admin-text-secondary)' }}>Email</label>
            <input
              id="login-email"
              type="email"
              className="admin-input"
              placeholder="dr.skbhatt@vardaanclinic.com"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password" style={{ color: 'var(--admin-text-secondary)' }}>Password</label>
            <input
              id="login-password"
              type="password"
              className="admin-input"
              placeholder="Enter your password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '16px', marginTop: '8px' }}
            disabled={loading}
            id="login-submit"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="admin-login-forgot">
          <a href="#">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}
