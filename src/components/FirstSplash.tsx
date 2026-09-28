/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CrestLogo } from './CrestLogo.tsx';

interface FirstSplashProps {
  mode?: 'phone' | 'tablet' | 'full';
}

export function FirstSplash({ mode = 'phone' }: FirstSplashProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lra_splash_image_1');
    if (saved) {
      setImageSrc(saved);
    }
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none pointer-events-none bg-[#070D1E]"
      style={{ backgroundColor: '#070D1E' }}
    >
      {/* Expanded ambient lighting for phone & tablet */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            mode === 'tablet'
              ? 'radial-gradient(ellipse at 50% 50%, #0e2246 0%, #070d1e 75%, #040812 100%)'
              : 'radial-gradient(ellipse at 50% 50%, #0d1b38 0%, #070d1e 72%, #040812 100%)',
        }}
      />

      {imageSrc ? (
        /* Expanded image view fitting both phone and tablet edge-to-edge - Non-editable */
        <div className="relative z-10 w-full h-full flex items-center justify-center select-none pointer-events-none">
          <img
            src={imageSrc}
            alt="Little Roses Academy Splash Screen 1"
            className="w-full h-full object-cover object-center select-none pointer-events-none"
          />
        </div>
      ) : (
        /* Permanent authentic crest expanded to fit phone or tablet naturally - Non-editable */
        <div
          className={`relative z-10 w-full h-full flex flex-col items-center justify-center select-none pointer-events-none ${
            mode === 'tablet' ? 'p-8 md:p-12' : 'p-6'
          }`}
        >
          <div
            className={`w-full flex items-center justify-center transition-all ${
              mode === 'tablet'
                ? 'max-w-[560px] md:max-w-[620px] aspect-[500/620]'
                : 'max-w-[320px] sm:max-w-[360px] aspect-[500/620]'
            }`}
          >
            <CrestLogo className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]" />
          </div>
        </div>
      )}
    </div>
  );
}
