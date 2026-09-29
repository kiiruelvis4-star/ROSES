/**
 * Little Roses Academy - Splash Screens & Theme Customizer
 * 
 * Allows the user to customize:
 * 1. Splash 1: Background Campus Photo & School Crest Logo
 * 2. Splash 2: Loading Screen Background, Crest & Subtitle
 * 3. Splash 3 (Portal Selection): Header branding & Theme
 */

import React, { useState, useRef } from 'react';
import defaultCampusPhoto from '../assets/images/splash1_campus_crest_1790668349675.jpg';
import { Logo } from './Logo.tsx';
import { dataLayer } from '../services/dataLayer.ts';
import {
  X,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Palette,
  Sparkles,
  Layers,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface SplashCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'splash1' | 'splash2' | 'splash3';
}

export const SplashCustomizerModal: React.FC<SplashCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'splash1',
}) => {
  const [activeTab, setActiveTab] = useState<'splash1' | 'splash2' | 'splash3'>(initialTab);
  const [campusPhoto, setCampusPhoto] = useState<string>(
    dataLayer.getAttachedCampusPhoto() || defaultCampusPhoto
  );
  const [customLogo, setCustomLogo] = useState<string | null>(dataLayer.getAttachedLogo());
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showSavedMessage = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          dataLayer.setAttachedCampusPhoto(result);
          setCampusPhoto(result);
          showSavedMessage('Splash 1 background photo updated successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          dataLayer.setAttachedLogo(result);
          setCustomLogo(result);
          showSavedMessage('School crest logo updated across all screens!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBg = () => {
    dataLayer.resetAttachedCampusPhoto();
    setCampusPhoto(defaultCampusPhoto);
    showSavedMessage('Reset to official Little Roses Academy campus photo');
  };

  const handleResetLogo = () => {
    dataLayer.resetAttachedLogo();
    setCustomLogo(null);
    showSavedMessage('Reset to official Little Roses Academy vector crest');
  };

  const handleResetAll = () => {
    dataLayer.resetAttachedCampusPhoto();
    dataLayer.resetAttachedLogo();
    setCampusPhoto(defaultCampusPhoto);
    setCustomLogo(null);
    showSavedMessage('All splash screens restored to original factory defaults!');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Customize Splash Screens
              </h2>
              <p className="text-xs text-slate-400">
                Change photos, school crest & appearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Toast */}
        {savedNotice && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-emerald-950/90 border border-emerald-600/60 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('splash1')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'splash1'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Splash 1 (Campus)
          </button>
          <button
            onClick={() => setActiveTab('splash2')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'splash2'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Splash 2 (Loading)
          </button>
          <button
            onClick={() => setActiveTab('splash3')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'splash3'
                ? 'border-amber-400 text-amber-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Portals Screen
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: SPLASH 1 */}
          {activeTab === 'splash1' && (
            <div className="space-y-5">
              {/* Background Photo Section */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-100">
                      Background Photo (Campus)
                    </span>
                  </div>
                  {dataLayer.getAttachedCampusPhoto() ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold">
                      Custom Active
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold">
                      Official Campus Photo
                    </span>
                  )}
                </div>

                {/* Preview Thumbnail */}
                <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                  <img
                    src={campusPhoto}
                    alt="Campus Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] text-slate-200 font-medium tracking-wide">
                      Little Roses Academy Nakuru
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBgUpload}
                  />
                  <button
                    onClick={() => bgFileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Photo</span>
                  </button>

                  {dataLayer.getAttachedCampusPhoto() && (
                    <button
                      onClick={handleResetBg}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition cursor-pointer"
                      title="Reset to default campus photo"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* School Crest Logo Section */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-slate-100">
                      Center School Crest (Logo)
                    </span>
                  </div>
                  {customLogo ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold">
                      Custom Logo Active
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold">
                      Official Vector Crest
                    </span>
                  )}
                </div>

                {/* Crest Preview */}
                <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-700 bg-[#070D1E] flex items-center justify-center p-2">
                  <div className="transform scale-75">
                    <Logo size="lg" showTagline={true} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <button
                    onClick={() => logoFileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Crest Photo</span>
                  </button>

                  {customLogo && (
                    <button
                      onClick={handleResetLogo}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition cursor-pointer"
                      title="Reset to official vector crest"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPLASH 2 */}
          {activeTab === 'splash2' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <span className="text-sm font-bold text-slate-100 block">
                  Splash 2: 0-100% System Loading Screen
                </span>
                <p className="text-xs text-slate-400">
                  Splash 2 features the central school crest with the gold-accented progress bar.
                </p>

                {/* Preview Mini */}
                <div className="p-4 rounded-xl bg-[#070D1E] border border-slate-700/80 flex flex-col items-center justify-center space-y-3">
                  <div className="transform scale-90">
                    <Logo size="md" showTagline={true} />
                  </div>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full w-3/4 bg-amber-400 rounded-full" />
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    Loading School System 75%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPLASH 3 / PORTAL SELECTION */}
          {activeTab === 'splash3' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <span className="text-sm font-bold text-slate-100 block">
                  Portal Selection (Opening Dashboard)
                </span>
                <p className="text-xs text-slate-400">
                  Includes the four main portals: School Administration, Staff & Teachers, Parents & Guardians, and Learners.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                    🏛️ School Office
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                    🎓 Staff & Teachers
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold">
                    👨‍👩‍👧 Parents & Guardians
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
                    ✨ Learners Zone
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All to Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
