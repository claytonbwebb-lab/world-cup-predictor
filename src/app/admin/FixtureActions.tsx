'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function getImportRange() {
  const now = new Date();
  const day = now.getDay();
  const daysSinceTuesday = (day - 2 + 7) % 7;
  const currentTuesday = new Date(now);
  currentTuesday.setDate(now.getDate() - daysSinceTuesday);
  // Two weeks ahead — stage a future week
  const targetTuesday = new Date(currentTuesday);
  targetTuesday.setDate(currentTuesday.getDate() + 14);
  const targetMonday = new Date(targetTuesday);
  targetMonday.setDate(targetTuesday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(targetTuesday), to: fmt(targetMonday) };
}

function getNextWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const daysSinceTuesday = (day - 2 + 7) % 7;
  const currentTuesday = new Date(now);
  currentTuesday.setDate(now.getDate() - daysSinceTuesday);
  // Same as import: two weeks ahead so we stage/push the same week
  const nextTuesday = new Date(currentTuesday);
  nextTuesday.setDate(currentTuesday.getDate() + 14);
  const nextMonday = new Date(nextTuesday);
  nextMonday.setDate(nextTuesday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(nextTuesday), to: fmt(nextMonday) };
}

export default function FixtureActions() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [message, setMessage] = useState('');

  async function handleImport() {
    setImporting(true);
    setMessage('');
    const { from, to } = getImportRange();
    try {
      const res = await fetch(`/api/admin/fixtures/import?from=${from}&to=${to}`, { method: 'POST' });
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
      const res = await fetch(`/api/admin/fixtures/push-live?from=${from}&to=${to}`, { method: 'POST' });
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
      {message && <span className="text-sm font-medium">{message}</span>}
    </div>
  );
}
