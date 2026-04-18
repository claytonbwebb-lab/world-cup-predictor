'use client';
import { useState } from 'react';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  group_stage: string;
  kickoff_at: string;
  home_score: number | null;
  away_score: number | null;
  is_locked: boolean;
  result_entered: boolean;
}

export default function AdminMatchTable({ matches }: { matches: Match[] }) {
  const [entering, setEntering] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});

  async function submitResult(matchId: string) {
    const s = scores[matchId] || { home: '0', away: '0' };
    await fetch('/api/scoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: matchId,
        home_score: parseInt(s.home),
        away_score: parseInt(s.away),
      }),
    });
    window.location.reload();
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📅</div>
        <p className="text-textMuted">No matches added yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-textMuted font-medium">Match</th>
            <th className="text-left py-3 px-4 text-textMuted font-medium">Stage</th>
            <th className="text-left py-3 px-4 text-textMuted font-medium">Kickoff</th>
            <th className="text-left py-3 px-4 text-textMuted font-medium">Result</th>
            <th className="text-center py-3 px-4 text-textMuted font-medium">Status</th>
            <th className="text-center py-3 px-4 text-textMuted font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.id} className="border-b border-border/50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span>{match.home_flag || '🏳️'}</span>
                  <span className="font-medium">{match.home_team}</span>
                  <span className="text-textMuted">vs</span>
                  <span className="font-medium">{match.away_team}</span>
                  <span>{match.away_flag || '🏳️'}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-textMuted">{match.group_stage || '-'}</td>
              <td className="py-3 px-4 text-textMuted">
                {new Date(match.kickoff_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </td>
              <td className="py-3 px-4">
                {match.result_entered
                  ? <span className="font-bold text-primary">{match.home_score} - {match.away_score}</span>
                  : <span className="text-textMuted">Not entered</span>}
              </td>
              <td className="py-3 px-4 text-center">
                {match.is_locked
                  ? <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">Locked</span>
                  : <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Open</span>}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2 justify-center flex-wrap">
                  {!match.result_entered && (
                    entering === match.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min="0" max="20"
                          className="input w-14 text-center py-1 text-sm"
                          placeholder="H"
                          value={scores[match.id]?.home ?? ''}
                          onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], home: e.target.value } }))}
                        />
                        <span className="text-textMuted">-</span>
                        <input
                          type="number" min="0" max="20"
                          className="input w-14 text-center py-1 text-sm"
                          placeholder="A"
                          value={scores[match.id]?.away ?? ''}
                          onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], away: e.target.value } }))}
                        />
                        <button onClick={() => submitResult(match.id)} className="btn-primary text-sm py-1 px-3">✓</button>
                        <button onClick={() => setEntering(null)} className="btn-secondary text-sm py-1 px-2">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setEntering(match.id)} className="btn-secondary text-sm py-1 px-3">
                        Enter Result
                      </button>
                    )
                  )}
                  <form action="/api/admin/toggle-lock" method="POST">
                    <input type="hidden" name="match_id" value={match.id} />
                    <input type="hidden" name="locked" value={(!match.is_locked).toString()} />
                    <button type="submit" className="btn-secondary text-sm py-1 px-3">
                      {match.is_locked ? 'Unlock' : 'Lock'}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
