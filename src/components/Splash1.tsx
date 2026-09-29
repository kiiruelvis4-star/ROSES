/**
 * Little Roses Academy - Splash 1
 * 
 * Clean full-screen splash image maintaining 100% original brightness and quality.
 * Loads your custom uploaded splash image from IndexedDB / data storage.
 * All upload buttons and overlay controls removed per user request.
 * Tap anywhere or wait 2.5s to proceed to Splash 2.
 */

import React, { useEffect, useState } from 'react';
import defaultCampusPhoto from '../assets/images/splash1_campus_crest_1790668349675.jpg';
import { loadCustomSplashImage } from '../services/imageStorage.ts';
import { dataLayer, subscribeToDataLayer } from '../services/dataLayer.ts';

interface Splash1Props {
  onComplete?: () => void;
}

export const Splash1: React.FC<Splash1Props> = ({ onComplete }) => {
  const [splashPhoto, setSplashPhoto] = useState<string>(() => {
    return dataLayer.getAttachedCampusPhoto() || defaultCampusPhoto;
  });

  // Load custom image on mount: Check IndexedDB first, then dataLayer, then default
  useEffect(() => {
    let isMounted = true;
    loadCustomSplashImage('splash1_bg').then((cached) => {
      if (isMounted && cached) {
        setSplashPhoto(cached);
      } else {
        const custom = dataLayer.getAttachedCampusPhoto();
        if (isMounted && custom) {
          setSplashPhoto(custom);
        }
      }
    });

    const unsub = subscribeToDataLayer(() => {
      const custom = dataLayer.getAttachedCampusPhoto();
      if (custom) {
        setSplashPhoto(custom);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Auto proceed after 2.5s
  useEffect(() => {
    const proceedTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);

    return () => clearTimeout(proceedTimer);
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        if (onComplete) onComplete();
      }}
      className="relative flex-1 w-full h-full min-h-full overflow-hidden select-none bg-black cursor-pointer"
      title="Tap anywhere to continue to Splash 2"
    >
      {/* 100% Full Brightness Splash Image - completely clean and unobstructed */}
      <img
        src={splashPhoto}
        alt="Little Roses Academy"
        className="w-full h-full object-cover object-center pointer-events-none"
      />
    </div>
  );
};
