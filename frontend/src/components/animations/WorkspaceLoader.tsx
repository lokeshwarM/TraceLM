'use client';
import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

export function WorkspaceLoader() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    anime({
      targets: '.loader-ring',
      rotate: 360,
      duration: 2000,
      easing: 'linear',
      loop: true,
    });

    anime({
      targets: '.loader-core',
      scale: [0.8, 1.2],
      opacity: [0.5, 1],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 1000,
    });
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="absolute w-full h-full loader-ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="4" strokeDasharray="141.37" strokeLinecap="round" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #ffffff)" />
              <stop offset="100%" stopColor="var(--color-muted, #71717a)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="w-6 h-6 bg-primary rounded-full loader-core shadow-[0_0_15px_var(--color-primary-glow)]" />
      </div>
      <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase animate-pulse">
        Verifying Workspace
      </p>
    </div>
  );
}
