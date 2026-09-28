'use client';

import React from 'react';

interface NewsTickerProps {
  messages?: string[];
  speed?: number; // seconds for one full scroll
}

export default function NewsTicker({ 
  messages = [
    '🎉 Well done to Dave Johnson who just won £50 in Week 8!',
    '🏆 New season starts Saturday — get your predictions in!',
    '⚽ Arsenal vs Liverpool this weekend — who you got?',
  ],
  speed = 30 
}: NewsTickerProps) {
  // Duplicate messages for seamless loop
  const allMessages = [...messages, ...messages];

  return (
    <div className="w-full bg-[#0a0f1c] border-b border-white/10 overflow-hidden relative z-40">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0f1c] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0f1c] to-transparent z-10 pointer-events-none" />
      
      {/* Live indicator */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 z-20 bg-[#0a0f1c]">
        <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-red-500">LIVE</span>
        </span>
      </div>

      {/* Scrolling text */}
      <div className="flex items-center h-9 pl-20 overflow-hidden">
        <div 
          className="flex items-center gap-16 whitespace-nowrap animate-marquee"
          style={{ 
            animationDuration: `${speed}s`,
          }}
        >
          {allMessages.map((msg, i) => (
            <span 
              key={i} 
              className="text-sm text-white/90 font-medium flex items-center gap-2 shrink-0"
            >
              <span className="w-1 h-1 rounded-full bg-primary/60" />
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
