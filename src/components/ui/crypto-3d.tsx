import React from "react";

type Props = {
  asset: string;
  size?: number;
  className?: string;
};

export default function Crypto3D({ asset, size = 28, className = "" }: Props) {
  const common = { width: size, height: size };

  switch (asset) {
    case "SOL":
      return (
        <svg {...common} viewBox="0 0 256 256" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="solG" x1="0" x2="1">
              <stop offset="0" stopColor="#00FFA3" />
              <stop offset="1" stopColor="#DC1FFF" />
            </linearGradient>
            <filter id="drop" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#drop)">
            <rect x="10" y="40" rx="32" width="236" height="120" fill="url(#solG)" opacity="0.95" transform="rotate(-18 128 100)" />
            <path d="M40 130 L128 46 L216 130" fill="none" stroke="#fff" strokeWidth="8" strokeOpacity="0.9" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,-6)" />
            <path d="M72 130 L128 84 L184 130" fill="none" stroke="#fff" strokeWidth="6" strokeOpacity="0.9" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      );

    case "ETH":
      return (
        <svg {...common} viewBox="0 0 256 256" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ethG" x1="0" x2="1">
              <stop offset="0" stopColor="#8CC0FF" />
              <stop offset="1" stopColor="#4B6BFF" />
            </linearGradient>
            <filter id="d2" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.28" />
            </filter>
          </defs>
          <g filter="url(#d2)">
            <polygon points="128,24 216,128 128,176 40,128" fill="url(#ethG)" stroke="#fff" strokeOpacity="0.06" strokeWidth="2" />
            <path d="M128 24 L128 176" stroke="#fff" strokeOpacity="0.9" strokeWidth="3" />
            <path d="M40 128 L128 176 L216 128" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
          </g>
        </svg>
      );

    case "ATOM":
      return (
        <svg {...common} viewBox="0 0 256 256" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="atomG" cx="30%" cy="30%">
              <stop offset="0" stopColor="#9FF" />
              <stop offset="1" stopColor="#0AB" />
            </radialGradient>
            <filter id="d3" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#000" floodOpacity="0.28" />
            </filter>
          </defs>
          <g filter="url(#d3)">
            <circle cx="128" cy="128" r="72" fill="url(#atomG)" />
            <circle cx="128" cy="128" r="72" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="4" />
            <path d="M128 68 L128 188" stroke="#fff" strokeWidth="4" strokeOpacity="0.95" />
            <path d="M88 108 L168 148" stroke="#fff" strokeWidth="3" strokeOpacity="0.9" />
          </g>
        </svg>
      );

    case "DOT":
      return (
        <svg {...common} viewBox="0 0 256 256" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dotG" x1="0" x2="1">
              <stop offset="0" stopColor="#FFD27D" />
              <stop offset="1" stopColor="#FF6B9A" />
            </linearGradient>
            <filter id="d4" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000" floodOpacity="0.28" />
            </filter>
          </defs>
          <g filter="url(#d4)">
            <circle cx="128" cy="128" r="64" fill="url(#dotG)" />
            <circle cx="128" cy="128" r="64" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="3" />
            <circle cx="128" cy="128" r="10" fill="#fff" />
          </g>
        </svg>
      );

    default:
      return (
        <svg {...common} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
      );
  }
}
