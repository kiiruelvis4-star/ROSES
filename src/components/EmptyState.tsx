/**
 * Little Roses Academy - Clean Empty State Component
 * 
 * SPECIFICATION RULE:
 * "The application must be able to show EMPTY STATES where data does not yet exist.
 * Do not invent demo school records.
 * Do not generate fake statistics."
 */

import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  badge?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionText,
  onAction,
  badge = 'Phase 0 Foundation',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 border border-amber-500/20 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>

      {badge && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2.5 py-0.5 rounded-full mb-2">
          {badge}
        </span>
      )}

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">{title}</h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-4">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold shadow-sm hover:opacity-90 active:scale-98 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
