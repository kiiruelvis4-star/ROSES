import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Check,
  X,
  Play,
  Clock,
  Eye,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { dataLayer, SchoolProfileRecord } from '../services/dataLayer.ts';

interface SplashCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewSplashFlow: () => void;
}

export function SplashCustomizerModal({
  isOpen,
  onClose,
  onPreviewSplashFlow,
}: SplashCustomizerModalProps) {
  const currentProfile = dataLayer.getSchoolProfile();

  const [splash1Url, setSplash1Url] = useState<string>(
    currentProfile.splash1ImageUrl || '/src/assets/images/splash1_official_crest_1792069867802.jpg'
  );
  const [splash2Url, setSplash2Url] = useState<string>(
    currentProfile.splash2ImageUrl || '/src/assets/images/splash2_learner_desk_1791992488500.jpg'
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(
    currentProfile.splash1DurationSeconds || 5
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'splash1' | 'splash2'>('splash1');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetSplash: 'splash1' | 'splash2'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (targetSplash === 'splash1') {
          setSplash1Url(result);
          showToast('New image loaded for Splash 1. Click "Save & Apply" to persist.');
        } else {
          setSplash2Url(result);
          showToast('New image loaded for Splash 2. Click "Save & Apply" to persist.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = (targetSplash: 'splash1' | 'splash2') => {
    if (targetSplash === 'splash1') {
      setSplash1Url('/src/assets/images/splash1_official_crest_1792069867802.jpg');
      showToast('Splash 1 restored to official Little Roses Academy campus photo.');
    } else {
      setSplash2Url('/src/assets/images/splash2_learner_desk_1791992488500.jpg');
      showToast('Splash 2 restored to official Little Roses Academy learner study photo.');
    }
  };

  const handleSave = (andPreview = false) => {
    const defaultS1 = '/src/assets/images/splash1_official_crest_1792069867802.jpg';
    const defaultS2 = '/src/assets/images/splash2_learner_desk_1791992488500.jpg';

    dataLayer.saveSchoolProfile({
      splash1ImageUrl: splash1Url === defaultS1 ? null : splash1Url,
      splash2ImageUrl: splash2Url === defaultS2 ? null : splash2Url,
      splash1DurationSeconds: durationSeconds,
    });

    showToast('Splash configuration successfully saved!');
    if (andPreview) {
      onClose();
      onPreviewSplashFlow();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Customise Splash Screens
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Splash 1 & 2
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload custom photos or keep the official Little Roses Academy campus crest
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast feedback */}
        {toastMessage && (
          <div className="px-6 py-2.5 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-white">Splash 1 Rule: </span>
              Shows only the pure image for exactly {durationSeconds} seconds with no &quot;tap to continue&quot; or skip overlays, exactly as configured.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* SPLASH 1 CONFIGURATION CARD */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-white">First Splash Screen</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetToDefault('splash1')}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Campus Crest
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative aspect-[9/16] w-full max-w-[200px] mx-auto rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-lg group">
                <img
                  src={splash1Url}
                  alt="Splash 1 Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setSplash1Url('/src/assets/images/splash1_campus_crest_1790668349675.jpg')}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-amber-300 border border-amber-400/30">
                  {durationSeconds}s Duration
                </div>
                <div className="absolute bottom-2 inset-x-2 text-center text-[10px] bg-black/80 backdrop-blur-sm text-slate-300 rounded py-1 border border-slate-700">
                  No tap / skip labels
                </div>
              </div>

              {/* Upload Controls for Splash 1 */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Upload Custom Splash 1 Photo
                </label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400/50 cursor-pointer text-xs font-semibold text-white transition-all">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'splash1')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Splash 1 Duration Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Splash 1 Duration:
                  </span>
                  <span className="font-bold text-amber-400 font-mono">{durationSeconds} seconds</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10) || 5)}
                  className="w-full h-2 rounded-lg bg-slate-800 accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2s (Quick)</span>
                  <span className="text-amber-400 font-semibold">5s (Standard)</span>
                  <span>10s (Long)</span>
                </div>
              </div>
            </div>

            {/* SPLASH 2 CONFIGURATION CARD */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-white">Second Splash Screen</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetToDefault('splash2')}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Learner Desk
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative aspect-[9/16] w-full max-w-[200px] mx-auto rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-lg group">
                <img
                  src={splash2Url}
                  alt="Splash 2 Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setSplash2Url('/src/assets/images/splash2_learner_desk_1791992488500.jpg')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-3 text-center">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    CBC READINESS
                  </span>
                  <span className="text-[9px] text-slate-300 font-mono">
                    System Readiness Bar
                  </span>
                </div>
              </div>

              {/* Upload Controls for Splash 2 */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Upload Custom Splash 2 Photo
                </label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-400/50 cursor-pointer text-xs font-semibold text-white transition-all">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'splash2')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preset Choice */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-slate-400 block pb-2">
                  Quick Academy Presets:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSplash2Url('/src/assets/images/little_roses_campus_1790246122159.jpg');
                      showToast('Selected: Little Roses Campus Grounds for Splash 2');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-left border border-slate-700 truncate"
                  >
                    🏫 Campus Grounds
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSplash2Url('/src/assets/images/splash2_learner_desk_1791992488500.jpg');
                      showToast('Selected: Learner Study Desk for Splash 2');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-left border border-slate-700 truncate"
                  >
                    📚 Learner Study
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800/80 bg-slate-950/80">
          <button
            type="button"
            onClick={() => {
              handleResetToDefault('splash1');
              handleResetToDefault('splash2');
              setDurationSeconds(5);
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Both to Official Defaults
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Save & Play Splash Flow
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
