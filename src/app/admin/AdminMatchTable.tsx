'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TeamBadge from '@/components/TeamBadge';
import TeamSelect from '@/components/TeamSelect';
import { getWeekDropdownLabel } from '@/lib/weeks';

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
  week_number: number | null;
}

function ScoreModal({ match, onClose, onSave }: { match: Match; onClose: () => void; onSave: () => void }) {
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Focus first input on mount
  const homeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { homeRef.current?.focus(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/scoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: match.id, home_score: parseInt(home), away_score: parseInt(away) }),
    });
    if (res.ok) {
      onSave();
    } else {
      const json = await res.json();
      setError(json.error || 'Failed to save');
      setSaving(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onKeyDown={handleKey}>
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold mb-1">Enter Result</h2>
        <p className="text-sm text-textMuted mb-4">
          {match.home_team} vs {match.away_team}
        </p>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <div className="text-center">
              <TeamBadge value={match.home_flag} size="md" />
              <p className="text-xs text-textMuted mt-1 mb-2">{match.home_team}</p>
              <input
                ref={homeRef}
                type="number" min="0" max="20"
                className="input w-16 text-center text-xl font-bold py-2"
                placeholder="0"
                value={home}
                onChange={e => setHome(e.target.value)}
                required
              />
            </div>
            <span className="text-2xl text-textMuted font-bold mt-6">—</span>
            <div className="text-center">
              <TeamBadge value={match.away_flag} size="md" />
              <p className="text-xs text-textMuted mt-1 mb-2">{match.away_team}</p>
              <input
                type="number" min="0" max="20"
                className="input w-16 text-center text-xl font-bold py-2"
                placeholder="0"
                value={away}
                onChange={e => setAway(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
              {saving ? 'Saving...' : 'Save Result'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-6 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ match, onClose, onDelete }: { match: Match; onClose: () => void; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/admin/matches/${match.id}`, { method: 'DELETE' });
    onDelete();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold text-red-400 mb-2">Delete Match?</h2>
        <p className="text-sm text-textMuted mb-1">
          {match.home_team} vs {match.away_team}
        </p>
        <p className="text-xs text-textMuted mb-6">
          {new Date(match.kickoff_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        <p className="text-sm text-red-300 mb-6">This will permanently delete the match and all associated predictions. This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 py-2.5">
            {deleting ? 'Deleting...' : 'Delete Match'}
          </button>
          <button onClick={onClose} className="btn-secondary px-6 py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function BulkDeleteModal({ selectedIds, matchCount, onClose, onDelete }: {
  selectedIds: string[]; matchCount: number; onClose: () => void; onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    // Delete each selected match
    await Promise.all(selectedIds.map(id =>
      fetch(`/api/admin/matches/${id}`, { method: 'DELETE' })
    ));
    onDelete();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold text-red-400 mb-2">Delete {matchCount} Match{matchCount !== 1 ? 'es' : ''}?</h2>
        <p className="text-sm text-textMuted mb-6">This will permanently delete {matchCount} match{matchCount !== 1 ? 'es' : ''} and all associated predictions. This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 py-2.5">
            {deleting ? 'Deleting...' : `Delete ${matchCount} Match${matchCount !== 1 ? 'es' : ''}`}
          </button>
          <button onClick={onClose} className="btn-secondary px-6 py-2.5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ match, onClose, onSave }: { match: Match; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    home_team: match.home_team,
    away_team: match.away_team,
    home_flag: match.home_flag || '',
    away_flag: match.away_flag || '',
    group_stage: match.group_stage || '',
    week_number: match.week_number ?? '',
    kickoff_at: match.kickoff_at.slice(0, 16),
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
    if (form.week_number) fd.set('week_number', String(form.week_number));
    fd.set('kickoff_at', new Date(form.kickoff_at).toISOString());
    const res = await fetch(`/api/admin/matches/${match.id}`, { method: 'PUT', body: fd });
    if (res.ok) { onSave(); }
    else {
      const json = await res.json();
      setError(json.error || 'Failed to save');
      setSaving(false);
    }
  }

  function handleTeamChange(name: string, teamName: string, badge: string) {
    setForm(p => ({
      ...p,
      [name === 'home_team' ? 'home_team' : 'away_team']: teamName,
      [name === 'home_team' ? 'home_flag' : 'away_flag']: badge,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Edit Match</h2>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <TeamSelect label="Home Team" name="home_team" value={form.home_team} onChange={handleTeamChange} small />
            <TeamSelect label="Away Team" name="away_team" value={form.away_team} onChange={handleTeamChange} small />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-textMuted">Group / Stage</label>
            <input className="input w-full" value={form.group_stage} onChange={e => setForm(p => ({ ...p, group_stage: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-textMuted">Week Number (1-38)</label>
            <input type="number" min="1" max="38" className="input w-full" value={form.week_number} onChange={e => setForm(p => ({ ...p, week_number: e.target.value }))} placeholder="Auto from kickoff date" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-textMuted">Kickoff</label>
            <input type="datetime-local" className="input w-full" value={form.kickoff_at} onChange={e => setForm(p => ({ ...p, kickoff_at: e.target.value }))} required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={onClose} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AdminMatchTableProps {
  matches: Match[];
  availableWeeks?: number[];
  selectedWeek?: number | null;
}

export default function AdminMatchTable({ matches, availableWeeks = [], selectedWeek }: AdminMatchTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = new Date();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Auto-refresh every 30s to detect kickoff passing / lock changes
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);
  const [editing, setEditing] = useState<Match | null>(null);
  const [scoring, setScoring] = useState<Match | null>(null);
  const [deleting, setDeleting] = useState<Match | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const allSelected = matches.length > 0 && selected.size === matches.length;
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(matches.map(m => m.id)));
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleLockToggle(matchId: string, currentlyLocked: boolean) {
    const formData = new FormData();
    formData.append('match_id', matchId);
    formData.append('locked', String(!currentlyLocked));
    try {
      await fetch('/api/admin/toggle-lock', { method: 'POST', body: formData });
      window.location.reload();
    } catch (e) {
      console.error('Failed to toggle lock', e);
    }
  }

  // Build URL with updated week param
  function weekUrl(week: number | 'all') {
    const params = new URLSearchParams(searchParams.toString());
    if (week === 'all') params.delete('week');
    else params.set('week', String(week));
    return `/admin?${params.toString()}`;
  }

  return (
    <div>
      {/* Header + week filter */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Manage Matches</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedWeek ?? 'all'}
            onChange={e => {
              const val = e.target.value;
              router.push(val === 'all' ? weekUrl('all') : weekUrl(Number(val)));
            }}
            className="bg-surface border border-border text-text rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Weeks</option>
            {availableWeeks.map(w => (
              <option key={w} value={w}>{getWeekDropdownLabel(w)}</option>
            ))}
          </select>
          {selectedWeek && (
            <a
              href={weekUrl('all')}
              className="text-xs text-textMuted hover:text-text underline"
            >
              Clear
            </a>
          )}
        </div>
      </div>

      {/* No matches state */}
      {(!matches || matches.length === 0) && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-textMuted">No matches added yet</p>
        </div>
      )}

      {/* Match table */}
      {matches.length > 0 && (
        <>
          {editing && <EditModal match={editing} onClose={() => setEditing(null)} onSave={() => window.location.reload()} />}
          {scoring && <ScoreModal match={scoring} onClose={() => setScoring(null)} onSave={() => window.location.reload()} />}
          {deleting && <DeleteModal match={deleting} onClose={() => setDeleting(null)} onDelete={() => window.location.reload()} />}
          {bulkDeleting && <BulkDeleteModal selectedIds={Array.from(selected)} matchCount={selected.size} onClose={() => setBulkDeleting(false)} onDelete={() => window.location.reload()} />}

          {/* Bulk action bar */}
          {someSelected && (
            <div className="sticky top-0 z-40 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 flex items-center justify-between gap-4">
              <span className="text-sm text-red-300">{selected.size} match{selected.size !== 1 ? 'es' : ''} selected</span>
              <div className="flex gap-2">
                <button onClick={() => setBulkDeleting(true)} className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-colors">
                  🗑️ Delete Selected
                </button>
                <button onClick={() => setSelected(new Set())} className="text-xs bg-surfaceLight text-textMuted hover:text-text px-4 py-2 rounded-lg transition-colors">
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Select all */}
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 text-sm text-textMuted cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = !allSelected && someSelected; }}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary cursor-pointer"
              />
              Select all
            </label>
            {someSelected && <span className="text-xs text-textMuted">{selected.size} of {matches.length}</span>}
          </div>

          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 px-4 text-textMuted font-medium"></th>
                  <th className="pb-3 px-4 text-textMuted font-medium">Match</th>
                  <th className="pb-3 px-4 text-textMuted font-medium text-center">Score</th>
                  <th className="pb-3 px-4 text-textMuted font-medium text-center">Status</th>
                  <th className="pb-3 px-4 text-textMuted font-medium">Date</th>
                  <th className="pb-3 px-4 text-textMuted font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(match => {
                  const isSelected = selected.has(match.id);
                  return (
                    <tr key={match.id} className={`border-b border-border/50 hover:bg-surfaceLight/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(match.id)}
                          className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>
                      {/* Teams */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <TeamBadge value={match.home_flag} size="sm" />
                            <span className="font-medium text-text truncate">{match.home_team}</span>
                          </div>
                          <span className="text-textMuted text-xs shrink-0">v</span>
                          <div className="flex items-center gap-2">
                            <TeamBadge value={match.away_flag} size="sm" />
                            <span className="font-medium text-text truncate">{match.away_team}</span>
                          </div>
                        </div>
                      </td>
                      {/* Score */}
                      <td className="py-3 px-4 text-center">
                        {match.result_entered && match.home_score !== null ? (
                          <span className="font-bold text-primary">{match.home_score} – {match.away_score}</span>
                        ) : (
                          <span className="text-textMuted">–</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {match.week_number !== null && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium mr-1">{getWeekDropdownLabel(match.week_number).split(' — ')[0]}</span>
                        )}
                        {match.is_locked || new Date(match.kickoff_at) <= new Date() ? (
                          <span className="text-red-400 text-xs" title="Locked">🔒</span>
                        ) : (
                          <span className="text-green-400 text-xs" title="Open for predictions">🟢</span>
                        )}
                      </td>
                      {/* Date */}
                      <td className="py-3 px-4 text-textMuted text-xs whitespace-nowrap">
                        {new Date(match.kickoff_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {match.result_entered ? (
                          <button
                            onClick={() => setScoring(match)}
                            className="text-xs bg-surfaceLight hover:bg-surfaceLight/80 text-textMuted hover:text-text px-3 py-1.5 rounded-lg transition-colors"
                          >
                            ✏️ Edit Result
                          </button>
                        ) : (
                          <button
                            onClick={() => setScoring(match)}
                            className="text-xs bg-primary/20 hover:bg-primary/30 text-primary font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            ➕ Enter Result
                          </button>
                        )}
                        <button
                          onClick={() => setEditing(match)}
                          className="text-xs text-textMuted hover:text-text px-2 py-1.5 transition-colors ml-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleLockToggle(match.id, match.is_locked)}
                          className={`text-xs px-2 py-1.5 transition-colors ml-1 ${match.is_locked ? 'text-yellow-400/70 hover:text-yellow-400' : 'text-green-400/70 hover:text-green-400'}`}
                          title={match.is_locked ? 'Unlock match' : 'Lock match'}
                        >
                          {match.is_locked ? '🔓 Unlock' : '🔒 Lock'}
                        </button>
                        <button
                          onClick={() => setDeleting(match)}
                          className="text-xs text-red-400/70 hover:text-red-400 px-2 py-1.5 transition-colors ml-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
