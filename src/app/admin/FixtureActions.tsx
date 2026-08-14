'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function getNextWeekRange() {
  const now = new Date();
  // PPW weeks run Tuesday → Monday
  // Find the Tuesday that starts the current week
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysSinceTuesday = (day - 2 + 7) % 7; // days since last Tuesday
  const currentTuesday = new Date(now);
  currentTuesday.setDate(now.getDate() - daysSinceTuesday);
  // Two weeks ahead — always stage a future week, not the current one
  const nextTuesday = new Date(currentTuesday);
  nextTuesday.setDate(currentTuesday.getDate() + 14);
  const nextMonday = new Date(nextTuesday);
  nextMonday.setDate(nextTuesday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(nextTuesday), to: fmt(nextMonday) };
}

export default function FixtureActions({ showHidden }: { showHidden: boolean }) {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [message, setMessage] = useState('');

  async function handleImport() {
    setImporting(true);
    setMessage('');
    const { from, to } = getNextWeekRange();
    try {
      const res = await fetch(`/api/admin/fixtures/import?from=${from}&to=${to}`);
      const json = await res.json();
      if (res.ok) {
        setMessage(`✅ Imported ${json.imported} fixtures, ${json.skipped} skipped`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(`❌ Error: ${json.error}`);
      }
    } catch (e: any) {
      setMessage(`❌ Error: ${e.message}`);
    } finally {
      setImporting(false);
    }
  }

  async function handlePushLive() {
    setPushing(true);
    setMessage('');
    const { from, to } = getNextWeekRange();
    try {
      const res = await fetch(`/api/admin/fixtures/push-live?from=${from}&to=${to}`);
      const json = await res.json();
      if (res.ok) {
        setMessage(`🚀 ${json.updated_count} matches pushed live!`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(`❌ Error: ${json.error}`);
      }
    } catch (e: any) {
      setMessage(`❌ Error: ${e.message}`);
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <button
        onClick={handleImport}
        disabled={importing}
        className="btn-primary text-sm px-4 py-2"
      >
        {importing ? '⏳ Importing...' : '📥 Import Next Week Fixtures'}
      </button>
      <button
        onClick={handlePushLive}
        disabled={pushing}
        className="btn-secondary text-sm px-4 py-2"
      >
        {pushing ? '⏳ Pushing...' : '🚀 Push Next Week Live'}
      </button>
      <a
        href={showHidden ? '/admin' : '/admin?hidden=true'}
        className="text-sm text-yellow-400 hover:text-yellow-300 underline px-2 py-2"
      >
        {showHidden ? '👁️ Hide hidden matches' : '👻 Show hidden matches'}
      </a>
      {message && <span className="text-sm font-medium">{message}</span>}
    </div>
  );
}
