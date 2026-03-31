'use client';
import NavBar from '@/components/NavBar';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface League {
  id: string;
  name: string;
  code: string;
  created_by: string;
  is_public: boolean;
  created_at: string;
}

export default function LeaguesPage() {
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [leagueName, setLeagueName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadLeagues();
  }, []);

  async function loadLeagues() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    setUserId(user.id);

    const { data: members } = await supabase
      .from('league_members')
      .select('league:leagues(*)')
      .eq('user_id', user.id);

    const { data: pub } = await supabase
      .from('leagues')
      .select('*')
      .eq('is_public', true)
      .neq('created_by', user.id);

    setMyLeagues((members?.map((m: any) => m.league).filter(Boolean) || []) as League[]);
    setPublicLeagues((pub || []) as League[]);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/leagues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: leagueName, is_public: isPublic }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to create league'); return; }
    setSuccess(`League created! Invite code: ${data.code}`);
    setShowCreate(false);
    setLeagueName('');
    loadLeagues();
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLeague) return;
    setError('');
    const res = await fetch(`/api/leagues/${editingLeague.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: leagueName }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to update'); return; }
    setEditingLeague(null);
    setLeagueName('');
    loadLeagues();
  }

  async function handleDelete(league: League) {
    if (!confirm(`Delete "${league.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/leagues/${league.id}`, { method: 'DELETE' });
    if (res.ok) { setSuccess('League deleted.'); loadLeagues(); }
  }

  function copyInviteLink(league: League) {
    const url = `${window.location.origin}/leagues?join=${league.code}`;
    navigator.clipboard.writeText(url);
    setCopied(league.id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: joinCode }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to join league'); return; }
    setSuccess('Joined league successfully!');
    setShowJoin(false);
    setJoinCode('');
    loadLeagues();
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3"><span>👥</span> Mini Leagues</h1>
          <div className="flex gap-3">
            <button onClick={() => { setShowJoin(true); setError(''); }} className="btn-secondary">Join League</button>
            <button onClick={() => { setShowCreate(true); setError(''); }} className="btn-primary">Create League</button>
          </div>
        </div>

        {success && (
          <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Edit modal */}
        {editingLeague && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Rename League</h3>
              <form onSubmit={handleRename} className="space-y-4">
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <div>
                  <label className="block text-sm font-medium mb-2">League Name</label>
                  <input type="text" value={leagueName} onChange={e => setLeagueName(e.target.value)}
                    className="input w-full" required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">Save</button>
                  <button type="button" onClick={() => setEditingLeague(null)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Create New League</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <div>
                  <label className="block text-sm font-medium mb-2">League Name</label>
                  <input type="text" value={leagueName} onChange={e => setLeagueName(e.target.value)}
                    className="input w-full" placeholder="The Lads League" required />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_public" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                  <label htmlFor="is_public" className="text-sm text-textMuted">Make public (anyone can join)</label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">Create</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join modal */}
        {showJoin && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Join a League</h3>
              <form onSubmit={handleJoin} className="space-y-4">
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <div>
                  <label className="block text-sm font-medium mb-2">Invite Code</label>
                  <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    className="input w-full font-mono" placeholder="ABC123" required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">Join</button>
                  <button type="button" onClick={() => setShowJoin(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-textMuted">Loading leagues...</div>
        ) : (
          <div className="space-y-8">
            {/* My Leagues */}
            <div>
              <h2 className="text-xl font-semibold mb-4">My Leagues</h2>
              {myLeagues.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-textMuted">You haven't joined any leagues yet.</p>
                  <p className="text-textMuted text-sm mt-1">Create one or ask a friend for their invite code.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {myLeagues.map(league => (
                    <div key={league.id} className="card hover:border-primary/40 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{league.name}</h3>
                          <div className="text-xs text-textMuted mt-1">
                            Code: <span className="font-mono text-primary">{league.code}</span>
                          </div>
                        </div>
                        {league.is_public && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0 ml-2">Public</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button onClick={() => copyInviteLink(league)}
                          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                          {copied === league.id ? '✓ Copied!' : '🔗 Copy Link'}
                        </button>
                        {userId === league.created_by && (<>
                          <button onClick={() => { setEditingLeague(league); setLeagueName(league.name); setError(''); }}
                            className="btn-secondary text-xs px-3 py-1.5">✏️ Rename</button>
                          <button onClick={() => handleDelete(league)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">🗑 Delete</button>
                        </>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Public Leagues */}
            {publicLeagues.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Public Leagues</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {publicLeagues.map(league => (
                    <div key={league.id} className="card hover:border-primary/40 transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold">{league.name}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Public</span>
                      </div>
                      <button
                        onClick={async () => {
                          await fetch('/api/leagues/join', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: league.code }),
                          });
                          loadLeagues();
                        }}
                        className="btn-secondary text-sm mt-3 w-full"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
