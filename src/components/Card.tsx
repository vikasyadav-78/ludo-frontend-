'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  glow = false,
  hoverEffect = true,
  onClick,
}: CardProps) {
  const Component = onClick ? motion.div : 'div';

  const cardStyles = cn(
    'rounded-xl border border-white/5 bg-gameCard/60 backdrop-blur-md overflow-hidden p-5',
    glow && 'border-gameAccent/20 shadow-[0_0_15px_rgba(0,229,255,0.05)]',
    hoverEffect && 'hover:border-white/10 hover:shadow-lg transition-all duration-200',
    onClick && 'cursor-pointer',
    className
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={onClick}
        className={cardStyles}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={cardStyles}>{children}</div>;
}
