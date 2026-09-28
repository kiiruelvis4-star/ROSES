/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

interface CircularBadgeLogoProps {
  className?: string;
}

export function CircularBadgeLogo({ className = 'w-44 h-44' }: CircularBadgeLogoProps) {
  const [installedLogo, setInstalledLogo] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lra_installed_school_logo');
    if (saved) {
      setInstalledLogo(saved);
    }
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {installedLogo ? (
        /* User installed photo logo */
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-400 bg-[#ECD8C0] shadow-sm">
          <img
            src={installedLogo}
            alt="Little Roses Academy Nakuru"
            className="w-full h-full object-cover rounded-full select-none pointer-events-none"
          />
        </div>
      ) : (
        /* Exact 1:1 Vector Replica of Little Roses Academy Nakuru */
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full select-none drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
              <path
                id="exactLraTopArc"
                d="M 68, 250 A 182, 182 0 0, 1 432, 250"
                fill="none"
              />
              <path
                id="exactLraBottomArc"
                d="M 85, 250 A 180, 180 0 0, 0 415, 250"
                fill="none"
              />
              <linearGradient id="exactCapBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#128CEC" />
                <stop offset="100%" stopColor="#0B6EC6" />
              </linearGradient>
              <linearGradient id="exactCapRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E23434" />
                <stop offset="100%" stopColor="#C41E1E" />
              </linearGradient>
              <linearGradient id="base3dLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#111E30" />
                <stop offset="100%" stopColor="#1E3352" />
              </linearGradient>
            </defs>

            {/* 1. Outer Solid Slate Navy Ring */}
            <circle cx="250" cy="250" r="242" fill="#2E486D" />

            {/* 2. Inner Parchment / Peach-Cream Disc */}
            <circle cx="250" cy="250" r="218" fill="#ECD8C0" />

            {/* 3. Top Arched Text: LITTLE ROSES ACADEMY */}
            <text
              fill="#111111"
              style={{
                fontFamily: "'Montserrat', -apple-system, sans-serif",
                fontWeight: 900,
                fontSize: '31px',
                letterSpacing: '0.07em',
              }}
            >
              <textPath href="#exactLraTopArc" startOffset="50%" textAnchor="middle">
                LITTLE ROSES ACADEMY
              </textPath>
            </text>

            {/* 4. Center City Text: NAKURU */}
            <g id="nakuru-group">
              <text
                x="250"
                y="146"
                textAnchor="middle"
                fill="#111111"
                style={{
                  fontFamily: "'Montserrat', -apple-system, sans-serif",
                  fontWeight: 900,
                  fontSize: '34px',
                  letterSpacing: '0.14em',
                }}
              >
                NAKURU
              </text>
              <path
                d="M 172, 154 L 328, 154 M 238, 158 L 250, 153 L 262, 158"
                stroke="#111111"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* 5. Central Heraldic Shield */}
            <g id="heraldic-shield" transform="translate(0, 4)">
              <path
                d="
                  M 172, 160
                  L 328, 160
                  L 328, 178
                  L 352, 178
                  L 344, 218
                  C 336, 302 250, 362 250, 362
                  C 250, 362 164, 302 156, 218
                  L 148, 178
                  L 172, 178
                  Z
                "
                fill="#FFFFFF"
                stroke="#2E486D"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <path
                d="
                  M 178, 166
                  L 322, 166
                  L 322, 184
                  L 344, 184
                  L 337, 220
                  C 330, 298 250, 354 250, 354
                  C 250, 354 170, 298 163, 220
                  L 156, 184
                  L 178, 184
                  Z
                "
                fill="#1D2E47"
              />
              <path
                d="
                  M 186, 174
                  L 314, 174
                  L 314, 190
                  L 332, 190
                  L 326, 220
                  C 320, 288 250, 342 250, 342
                  C 250, 342 180, 288 174, 220
                  L 168, 190
                  L 186, 190
                  Z
                "
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinejoin="round"
                opacity="0.9"
              />

              {/* 3D Mortarboard Cap */}
              <g id="graduation-cap" transform="translate(250, 252)">
                <path d="M -34, 10 L 0, 28 L 0, 72 L -34, 48 Z" fill="url(#base3dLeft)" />
                <path d="M 0, 28 L 34, 10 L 34, 48 L 0, 72 Z" fill="#14243B" />
                <path d="M 0, 28 L 34, 10 L 34, 32 L 0, 48 Z" fill="#D92828" />

                <polygon points="0,-48 -66,-10 0,26" fill="url(#exactCapBlue)" />
                <polygon points="0,-48 66,-10 0,26" fill="url(#exactCapRed)" />
                <line x1="0" y1="-48" x2="0" y2="26" stroke="#000000" strokeWidth="1.5" opacity="0.35" />

                <ellipse cx="0" cy="-11" rx="4.5" ry="3.5" fill="#3B82F6" />
                <path d="M 0,-11 C -24,-14 -56,-2 -60,18" fill="none" stroke="#5EB5F8" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="-60" cy="21" r="2.5" fill="#3B82F6" />
                <path d="M -62, 23 L -65, 54 Q -60, 56 -56, 54 L -58, 23 Z" fill="#38BDF8" />
              </g>
            </g>

            {/* Laurel Wreath */}
            <g stroke="#BA2828" fill="#BA2828" strokeLinecap="round">
              <path d="M 250, 370 C 205, 364 158, 324 152, 268 C 148, 234 153, 210 155, 196" fill="none" strokeWidth="3.2" />
              <path d="M 250, 370 C 295, 364 342, 324 348, 268 C 352, 234 347, 210 345, 196" fill="none" strokeWidth="3.2" />

              <path d="M 155, 198 C 145, 190 148, 178 156, 180 C 162, 182 160, 192 155, 198 Z" />
              <path d="M 152, 222 C 140, 214 142, 202 150, 204 C 156, 206 156, 216 152, 222 Z" />
              <path d="M 150, 248 C 136, 240 138, 228 146, 230 C 152, 232 154, 242 150, 248 Z" />
              <path d="M 152, 276 C 138, 268 140, 254 149, 258 C 156, 261 156, 270 152, 276 Z" />
              <path d="M 162, 304 C 148, 296 150, 282 160, 286 C 166, 290 166, 298 162, 304 Z" />
              <path d="M 178, 328 C 164, 320 168, 306 178, 310 C 184, 314 182, 322 178, 328 Z" />
              <path d="M 204, 348 C 190, 342 196, 326 206, 332 C 212, 336 208, 344 204, 348 Z" />
              <path d="M 234, 364 C 220, 360 224, 344 234, 350 C 240, 354 238, 360 234, 364 Z" />

              <path d="M 345, 198 C 355, 190 352, 178 344, 180 C 338, 182 340, 192 345, 198 Z" />
              <path d="M 348, 222 C 360, 214 358, 202 350, 204 C 344, 206 344, 216 348, 222 Z" />
              <path d="M 350, 248 C 364, 240 362, 228 354, 230 C 348, 232 346, 242 350, 248 Z" />
              <path d="M 348, 276 C 362, 268 360, 254 351, 258 C 344, 261 344, 270 348, 276 Z" />
              <path d="M 338, 304 C 352, 296 350, 282 340, 286 C 334, 290 334, 298 338, 304 Z" />
              <path d="M 322, 328 C 336, 320 332, 306 322, 310 C 316, 314 318, 322 322, 328 Z" />
              <path d="M 296, 348 C 310, 342 304, 326 294, 332 C 288, 336 292, 344 296, 348 Z" />
              <path d="M 266, 364 C 280, 360 276, 344 266, 350 C 260, 354 262, 360 266, 364 Z" />
            </g>

            {/* Bottom Arched Text */}
            <text
              fill="#111111"
              style={{
                fontFamily: "'Montserrat', -apple-system, sans-serif",
                fontWeight: 900,
                fontSize: '32px',
                letterSpacing: '0.08em',
              }}
            >
              <textPath href="#exactLraBottomArc" startOffset="50%" textAnchor="middle">
                MUCH FROM LITTLE
              </textPath>
            </text>
          </svg>
        )}
    </div>
  );
}
