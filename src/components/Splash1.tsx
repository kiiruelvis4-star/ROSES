import React, { useEffect, useState } from 'react';
import { dataLayer } from '../services/dataLayer.ts';

interface Splash1Props {
  onComplete: () => void;
}

export function Splash1({ onComplete }: Splash1Props) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    const profile = dataLayer.getSchoolProfile();
    return profile.splash1ImageUrl || '/src/assets/images/splash1_official_crest_1792069867802.jpg';
  });

  const durationSeconds = (() => {
    const profile = dataLayer.getSchoolProfile();
    return typeof profile.splash1DurationSeconds === 'number' && profile.splash1DurationSeconds > 0
      ? profile.splash1DurationSeconds
      : 5;
  })();

  useEffect(() => {
    // Stays for exactly 5 seconds (or user-configured duration) with no tap/skip controls
    const timer = setTimeout(() => {
      onComplete();
    }, durationSeconds * 1000);

    return () => clearTimeout(timer);
  }, [onComplete, durationSeconds]);

  return (
    <div
      data-splash="true"
      className="relative w-full h-full flex-1 flex flex-col items-center justify-center select-none bg-[#070D1E] overflow-hidden"
      aria-label="Little Roses Academy Campus and Crest"
    >
      {/* 
        Official school photo displayed 100% pure exactly as it is:
        - No dark scrim or gradient darkening the photo
        - No overlaid logo or text duplicates
        - No 'Tap anywhere to continue' or skip affordances
        - Full natural brilliance, edge-to-edge
      */}
      <img
        src={imgSrc}
        alt="Little Roses Academy Nakuru - Much From Little"
        className="w-full h-full object-cover object-center max-w-full max-h-full transition-opacity duration-300"
        referrerPolicy="no-referrer"
        onError={() => {
          // Fallback if custom image fails to load
          if (imgSrc !== '/src/assets/images/splash1_campus_crest_1790668349675.jpg') {
            setImgSrc('/src/assets/images/splash1_campus_crest_1790668349675.jpg');
          }
        }}
      />
    </div>
  );
}
