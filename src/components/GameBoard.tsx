import { useEffect, useRef, useCallback } from 'react';
import type { Tile } from '../hooks/useGame';

interface GameBoardProps {
  tiles: Tile[];
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => boolean;
  gameOver: boolean;
  won: boolean;
  continueAfterWin: boolean;
  onReset: () => void;
  onContinue: () => void;
  score: number;
}

function getTileClass(value: number): string {
  if (value <= 2048) {
    return `tile-${value}`;
  }
  return 'tile-super';
}

function getTileSize(value: number): string {
  if (value < 100) return '2rem';
  if (value < 1000) return '1.5rem';
  return '1.25rem';
}

export function GameBoard({
  tiles,
  onMove,
  gameOver,
  won,
  continueAfterWin,
  onReset,
  onContinue,
  score
}: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver || (won && !continueAfterWin)) return;

    const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    };

    const direction = keyMap[e.key];
    if (direction) {
      e.preventDefault();
      onMove(direction);
    }
  }, [onMove, gameOver, won, continueAfterWin]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameOver || (won && !continueAfterWin)) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipe = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipe) {
        onMove(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipe) {
        onMove(deltaY > 0 ? 'down' : 'up');
      }
    }

    touchStartRef.current = null;
  };

  const showOverlay = gameOver || (won && !continueAfterWin);

  return (
    <div
      ref={boardRef}
      className="game-grid relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Background cells */}
      {Array(16).fill(null).map((_, i) => (
        <div key={i} className="grid-cell" />
      ))}

      {/* Tiles */}
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className={`tile ${getTileClass(tile.value)} ${tile.isNew ? 'tile-new' : ''} ${tile.isMerged ? 'tile-merged' : ''}`}
          style={{
            width: 'calc((100% - 48px) / 4)',
            height: 'calc((100% - 48px) / 4)',
            position: 'absolute',
            left: `calc(16px + ${tile.col} * (100% - 16px) / 4)`,
            top: `calc(16px + ${tile.row} * (100% - 16px) / 4)`,
            fontSize: getTileSize(tile.value),
          }}
        >
          {tile.value}
        </div>
      ))}

      {/* Game over / Win overlay */}
      {showOverlay && (
        <div className="game-overlay">
          <h3
            className={`game-overlay-title neon-text ${gameOver ? 'neon-magenta' : 'neon-yellow'}`}
          >
            {gameOver ? 'Game Over' : 'You Win!'}
          </h3>
          <p style={{
            fontFamily: 'VT323, monospace',
            fontSize: '1.5rem',
            marginBottom: '1.5rem',
            color: 'var(--neon-yellow)',
            textShadow: '0 0 10px var(--neon-yellow)'
          }}>
            Score: {score}
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button onClick={onReset} className="arcade-btn">
              New Game
            </button>
            {won && !gameOver && (
              <button onClick={onContinue} className="arcade-btn magenta">
                Keep Going
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
