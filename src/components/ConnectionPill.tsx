/**
 * Little Roses Academy - Real Connection Pill
 * 
 * SPEC RULE 3:
 * "The status pill 'Saved to Phone 💾' / 'Synced with School ☁️' must reflect the real connection
 * and real pending items, never a toggle button."
 */

import React, { useState, useEffect } from 'react';
import { dataLayer, subscribeToDataLayer } from '../services/dataLayer.ts';

interface ConnectionPillProps {
  className?: string;
}

export const ConnectionPill: React.FC<ConnectionPillProps> = ({ className = '' }) => {
  const [syncInfo, setSyncInfo] = useState(dataLayer.getSyncPillStatus());

  useEffect(() => {
    const update = () => {
      setSyncInfo(dataLayer.getSyncPillStatus());
    };
    update();
    return subscribeToDataLayer(update);
  }, []);

  const isSynced = syncInfo.status === 'synced';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-all ${
        isSynced
          ? 'bg-sky-950/80 text-sky-200 border-sky-600/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
          : 'bg-amber-950/80 text-amber-200 border-amber-600/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
      } ${className}`}
      title={isSynced ? 'All changes synced with school' : syncInfo.details || 'Stored locally on phone'}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isSynced ? 'bg-sky-400 animate-pulse' : 'bg-amber-400'
        }`}
      />
      <span>{syncInfo.label}</span>
      {syncInfo.details && !isSynced && (
        <span className="text-[9px] opacity-75 hidden sm:inline">({syncInfo.details})</span>
      )}
    </div>
  );
};
