'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import FavouriteTeamSelect from './FavouriteTeamSelect';

interface FavouriteTeamPromptProps {
  onComplete?: () => void;
}

export default function FavouriteTeamPrompt({ onComplete }: FavouriteTeamPromptProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeam) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favourite_team: selectedTeam }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      setDone(true);
      onComplete?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSkip() {
    // Dismiss without saving — prompt will reappear on next login
    setDone(true);
    onComplete?.();
  }

  if (done) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-textPrimary mb-2">
            ⚽ Pick your club
          </h2>
          <p className="text-textMuted text-sm">
            Select your favourite club to join the Supporter League. Your prediction points will count
            towards your club&apos;s total — and you can change it anytime from your account settings.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <FavouriteTeamSelect
            value={selectedTeam}
            onChange={setSelectedTeam}
            label="Favourite Club"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={!selectedTeam || saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Join the Supporter League →'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-textMuted text-sm hover:text-text transition-colors py-1"
          >
            Skip for now — you can set this in your profile later
          </button>
        </form>
      </div>
    </div>
  );
}
