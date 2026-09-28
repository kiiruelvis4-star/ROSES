/**
 * Little Roses Academy - Shared Mobile Bottom Tabs
 * 
 * SPEC RULE 5: "Every tab is a full screen. Clean and uncluttered; secondary tools go in menus or drawers."
 */

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface BottomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  accentColor?: string;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  accentColor = '#F59E0B', // Default warm amber
}) => {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="sticky bottom-0 z-40 w-full bg-[#070D1E]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 shadow-lg flex-shrink-0"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
                isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ color: isActive ? accentColor : undefined }}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="w-4 h-0.5 rounded-full mt-0.5"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
