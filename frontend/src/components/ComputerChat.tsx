'use client';

import { useEffect, useRef, useState } from 'react';

interface ComputerChatProps {
  messages: string[];
  maxVisible?: number;
}

export function ComputerChat({ messages, maxVisible = 4 }: ComputerChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [animatingIndex, setAnimatingIndex] = useState<number>(-1);

  const visibleMessages = messages.slice(-maxVisible);

  useEffect(() => {
    // Animate the newest message
    setAnimatingIndex(visibleMessages.length - 1);
  }, [messages, visibleMessages.length]);

  useEffect(() => {
    // Auto-scroll to the latest message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
          🤖
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-300">ChessMaster-3000</span>
      </div>

      {/* Messages Container */}
      <div
        ref={scrollRef}
        className="space-y-2 max-h-48 overflow-y-auto"
      >
        {visibleMessages.map((msg, idx) => {
          const isNewest = idx === animatingIndex;
          return (
            <div
              key={`${messages.length}-${idx}`}
              className={`bg-slate-800 rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-200 leading-relaxed transition-all duration-300 ${
                isNewest ? 'opacity-100 translate-y-0' : 'opacity-100'
              }`}
              style={
                isNewest
                  ? {
                      opacity: 0,
                      transform: 'translateY(8px)',
                      animation: 'fadeInUp 0.3s ease-out forwards',
                    }
                  : undefined
              }
            >
              {msg}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
