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
      className={`w-full bg-[#080E24] border-t border-slate-800 px-2 py-1.5 flex items-center justify-around z-40 select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
              isActive
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
