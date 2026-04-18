'use client';

import { useState, useEffect } from 'react';

const KICKOFF = new Date('2026-06-11T13:00:00Z').getTime();

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calc = () => {
      const diff = KICKOFF - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-10">
      {[
        { val: pad(timeLeft.d), label: 'Days' },
        { val: pad(timeLeft.h), label: 'Hours' },
        { val: pad(timeLeft.m), label: 'Mins' },
        { val: pad(timeLeft.s), label: 'Secs' },
      ].map(({ val, label }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-surface/80 border border-primary/30 rounded-xl px-4 py-3 text-center min-w-[72px]">
            <span className="text-3xl font-black text-primary tabular-nums">{val}</span>
          </div>
          <span className="text-xs text-textMuted uppercase tracking-widest mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}