import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface BottomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  accentColor?: string;
  className?: string;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  className = '',
}) => {
  return (
    <nav
      aria-label="Bottom Navigation"
      className={`w-full bg-gradient-to-t from-[#060c1d] to-[#0a1638] border-t border-blue-950/80 px-2 sm:px-4 py-2 sm:py-2.5 flex items-center justify-around z-40 select-none shadow-[0_-8px_24px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div className="w-full max-w-lg mx-auto flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 sm:px-4 rounded-2xl transition-all duration-200 cursor-pointer relative min-w-[56px] min-h-[44px] ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.55)] scale-105 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-medium hover:bg-slate-800/40'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black border border-slate-900 shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

