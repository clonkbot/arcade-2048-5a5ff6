import { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn('password', formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn('anonymous');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title neon-text neon-cyan">
        {flow === 'signIn' ? 'Sign In' : 'Sign Up'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="arcade-input w-full"
          disabled={loading}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="arcade-input w-full"
          disabled={loading}
        />
        <input name="flow" type="hidden" value={flow} />

        {error && (
          <p className="text-sm" style={{ color: 'var(--neon-red)', fontFamily: 'VT323, monospace' }}>
            {error}
          </p>
        )}

        <button type="submit" className="arcade-btn w-full" disabled={loading}>
          {loading ? 'Loading...' : flow === 'signIn' ? 'Sign In' : 'Sign Up'}
        </button>

        <button
          type="button"
          onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}
          className="arcade-btn magenta w-full"
          disabled={loading}
        >
          {flow === 'signIn' ? 'Create Account' : 'Back to Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--bg-surface)' }}>
        <button
          onClick={handleAnonymous}
          className="arcade-btn w-full"
          style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}
          disabled={loading}
        >
          Play as Guest
        </button>
        <p className="text-center mt-2" style={{
          fontFamily: 'VT323, monospace',
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          No account needed!
        </p>
      </div>
    </div>
  );
}
