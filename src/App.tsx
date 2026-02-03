import { useConvexAuth } from 'convex/react';
import { AuthForm } from './components/AuthForm';
import { Game } from './components/Game';
import './styles.css';

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="app-container min-h-screen">
        <div className="text-center">
          <h1
            className="text-4xl md:text-6xl font-black tracking-wider mb-8 glitch neon-text neon-cyan"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            2048
          </h1>
          <div className="spinner mx-auto" />
          <p className="mt-4" style={{ fontFamily: 'VT323, monospace', color: 'var(--text-muted)' }}>
            Initializing...
          </p>
        </div>
        <footer className="footer mt-auto">
          Requested by @0xcatp · Built by @clonkbot
        </footer>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container min-h-screen">
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-6xl font-black tracking-wider mb-2 glitch neon-text neon-cyan"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            2048
          </h1>
          <p style={{
            fontFamily: 'VT323, monospace',
            fontSize: '1.25rem',
            color: 'var(--text-muted)',
            letterSpacing: '2px'
          }}>
            The classic puzzle game
          </p>
        </div>
        <AuthForm />
        <footer className="footer mt-auto pt-8">
          Requested by @0xcatp · Built by @clonkbot
        </footer>
      </div>
    );
  }

  return <Game />;
}
