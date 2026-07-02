import React from 'react';

interface DefaultAvatarProps {
  className?: string;
  size?: number;
}

export default function DefaultAvatar({ className = 'w-full h-full', size }: DefaultAvatarProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      width={size} 
      height={size} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill="url(#avatar-grad)" stroke="#00E5FF" strokeWidth="2" />
      {/* Helmet structure */}
      <path d="M50 20 L75 35 L70 65 L50 85 L30 65 L25 35 Z" fill="#1E1A3D" stroke="#9D4EDD" strokeWidth="2" />
      {/* Neon Visor */}
      <path d="M35 42 Q50 35 65 42 L60 52 Q50 48 40 52 Z" fill="#00E5FF" />
      {/* Accent Lines */}
      <path d="M50 20 L50 35" stroke="#00E5FF" strokeWidth="1.5" />
      <path d="M30 65 H70" stroke="#9D4EDD" strokeWidth="1" />
      {/* Gradients */}
      <defs>
        <radialGradient id="avatar-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2D0066" />
          <stop offset="100%" stopColor="#0B001F" />
        </radialGradient>
      </defs>
    </svg>
  );
}
