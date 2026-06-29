'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <select
          className={cn(
            'w-full px-4 py-2.5 bg-gameCard/50 border border-white/5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gameAccent/50 transition-colors duration-200 appearance-none cursor-pointer',
            error && 'border-red-500/50 focus:border-red-500/50',
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-gameCard text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
