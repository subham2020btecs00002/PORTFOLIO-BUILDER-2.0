import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 32,
  className = '',
  showText = false,
}) => {
  return (
    <div
      className={`app-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        userSelect: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          filter: 'drop-shadow(0 4px 10px rgba(99, 102, 241, 0.35))',
        }}
      >
        <defs>
          <linearGradient id="pbCompLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="pbCompGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="pbCompAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* Outer Gradient Squircle */}
        <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#pbCompLogoGrad)" />
        <rect
          x="34"
          y="34"
          width="444"
          height="444"
          rx="110"
          fill="none"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="4"
        />

        {/* Core Dark Container */}
        <rect x="64" y="64" width="384" height="384" rx="88" fill="#0f172a" fillOpacity="0.92" />
        <rect
          x="64"
          y="64"
          width="384"
          height="384"
          rx="88"
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="2"
        />

        {/* Left Code Bracket < */}
        <path
          d="M 190 175 L 125 256 L 190 337"
          stroke="url(#pbCompGlowGrad)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Code Bracket > */}
        <path
          d="M 322 175 L 387 256 L 322 337"
          stroke="url(#pbCompGlowGrad)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Dynamic Slash / */}
        <path d="M 285 170 L 227 342" stroke="#ffffff" strokeWidth="30" strokeLinecap="round" />

        {/* Radiant Accent Spark (2.0 Node) */}
        <circle cx="345" cy="165" r="21" fill="url(#pbCompAccentGrad)" />
        <circle cx="345" cy="165" r="8" fill="#ffffff" />
      </svg>

      {showText && (
        <span
          style={{
            fontWeight: 800,
            fontSize: `${size * 0.58}px`,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          PortfolioBuilder <span style={{ color: '#06b6d4', fontSize: '0.7em' }}>2.0</span>
        </span>
      )}
    </div>
  );
};

export default AppLogo;
