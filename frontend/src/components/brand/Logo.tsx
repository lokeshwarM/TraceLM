import React from 'react';

interface LogoProps {
  size?: string;
  iconSize?: string;
}

export default function LogoBadge({ size = 'w-8 h-8', iconSize = 'w-4.5 h-4.5' }: LogoProps) {
  return (
    <div className={`${size} rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-background shadow-[0_2px_8px_var(--primary-glow)] transition-transform group-hover:scale-105 shrink-0`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={iconSize}
      >
        {/* Visor / Goggles lenses */}
        <circle cx="8.5" cy="12" r="3" />
        <circle cx="15.5" cy="12" r="3" />
        {/* Bridge connection */}
        <path d="M11.5 12h1" />
        {/* Trace lines representing strap & radar sweeps */}
        <path d="M5.5 12H3.5M20.5 12h-2" />
        <path d="M12 6.5A5.5 5.5 0 0117.5 12M12 17.5A5.5 5.5 0 016.5 12" strokeWidth="1.5" strokeDasharray="2.5 1.5" />
      </svg>
    </div>
  );
}
