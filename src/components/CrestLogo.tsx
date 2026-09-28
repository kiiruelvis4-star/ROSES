/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface CrestLogoProps {
  className?: string;
}

export function CrestLogo({ className = '' }: CrestLogoProps) {
  // Exact shield outer path matching IMG-20260924-WA4436.jpg
  const shieldOuterPath = `
    M 170, 175
    L 330, 175
    L 330, 194
    L 358, 194
    L 354, 234
    C 350, 342 298, 420 250, 456
    C 202, 420 150, 342 146, 234
    L 142, 194
    L 170, 194
    Z
  `;

  // Shield inner gold line path
  const shieldInnerPath = `
    M 176, 183
    L 324, 183
    L 324, 201
    L 348, 201
    L 345, 237
    C 341, 338 293, 413 250, 447
    C 207, 413 159, 338 155, 237
    L 152, 201
    L 176, 201
    Z
  `;

  // Shield vertical right-half shadow path
  const shieldRightHalfPath = `
    M 250, 183
    L 324, 183
    L 324, 201
    L 348, 201
    L 345, 237
    C 341, 338 293, 413 250, 447
    Z
  `;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 500 620"
        className="w-full h-full relative z-10"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Top text arc */}
          <path
            id="arcLRA"
            d="M 45, 175 A 220, 220 0 0, 1 455, 175"
            fill="none"
          />

          {/* Bottom text arc */}
          <path
            id="arcMFL"
            d="M 55, 492 A 225, 225 0 0, 0 445, 492"
            fill="none"
          />

          {/* Authentic Metallic Gold Gradient */}
          <linearGradient id="crestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A8" />
            <stop offset="25%" stopColor="#F7CE52" />
            <stop offset="65%" stopColor="#E5A823" />
            <stop offset="100%" stopColor="#FCD553" />
          </linearGradient>

          {/* Golden stem gradient */}
          <linearGradient id="stemGoldGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#D99B16" />
            <stop offset="50%" stopColor="#F7CD50" />
            <stop offset="100%" stopColor="#FFF2A8" />
          </linearGradient>

          {/* Deep Navy Shield Interior Fill */}
          <radialGradient id="shieldNavyGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#101F42" />
            <stop offset="60%" stopColor="#0A132B" />
            <stop offset="100%" stopColor="#060C1D" />
          </radialGradient>

          {/* Cap Blue Gradient */}
          <linearGradient id="capBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2575FC" />
            <stop offset="50%" stopColor="#1A68E8" />
            <stop offset="100%" stopColor="#104CB8" />
          </linearGradient>

          {/* Cap Red Gradient */}
          <linearGradient id="capRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3838" />
            <stop offset="50%" stopColor="#E02222" />
            <stop offset="100%" stopColor="#B01212" />
          </linearGradient>

          {/* Undercap base gradients */}
          <linearGradient id="capUnderBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1856C9" />
            <stop offset="100%" stopColor="#0B2F73" />
          </linearGradient>
          <linearGradient id="capUnderRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C91818" />
            <stop offset="100%" stopColor="#6E0909" />
          </linearGradient>

          {/* True Neon Golden Shield Halo Glow Filter */}
          <filter id="neonShieldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softWideHalo" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
          </filter>
        </defs>

        {/* ===================== SHIELD NEON GLOW CONTOUR ===================== */}
        {/* Soft wide golden background aura */}
        <path
          d={shieldOuterPath}
          fill="#FFB703"
          stroke="#FFB703"
          strokeWidth="32"
          opacity="0.3"
          filter="url(#softWideHalo)"
        />

        {/* Intense focused neon golden contour hugging the shield (matches IMG-20260924-WA4436.jpg) */}
        <path
          d={shieldOuterPath}
          fill="#FFD129"
          stroke="#FFD129"
          strokeWidth="20"
          opacity="0.75"
          filter="url(#neonShieldGlow)"
        />

        {/* ===================== TOP ARCHED TEXT ===================== */}
        <text
          fill="url(#crestGoldGrad)"
          style={{
            fontFamily: "'Montserrat', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '28px',
            letterSpacing: '0.12em',
          }}
        >
          <textPath href="#arcLRA" startOffset="50%" textAnchor="middle">
            LITTLE ROSES ACADEMY
          </textPath>
        </text>

        {/* ===================== NAKURU + WING ORNAMENT ===================== */}
        <g transform="translate(0, 10)">
          <text
            x="250"
            y="156"
            textAnchor="middle"
            fill="url(#crestGoldGrad)"
            style={{
              fontFamily: "'Montserrat', -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: '32px',
              letterSpacing: '0.15em',
            }}
          >
            NAKURU
          </text>

          {/* Decorative Underline Ribbon / Wing Ornament */}
          <g stroke="url(#crestGoldGrad)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Center diamond */}
            <polygon points="250,166 254,170 250,174 246,170" fill="#F7CD50" stroke="none" />
            {/* Left flourish line with arrow wing tip */}
            <path d="M 238, 170 L 170, 170 M 180, 166 L 168, 170 L 180, 174" />
            {/* Right flourish line with arrow wing tip */}
            <path d="M 262, 170 L 330, 170 M 320, 166 L 332, 170 L 320, 174" />
          </g>
        </g>

        {/* ===================== HERALDIC SHIELD ===================== */}
        <g id="shield">
          {/* Outer Shield Body + Thick Gold Border */}
          <path
            d={shieldOuterPath}
            fill="url(#shieldNavyGrad)"
            stroke="url(#crestGoldGrad)"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Inner Shield Thin Gold Line */}
          <path
            d={shieldInnerPath}
            fill="none"
            stroke="url(#crestGoldGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* Vertical Split Shading across right half for 3D shield look */}
          <path
            d={shieldRightHalfPath}
            fill="#000000"
            opacity="0.25"
          />

          {/* ===================== GRADUATION CAP ===================== */}
          <g id="cap" transform="translate(250, 310)">
            {/* Skullcap Base */}
            {/* Left Base (Blue) */}
            <path
              d="
                M -38, 10
                L -38, 38
                C -38, 48 -14, 58 0, 60
                L 0, 10
                Z
              "
              fill="url(#capUnderBlue)"
            />
            {/* Right Base (Red) */}
            <path
              d="
                M 0, 10
                L 0, 60
                C 14, 58 38, 48 38, 38
                L 38, 10
                Z
              "
              fill="url(#capUnderRed)"
            />
            {/* Base lower rim crease */}
            <path
              d="M -38, 38 C -38, 48 -14, 58 0, 60 C 14, 58 38, 48 38, 38"
              fill="none"
              stroke="#070D1E"
              strokeWidth="2"
            />

            {/* Diamond Mortarboard Top */}
            {/* Left Half (Royal Blue) */}
            <polygon
              points="0,-50 -68,-4 0,32"
              fill="url(#capBlueGrad)"
            />
            <line x1="0" y1="-50" x2="-68" y2="-4" stroke="#60A5FA" strokeWidth="1.5" opacity="0.6" />

            {/* Right Half (Crimson Red) */}
            <polygon
              points="0,-50 68,-4 0,32"
              fill="url(#capRedGrad)"
            />
            <line x1="0" y1="-50" x2="68" y2="-4" stroke="#F87171" strokeWidth="1.5" opacity="0.4" />

            {/* Center crease line */}
            <line x1="0" y1="-50" x2="0" y2="32" stroke="#000000" strokeWidth="1.2" opacity="0.35" />

            {/* Center Cap Button */}
            <circle cx="0" cy="-9" r="4.2" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1" />

            {/* Blue Tassel hanging down the left side */}
            <g id="tassel">
              <path
                d="M 0,-9 C -22,-11 -58,-1 -63,18"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="-63" cy="20" r="2.8" fill="#3B82F6" stroke="#93C5FD" strokeWidth="0.8" />
              <path
                d="M -65, 22 L -68, 52 Q -63, 54 -58, 52 L -61, 22 Z"
                fill="#2563EB"
              />
              <path
                d="M -66, 23 L -67, 52 M -63, 23 L -63, 54 M -60, 23 L -59, 52"
                stroke="#93C5FD"
                strokeWidth="0.8"
                opacity="0.8"
              />
            </g>
          </g>
        </g>

        {/* ===================== GOLDEN LAUREL WREATH ===================== */}
        <g id="wreath" fill="url(#crestGoldGrad)" stroke="url(#crestGoldGrad)">
          {/* Main Branches */}
          <path
            d="M 250, 480 C 205, 476 148, 436 136, 357 C 130, 312 136, 262 142, 248"
            fill="none"
            stroke="url(#stemGoldGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M 250, 480 C 295, 476 352, 436 364, 357 C 370, 312 364, 262 358, 248"
            fill="none"
            stroke="url(#stemGoldGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Crossed stems at bottom */}
          <path d="M 234, 488 C 245, 482 255, 478 266, 475" fill="none" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 266, 488 C 255, 482 245, 478 234, 475" fill="none" strokeWidth="2.8" strokeLinecap="round" />

          {/* Left Laurel Leaves */}
          <path d="M 142, 248 C 135, 239 140, 226 145, 228 C 151, 230 147, 242 142, 248 Z" />
          <path d="M 141, 257 C 127, 253 129, 242 136, 246 C 141, 248 142, 254 141, 257 Z" />
          <path d="M 139, 275 C 125, 269 124, 258 133, 262 C 139, 265 140, 272 139, 275 Z" />
          <path d="M 142, 275 C 149, 266 157, 270 154, 278 C 151, 282 145, 279 142, 275 Z" />

          <path d="M 137, 298 C 122, 289 121, 278 130, 282 C 137, 285 139, 294 137, 298 Z" />
          <path d="M 142, 298 C 151, 289 160, 293 156, 301 C 153, 306 145, 303 142, 298 Z" />

          <path d="M 135, 325 C 118, 316 116, 303 127, 308 C 135, 312 137, 321 135, 325 Z" />
          <path d="M 142, 325 C 153, 316 162, 320 158, 329 C 155, 334 145, 330 142, 325 Z" />

          <path d="M 138, 357 C 120, 348 118, 334 129, 340 C 137, 344 140, 353 138, 357 Z" />
          <path d="M 145, 357 C 157, 347 167, 352 163, 361 C 159, 367 149, 362 145, 357 Z" />

          <path d="M 146, 388 C 127, 379 125, 364 137, 371 C 145, 375 148, 384 146, 388 Z" />
          <path d="M 155, 388 C 169, 377 178, 383 174, 393 C 170, 398 160, 394 155, 388 Z" />

          <path d="M 161, 419 C 141, 411 141, 395 153, 402 C 161, 407 164, 415 161, 419 Z" />
          <path d="M 172, 419 C 187, 408 196, 414 192, 424 C 187, 430 178, 425 172, 419 Z" />

          <path d="M 186, 446 C 166, 440 167, 424 178, 431 C 186, 436 188, 443 186, 446 Z" />
          <path d="M 198, 446 C 213, 436 222, 443 218, 453 C 213, 458 203, 452 198, 446 Z" />

          <path d="M 219, 467 C 201, 463 204, 449 213, 454 C 220, 458 221, 465 219, 467 Z" />

          {/* Right Laurel Leaves */}
          <path d="M 358, 248 C 365, 239 360, 226 355, 228 C 349, 230 353, 242 358, 248 Z" />
          <path d="M 359, 257 C 373, 253 371, 242 364, 246 C 359, 248 358, 254 359, 257 Z" />
          <path d="M 361, 275 C 375, 269 376, 258 367, 262 C 361, 265 360, 272 361, 275 Z" />
          <path d="M 358, 275 C 351, 266 343, 270 346, 278 C 349, 282 355, 279 358, 275 Z" />

          <path d="M 363, 298 C 378, 289 379, 278 370, 282 C 363, 285 361, 294 363, 298 Z" />
          <path d="M 358, 298 C 349, 289 340, 293 344, 301 C 347, 306 355, 303 358, 298 Z" />

          <path d="M 365, 325 C 382, 316 384, 303 373, 308 C 365, 312 363, 321 365, 325 Z" />
          <path d="M 358, 325 C 347, 316 338, 320 342, 329 C 345, 334 355, 330 358, 325 Z" />

          <path d="M 362, 357 C 380, 348 382, 334 371, 340 C 363, 344 360, 353 362, 357 Z" />
          <path d="M 355, 357 C 343, 347 333, 352 337, 361 C 341, 367 351, 362 355, 357 Z" />

          <path d="M 354, 388 C 373, 379 375, 364 363, 371 C 355, 375 352, 384 354, 388 Z" />
          <path d="M 345, 388 C 331, 377 322, 383 326, 393 C 330, 398 340, 394 345, 388 Z" />

          <path d="M 339, 419 C 359, 411 359, 395 347, 402 C 339, 407 336, 415 339, 419 Z" />
          <path d="M 328, 419 C 313, 408 304, 414 308, 424 C 313, 430 322, 425 328, 419 Z" />

          <path d="M 314, 446 C 334, 440 333, 424 322, 431 C 314, 436 312, 443 314, 446 Z" />
          <path d="M 302, 446 C 287, 436 278, 443 282, 453 C 287, 458 297, 452 302, 446 Z" />

          <path d="M 281, 467 C 299, 463 296, 449 287, 454 C 280, 458 279, 465 281, 467 Z" />
        </g>

        {/* ===================== BOTTOM ARCHED TEXT ===================== */}
        <text
          fill="url(#crestGoldGrad)"
          style={{
            fontFamily: "'Montserrat', -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '27px',
            letterSpacing: '0.12em',
          }}
        >
          <textPath href="#arcMFL" startOffset="50%" textAnchor="middle">
            MUCH FROM LITTLE
          </textPath>
        </text>
      </svg>
    </div>
  );
}
