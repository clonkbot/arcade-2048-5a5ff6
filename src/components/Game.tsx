import { useEffect, useCallback, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { useGame } from '../hooks/useGame';
import { GameBoard } from './GameBoard';
import { Leaderboard } from './Leaderboard';

export function Game() {
  const { signOut } = useAuthActions();
  const gameState = useQuery(api.game.getGameState);
  const saveGameState = useMutation(api.game.saveGameState);
  const submitScore = useMutation(api.game.submitScore);
  const resetGameMutation = useMutation(api.game.resetGame);

  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  const {
    grid,
    tiles,
    score,
    bestScore,
    gameOver,
    won,
    continueAfterWin,
    move,
    resetGame,
    continuePlaying,
  } = useGame(
    gameState?.grid,
    gameState?.score,
    gameState?.bestScore,
    gameState?.gameOver,
    gameState?.won
  );

  // Auto-save game state
  useEffect(() => {
    if (gameState === undefined) return; // Still loading

    const hasChanges =
      JSON.stringify(grid) !== JSON.stringify(gameState?.grid) ||
      score !== gameState?.score ||
      bestScore !== gameState?.bestScore ||
      gameOver !== gameState?.gameOver ||
      won !== gameState?.won;

    if (hasChanges && grid.some(row => row.some(cell => cell !== 0))) {
      const timeout = setTimeout(() => {
        saveGameState({ grid, score, bestScore, gameOver, won });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [grid, score, bestScore, gameOver, won, gameState, saveGameState]);

  // Handle game over - prompt for leaderboard
  useEffect(() => {
    if (gameOver && score > 0) {
      setPendingScore(score);
      setShowUsernameModal(true);
    }
  }, [gameOver, score]);

  const handleSubmitScore = useCallback(async () => {
    if (!username.trim() || pendingScore === null) return;
    await submitScore({ score: pendingScore, username: username.trim() });
    setShowUsernameModal(false);
    setPendingScore(null);
  }, [username, pendingScore, submitScore]);

  const handleReset = useCallback(async () => {
    await resetGameMutation();
    resetGame();
  }, [resetGameMutation, resetGame]);

  if (gameState === undefined) {
    return (
      <div className="app-container">
        <div className="spinner" />
        <p className="mt-4" style={{ fontFamily: 'VT323, monospace', color: 'var(--text-muted)' }}>
          Loading game...
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="mb-6 text-center">
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
          Join the tiles, get to 2048!
        </p>
      </div>

      {/* Score displays */}
      <div className="flex gap-4 mb-6">
        <div className="score-box">
          <div className="score-label">Score</div>
          <div className="score-value">{score.toLocaleString()}</div>
        </div>
        <div className="score-box">
          <div className="score-label">Best</div>
          <div className="score-value">{bestScore.toLocaleString()}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button onClick={handleReset} className="arcade-btn">
          New Game
        </button>
        <button onClick={() => signOut()} className="arcade-btn magenta">
          Sign Out
        </button>
      </div>

      {/* Game board */}
      <GameBoard
        tiles={tiles}
        onMove={move}
        gameOver={gameOver}
        won={won}
        continueAfterWin={continueAfterWin}
        onReset={handleReset}
        onContinue={continuePlaying}
        score={score}
      />

      {/* Touch hint */}
      <p className="touch-hint">
        Use arrow keys or swipe to move tiles
      </p>

      {/* Leaderboard */}
      <div className="mt-8">
        <Leaderboard />
      </div>

      {/* Username modal for leaderboard */}
      {showUsernameModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(10, 10, 15, 0.95)' }}
        >
          <div className="auth-container">
            <h3 className="auth-title neon-text neon-yellow">
              Submit Score
            </h3>
            <p style={{
              fontFamily: 'VT323, monospace',
              fontSize: '1.5rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              color: 'var(--neon-yellow)',
              textShadow: '0 0 10px var(--neon-yellow)'
            }}>
              Your score: {pendingScore?.toLocaleString()}
            </p>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              className="arcade-input w-full mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitScore();
              }}
            />
            <div className="flex gap-3">
              <button onClick={handleSubmitScore} className="arcade-btn flex-1">
                Submit
              </button>
              <button
                onClick={() => {
                  setShowUsernameModal(false);
                  setPendingScore(null);
                }}
                className="arcade-btn magenta flex-1"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer mt-auto pt-8">
        Requested by @0xcatp · Built by @clonkbot
      </footer>
    </div>
  );
}
