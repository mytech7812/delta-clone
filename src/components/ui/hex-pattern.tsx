import React from "react";

type HexPatternProps = {
  className?: string;
  opacity?: number;
};

export default function HexPattern({ className = "", opacity = 0.06 }: HexPatternProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ display: "block", opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hexPattern" patternUnits="userSpaceOnUse" width="20" height="17.32">
            <path d="M10 0 L20 5 L20 12.32 L10 17.32 L0 12.32 L0 5 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexPattern)" />
      </svg>
    </div>
  );
}
