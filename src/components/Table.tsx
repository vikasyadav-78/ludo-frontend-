'use client';

import React from 'react';
import { cn } from '@/utils';

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
}

export default function Table<T>({ columns, data, className, emptyMessage = 'No data available' }: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-white/5 bg-gameCard/40', className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            {columns.map((col, idx) => (
              <th key={idx} className={cn('px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-white/[0.01] transition-colors duration-150">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn('px-6 py-4 text-sm text-gray-300 font-medium', col.className)}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
