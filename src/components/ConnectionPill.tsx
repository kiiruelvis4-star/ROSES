/**
 * Little Roses Academy - Real Offline Connection Pill
 * SPEC RULE 3:
 * "The status pill 'Saved to Phone 💾' / 'Synced with School ☁️' must reflect the real connection
 * and real pending items, never a toggle button."
 */

import React, { useState, useEffect } from 'react';
import { dataLayer, subscribeToDataLayer } from '../services/dataLayer.ts';

export const ConnectionPill: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [status, setStatus] = useState(dataLayer.getSyncPillStatus());

  useEffect(() => {
    const update = () => setStatus(dataLayer.getSyncPillStatus());
    return subscribeToDataLayer(update);
  }, []);

  const isSynced = status.status === 'synced';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight border transition-colors ${
        isSynced
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      } ${className}`}
      title={status.details || status.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
      <span>{status.label}</span>
    </div>
  );
};
