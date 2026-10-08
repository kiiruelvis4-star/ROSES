/**
 * Little Roses Academy - Universal Portal Slide-over Drawer (3-Line Menu)
 * Provides clean access to all portal navigation, excess tools, and operations
 * without crowding the primary viewport.
 */

import React from 'react';
import { X, ChevronRight, Sun, Moon, Laptop } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { dataLayer } from '../services/dataLayer.ts';

export interface DrawerNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  active?: boolean;
  onClick: () => void;
}

export interface DrawerToolItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  badge?: string;
  color?: string;
  onClick: () => void;
}

export interface PortalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  portalTitle: string;
  portalSubtitle?: string;
  userBadge?: string;
  userName?: string;
  navItems: DrawerNavItem[];
  toolItems?: DrawerToolItem[];
  footerActions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }>;
}

export const PortalDrawer: React.FC<PortalDrawerProps> = ({
  isOpen,
  onClose,
  portalTitle,
  portalSubtitle,
  userBadge,
  userName,
  navItems,
  toolItems = [],
  footerActions = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel (from left) */}
      <div className="relative w-full max-w-[320px] sm:max-w-sm bg-[#0B152E] text-white h-full flex flex-col shadow-2xl border-r border-slate-800 z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-[#070D1E]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size="xs" showTagline={false} />
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-amber-300">
                {portalTitle}
              </h2>
              {userName ? (
                <p className="text-xs text-slate-200 font-semibold">{userName}</p>
              ) : portalSubtitle ? (
                <p className="text-[11px] text-slate-400">{portalSubtitle}</p>
              ) : null}
              {userBadge && (
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold border border-amber-400/30">
                  {userBadge}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Main Views / Tabs */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
              Views & Dashboard
            </span>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    item.active
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Excess Tools & Actions */}
          {toolItems.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 block mb-1">
                More Portal Tools & Operations
              </span>
              <div className="space-y-1">
                {toolItems.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      tool.onClick();
                      onClose();
                    }}
                    className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800/80 transition-all cursor-pointer group"
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-amber-400 group-hover:border-amber-400/60 flex-shrink-0">
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                          {tool.label}
                        </span>
                        {tool.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      {tool.description && (
                        <p className="text-[10px] text-slate-400 truncate">
                          {tool.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Theme Selector (Applies app-wide, phone & tablet ready) */}
        <div className="px-3.5 py-2.5 border-t border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Display Theme
            </span>
            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
              {dataLayer.getAppearanceConfig().themeMode}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'Auto', icon: Laptop },
            ].map((t) => {
              const currentMode = dataLayer.getAppearanceConfig().themeMode;
              const isSel = currentMode === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    dataLayer.saveAppearanceConfig({ themeMode: t.id as any });
                  }}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                    isSel
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <t.icon className="w-3 h-3 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        {footerActions.length > 0 && (
          <div className="p-3 border-t border-slate-800/90 bg-[#070D1E]/90 space-y-1.5">
            {footerActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  action.danger
                    ? 'bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
