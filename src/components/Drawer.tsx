'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'right' | 'bottom';
  className?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className,
}: DrawerProps) {
  const isRight = position === 'right';

  const motionProps = isRight
    ? {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
      }
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className={cn('absolute inset-y-0 flex max-w-full', isRight ? 'right-0 pl-10' : 'bottom-0 w-full h-[80vh]')}>
            <motion.div
              {...motionProps}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'w-screen bg-gameCard border-white/5 shadow-2xl flex flex-col',
                isRight ? 'max-w-md border-l h-full' : 'w-full border-t h-full rounded-t-2xl',
                className
              )}
            >
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                {title && <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
