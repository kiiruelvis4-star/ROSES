/**
 * Little Roses Academy - Splash 1
 * 
 * SPEC RULE 2:
 * "Splash 1 (school photo background with a light navy tint, logo fades in, about 2.5s)"
 * 
 * USER INSTRUCTION:
 * Manual background photo upload support: allows uploading the exact background photo manually
 * without getting cut off by the auto-timer.
 */

import React, { useEffect, useState, useRef } from 'react';
import defaultCampusPhoto from '../assets/images/little_roses_campus_1790246122159.jpg';
import { Logo } from './Logo.tsx';
import { dataLayer, subscribeToDataLayer } from '../services/dataLayer.ts';
import { Image as ImageIcon, Camera, UploadCloud, ChevronRight } from 'lucide-react';
import { PhotoUploadModal } from './PhotoUploadModal.tsx';

interface Splash1Props {
  onComplete?: () => void;
}

export const Splash1: React.FC<Splash1Props> = ({ onComplete }) => {
  const [logoOpacity, setLogoOpacity] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'background' | 'logo'>('background');
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const [campusPhoto, setCampusPhoto] = useState<string>(
    dataLayer.getAttachedCampusPhoto() || defaultCampusPhoto
  );

  const directBgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToDataLayer(() => {
      const custom = dataLayer.getAttachedCampusPhoto();
      setCampusPhoto(custom || defaultCampusPhoto);
    });
  }, []);

  useEffect(() => {
    // Fade in logo shortly after mount
    const fadeTimer = setTimeout(() => {
      setLogoOpacity(true);
    }, 200);

    return () => clearTimeout(fadeTimer);
  }, []);

  // Auto proceed after 3.2s ONLY if user is not uploading or modal is not open
  useEffect(() => {
    if (isTimerPaused || isModalOpen) return;

    const proceedTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3200);

    return () => clearTimeout(proceedTimer);
  }, [isTimerPaused, isModalOpen, onComplete]);

  const handleDirectBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          dataLayer.setAttachedCampusPhoto(result);
          setCampusPhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      onClick={() => {
        if (!isModalOpen) {
          if (onComplete) onComplete();
        }
      }}
      className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden cursor-pointer select-none bg-[#070D1E]"
      title="Tap anywhere to continue to Splash 2"
    >
      {/* Hidden file input for fast one-tap upload */}
      <input
        ref={directBgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDirectBgUpload}
        onClick={(e) => e.stopPropagation()}
      />

      {/* School Campus Photo Background */}
      <img
        src={campusPhoto}
        alt="Little Roses Academy Nakuru Campus"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95"
      />

      {/* Light Navy Tint Overlay */}
      <div className="absolute inset-0 bg-[#070D1E]/70 backdrop-blur-[1px]" />

      {/* Top Bar with Manual Background Upload Button */}
      <div
        className="relative z-20 w-full flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
          Little Roses Academy
        </span>

        <div className="flex items-center gap-2">
          {/* Direct One-Tap Add Background button */}
          <button
            onClick={() => {
              setIsTimerPaused(true);
              directBgInputRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-xl transition active:scale-95 border border-amber-300"
            title="Upload exact background image directly"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Add Background Photo</span>
          </button>

          {/* More Photo Options Modal */}
          <button
            onClick={() => {
              setIsTimerPaused(true);
              setModalInitialTab('background');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold shadow transition active:scale-95"
            title="Open Photo Manager"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Options</span>
          </button>
        </div>
      </div>

      {/* Centered School Logo fading in */}
      <div
        className={`relative z-10 my-auto transition-all duration-1000 transform ${
          logoOpacity ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <Logo size="xl" showTagline={true} />
      </div>

      {/* Bottom Bar: Location + Manual Skip / Continue button */}
      <div
        className="relative z-20 w-full flex items-center justify-between text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] tracking-widest text-slate-300 font-bold opacity-90 uppercase">
          Nakuru, Kenya
        </div>

        <button
          onClick={() => {
            if (onComplete) onComplete();
          }}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 text-[11px] font-bold border border-slate-700/80 transition active:scale-95"
        >
          <span>Continue</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Manual Photo Modal */}
      <PhotoUploadModal
        isOpen={isModalOpen}
        initialTab={modalInitialTab}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
