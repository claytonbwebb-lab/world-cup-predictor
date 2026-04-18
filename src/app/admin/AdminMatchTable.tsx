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

function EditModal({ match, onClose, onSave }: { match: Match; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    home_team: match.home_team,
    away_team: match.away_team,
    home_flag: match.home_flag || '',
    away_flag: match.away_flag || '',
    group_stage: match.group_stage || '',
    kickoff_at: new Date(new Date(match.kickoff_at).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const fd = new FormData();
    fd.set('home_team', form.home_team);
    fd.set('away_team', form.away_team);
    fd.set('home_flag', form.home_flag);
    fd.set('away_flag', form.away_flag);
    fd.set('group_stage', form.group_stage);
    fd.set('kickoff_at', form.kickoff_at);
    const res = await fetch(`/api/admin/matches/${match.id}`, {
      method: 'PUT',
      body: fd,
    });
    if (res.ok) {
      onSave();
    } else {
      const json = await res.json();
      setError(json.error || 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Edit Match</h2>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-textMuted">Home Team</label>
              <input className="input w-full" value={form.home_team} onChange={e => setForm(p => ({ ...p, home_team: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-textMuted">Away Team</label>
              <input className="input w-full" value={form.away_team} onChange={e => setForm(p => ({ ...p, away_team: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-textMuted">Home Flag</label>
              <input className="input w-full" value={form.home_flag} onChange={e => setForm(p => ({ ...p, home_flag: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-textMuted">Away Flag</label>
              <input className="input w-full" value={form.away_flag} onChange={e => setForm(p => ({ ...p, away_flag: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-textMuted">Group / Stage</label>
            <input className="input w-full" value={form.group_stage} onChange={e => setForm(p => ({ ...p, group_stage: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-textMuted">Kickoff</label>
            <input type="datetime-local" className="input w-full" value={form.kickoff_at} onChange={e => setForm(p => ({ ...p, kickoff_at: e.target.value }))} required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMatchTable({ matches }: { matches: Match[] }) {
  const [entering, setEntering] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [editing, setEditing] = useState<Match | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function submitResult(matchId: string) {
    const s = scores[matchId] || { home: '0', away: '0' };
    await fetch('/api/scoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: matchId, home_score: parseInt(s.home), away_score: parseInt(s.away) }),
    });
    window.location.reload();
  }

  async function confirmDelete(matchId: string) {
    await fetch(`/api/admin/matches/${matchId}`, { method: 'DELETE' });
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
    <>
      {editing && (
        <EditModal
          match={editing}
          onClose={() => setEditing(null)}
          onSave={() => window.location.reload()}
        />
      )}

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
                <td className="py-3 px-4 text-textMuted text-sm">{match.group_stage || '-'}</td>
                <td className="py-3 px-4 text-textMuted text-sm">
                  {new Date(match.kickoff_at).toLocaleString('en-GB', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="py-3 px-4">
                  {match.result_entered
                    ? <span className="font-bold text-primary">{match.home_score} - {match.away_score}</span>
                    : <span className="text-textMuted text-sm">Not entered</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  {match.is_locked
                    ? <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">Locked</span>
                    : <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Open</span>}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end flex-wrap">
                    {/* Edit button */}
                    <button
                      onClick={() => setEditing(match)}
                      className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded transition-colors"
                      title="Edit match"
                    >
                      ✏️ Edit
                    </button>

                    {/* Delete button */}
                    {deleting === match.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => confirmDelete(match.id)}
                          disabled={deletingId === match.id}
                          className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded"
                        >
                          {deletingId === match.id ? 'Deleting...' : '✓ Confirm'}
                        </button>
                        <button
                          onClick={() => { setDeleting(null); setDeletingId(null); }}
                          className="text-xs bg-surfaceLight text-textMuted hover:bg-surfaceLight/80 px-3 py-1.5 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleting(match.id)}
                        className="text-xs bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 px-3 py-1.5 rounded transition-colors"
                        title="Delete match"
                      >
                        🗑️ Delete
                      </button>
                    )}

                    {/* Enter result */}
                    {!match.result_entered && (
                      entering === match.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number" min="0" max="20"
                            className="input w-12 text-center py-1 text-xs"
                            placeholder="H"
                            value={scores[match.id]?.home ?? ''}
                            onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], home: e.target.value } }))}
                          />
                          <span className="text-textMuted">-</span>
                          <input
                            type="number" min="0" max="20"
                            className="input w-12 text-center py-1 text-xs"
                            placeholder="A"
                            value={scores[match.id]?.away ?? ''}
                            onChange={e => setScores(p => ({ ...p, [match.id]: { ...p[match.id], away: e.target.value } }))}
                          />
                          <button onClick={() => submitResult(match.id)} className="btn-primary text-xs py-1 px-2">✓</button>
                          <button onClick={() => setEntering(null)} className="btn-secondary text-xs py-1 px-1">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setEntering(match.id)} className="text-xs bg-surfaceLight text-textMuted hover:text-text px-3 py-1.5 rounded">
                          Enter Result
                        </button>
                      )
                    )}

                    {/* Lock/unlock */}
                    <form action="/api/admin/toggle-lock" method="POST">
                      <input type="hidden" name="match_id" value={match.id} />
                      <input type="hidden" name="locked" value={(!match.is_locked).toString()} />
                      <button type="submit" className="text-xs bg-surfaceLight text-textMuted hover:text-text px-3 py-1.5 rounded">
                        {match.is_locked ? '🔓 Unlock' : '🔒 Lock'}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}