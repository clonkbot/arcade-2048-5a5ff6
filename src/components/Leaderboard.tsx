import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function Leaderboard() {
  const entries = useQuery(api.game.getLeaderboard);

  if (entries === undefined) {
    return (
      <div className="leaderboard">
        <h3 className="leaderboard-title">Top Scores</h3>
        <div className="flex justify-center py-4">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3 className="leaderboard-title">Top Scores</h3>
      {entries.length === 0 ? (
        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'VT323, monospace',
          fontSize: '1.125rem'
        }}>
          No scores yet. Be the first!
        </p>
      ) : (
        <div>
          {entries.map((entry: typeof entries[number], index: number) => (
            <div key={entry._id} className="leaderboard-entry">
              <span className="leaderboard-rank">
                {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </span>
              <span className="leaderboard-name">{entry.username}</span>
              <span className="leaderboard-score">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
