# Little Roses Academy — Splash Screen Architecture & Customization Plan (Revised)

Upgrade the Little Roses Academy application opening experience with your exact campus crest photo for Splash 1, followed by the system readiness bar on Splash 2, plus an in-app photo customizer to add, change, or reset splash images anytime.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Splash 1 Exact Image & Display Rule (Confirmed)**:
> - **Exact Photo Asset**: Splash 1 will display the exact Little Roses Academy Nakuru sunny campus and crest photograph (`file_0000000063ac8211a3ee2b9337a4e2cd.png` / `/src/assets/images/splash1_official_crest_1792069867802.jpg`).
> - **Pure Visual Presentation**: 100% full opacity, full screen, exactly as provided.
> - **Zero Overlays**: No dark gradient scrims, no duplicate logos, no school name text overlays, no "Tap anywhere to continue", and no skip buttons anywhere.
> - **5-Second Timer**: Stays for exactly 5 seconds (5000ms), then automatically transitions to Splash 2.

<div align="center">

| Exact Target Splash 1 Photo |
| :---: |
| <img src="file_0000000063ac8211a3ee2b9337a4e2cd.png" width="280" alt="Exact Little Roses Academy Splash 1 Photo" /> |
| *Display: 5.0s duration · 100% opacity · 0 overlays · 0 buttons* |

</div>

- **Confirmed Decision 2 (In-App Splash Customizer)**:
  - Accessible via Admin Settings (School Profile) and quick action on the portal gate.
  - Allows uploading any photo from your phone or computer for Splash 1 and Splash 2.
  - Instant live thumbnail previews and one-click "Reset to Default" button.
  - Option to adjust the Splash 1 duration (default 5 seconds).

- **Confirmed Decision 3 (Splash 2 Readiness Experience)**:
  - Shows the Kenyan CBC curriculum badge and the 0% $\to$ 100% system readiness progress bar.
  - Uses the learner study photograph as background (also customizable via the in-app customizer).
  - Automatically transitions to the central Portal Selection gate upon reaching 100%.

---

## 1. Overview & Core Concept

- **What It Delivers**: A pristine, authentic welcome screen featuring the school's official Nakuru campus and crest photograph, completely unobstructed by UI controls or artificial overlays for 5 seconds, followed by the system readiness indicator, opening directly into the central school portal gate.
- **Audience**: School administrators, teachers, parents, and learners across mobile and tablet devices.
- **Key Value**: Professional institutional identity honoring the school's crest ("Much From Little") while granting administrators full control to update splash images whenever needed.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Pure Splash 1 (0–5 seconds)**:
   - App launches immediately displaying your exact campus crest photo edge-to-edge.
   - Clean framing in deep academy navy (`#070D1E`) with `object-cover object-center`.
   - No interactive elements or text badges to distract from the image.
   - Transitions automatically to Splash 2 at the 5-second mark.

2. **Splash 2 (System Readiness & Gate Entrance)**:
   - Displays the study desk photo (or customized Splash 2 image).
   - Animated progress bar counts smoothly from 0% to 100% ("Encrypted School Gate").
   - Completes smoothly and advances directly to the 4-portal selection screen.

3. **In-App Splash Customizer Modal**:
   - Opens as a centered, responsive glass modal.
   - **Splash 1 Tab**: View current photo, upload new file (`<input type="file" accept="image/*">`), or click "Reset to Official Photo".
   - **Splash 2 Tab**: View current photo, upload new file, or select academy presets (Campus Grounds / Learner Study).
   - **Duration Control**: Slider from 2s to 10s (default set to 5s).
   - **Test & Apply**: "Save & Play Splash Flow" button lets you immediately see the 5-second Splash 1 in action.

---

## 3. Key Technical Decisions & Storage Strategy

- **Primary Splash 1 Image Asset**:
  - The exact photo is stored locally as `/src/assets/images/splash1_official_crest_1792069867802.jpg` (with fallback to `/src/assets/images/splash1_campus_crest_1790668349675.jpg`).
- **Persistent Customization**:
  - `dataLayer.getSchoolProfile()` / `saveSchoolProfile()` stores `splash1ImageUrl`, `splash2ImageUrl`, and `splash1DurationSeconds`.
  - When an admin uploads a new file, it is converted to a base64 Data URL and stored in localStorage, surviving browser refreshes and offline reboots.
- **Zero-Overlay Enforcement**:
  - `Splash1.tsx` renders solely the `<img>` element with `w-full h-full object-cover`. All previous absolute scrim divs, `<Logo />` overlays, and footer pills are removed.

---

## 4. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  State: screen = 'splash1' (5s) -> 'splash2' -> 'portals'   │
│  State: isSplashCustomizerOpen (boolean)                    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
       ┌───────┴───────┐              ┌───────┴───────┐
       ▼               ▼              ▼               ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────────────┐
│  Splash1.tsx ││  Splash2.tsx ││PortalSelect. ││SplashCustomizerModal │
│ • Exact Photo││ • Readiness  ││ • 4 Portals  ││ • Upload device photo│
│ • 5s Timer   ││   Progress   ││ • Customizer ││ • Presets & duration │
│ • 0 Overlays ││ • Custom bg  ││   trigger    ││ • Live test button   │
└──────┬───────┘└──────┬───────┘└──────────────┘└──────────┬───────────┘
       │               │                                   │
       └───────────────┼───────────────────────────────────┘
                       ▼
       ┌───────────────────────────────┐
       │     dataLayer.ts (Storage)    │
       │ • splash1ImageUrl             │
       │ • splash2ImageUrl             │
       │ • splash1DurationSeconds      │
       └───────────────────────────────┘
```
