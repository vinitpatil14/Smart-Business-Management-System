import React from 'react';

const BrandLogo = ({ size = 'md', showText = true, className = '' }) => {
  // Dimension mappings
  const dimensions = {
    sm: { icon: 32, rx: 9, stroke: 2.8, pulseStroke: 2.5, dotR: 2, textSize: 'text-base', tagSize: 'text-[8px]', gap: 'gap-2' },
    md: { icon: 40, rx: 11, stroke: 3.5, pulseStroke: 3.2, dotR: 2.5, textSize: 'text-lg', tagSize: 'text-[9px]', gap: 'gap-2.5' },
    lg: { icon: 48, rx: 14, stroke: 4.2, pulseStroke: 3.8, dotR: 3, textSize: 'text-2xl', tagSize: 'text-[10px]', gap: 'gap-3' },
    xl: { icon: 60, rx: 18, stroke: 5.2, pulseStroke: 4.5, dotR: 3.5, textSize: 'text-3xl', tagSize: 'text-[11px]', gap: 'gap-3.5' }
  }[size] || { icon: 40, rx: 11, stroke: 3.5, pulseStroke: 3.2, dotR: 2.5, textSize: 'text-lg', tagSize: 'text-[9px]', gap: 'gap-2.5' };

  return (
    <div className={`inline-flex items-center ${dimensions.gap} select-none ${className}`}>
      {/* Emblem SVG Icon */}
      <div
        className="relative flex-shrink-0 transition-transform duration-200 hover:scale-105"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id={`np-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="55%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id={`np-glow-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Squircle Background with gradient */}
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            fill={`url(#np-grad-${size})`}
          />

          {/* Inner Highlight border */}
          <rect
            x="4.75"
            y="4.75"
            width="54.5"
            height="54.5"
            rx="15.25"
            stroke="white"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />

          {/* Left Vertical Line of 'N' */}
          <path
            d="M19 45V19"
            stroke="white"
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
          />

          {/* Dynamic Telemetry Pulse Diagonal */}
          <path
            d="M19 19L27 34L32 23L37 40L45 19"
            stroke={`url(#np-glow-${size})`}
            strokeWidth={dimensions.pulseStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Vertical Line of 'N' */}
          <path
            d="M45 19V45"
            stroke="white"
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
          />

          {/* Telemetry Peak Dot */}
          <circle
            cx="32"
            cy="23"
            r={dimensions.dotR}
            fill="#38bdf8"
            stroke="white"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Wordmark Text */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${dimensions.textSize} text-slate-900 dark:text-white`}>
              Nex
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                Pulse
              </span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              OS
            </span>
          </div>
          <span className={`font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-0.5 ${dimensions.tagSize}`}>
            Business Intelligence & POS
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
