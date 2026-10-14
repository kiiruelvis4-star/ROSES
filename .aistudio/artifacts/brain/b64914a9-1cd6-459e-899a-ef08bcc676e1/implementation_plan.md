# Little Roses Academy - Entry Sequence & Portal Gate Implementation Plan

Comprehensive implementation and visual alignment plan for the 4-stage entry experience of Little Roses Academy (Nakuru, Kenya), incorporating the user's verified reference imagery and replacing the portal gate shield with the official circular school logo.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user provided the 4 definitive visual references for the entry sequence and specified a critical design requirement for the portal gate:
> - **Logo Asset**: The official circular emblem with navy outer ring, cream parchment disc, "LITTLE ROSES ACADEMY", "NAKURU", split blue/red mortarboard, red laurel wreath, and "MUCH FROM LITTLE".
> - **Splash 1**: Campus grounds photograph under bright Kenyan skies with the official round crest centered.
> - **Splash 2**: Learner in maroon uniform at a wooden desk with laptop (studying fractions), notebooks, and headphones, with "LEARN TODAY BUILD TOMORROW" and live 0–100% readiness indicator.
> - **Portal View Revision**: Follows the dark navy 4-card security gate layout, with the top shield **explicitly replaced by the official school logo in a round form**.

- **Confirmed Decision (Round Logo on Portal Gate)**: Replace the generic golden shield header in the portal gate with the official circular `Logo` component in round form, maintaining institutional authority.
- **Timing & Transitions**:
  - Splash 1: 5-second automatic progression with immediate tap-to-skip.
  - Splash 2: Smooth 0% to 100% readiness progress bar incrementing system readiness before opening the portal gate.
  - Portal Gate: 4 neon-accented role cards matching the reference layout:
    1. *School Administration* (Gold border, building icon, "Admin code + password")
    2. *Staff and Teachers* (Blue border, teacher icon, "Phone + password")
    3. *Parents and Guardians* (Cyan/Emerald border, family icon, "Phone + password")
    4. *Learners* (Purple border, graduation icon, "UPI + PIN")

---

## 1. Overview & Core Concept

- **What It Does**: Delivers an authentic, visually stunning entry experience that honors the Little Roses Academy heritage. It guides users through the lush campus grounds (Splash 1) and engaged classroom study (Splash 2), arriving at an institutional role gate (Portal Selection) crowned with the official circular school emblem.
- **Target Audience / Personas**: Administrators, teachers, parents, and learners across Nakuru, accessing via mobile phones, tablets, or desktop.
- **Key Value**: Provides instant school recognition, reinforces the motto "MUCH FROM LITTLE" and tagline "LEARN TODAY BUILD TOMORROW", and guarantees that each user group enters through their dedicated security door.

---

## 2. User Experience & Visual Design

### 4-Stage Visual Sequence

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STAGE 1: SPLASH 1 (5s)                          │
│  • Full-bleed photograph of Little Roses stone campus buildings        │
│  • Lush green lawn, pine trees, and bright blue sunny sky              │
│  • Centered official round school crest with subtle gold illumination  │
│  • "Tap anywhere to continue" skip affordance                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (5s timer or tap)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        STAGE 2: SPLASH 2                               │
│  • Authentic learning photograph: Grade 5 pupil in maroon sweater      │
│  • Laptop showing Mathematics Fractions, open notebook, headphones    │
│  • Centered round school logo with tagline: "LEARN TODAY BUILD TOMORROW"│
│  • "KENYAN CBC · Primary School · Grades 1-6"                          │
│  • Smooth 0% -> 100% System Readiness Progress Bar                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Completes at 100%)
┌───────────────────────────────────▼────────────────────────────────────┐
│              STAGE 3: SELECT SECURITY PORTAL (GATE)                    │
│                                                                        │
│                 [ OFFICIAL ROUND SCHOOL LOGO ]                         │
│                    SELECT SECURITY PORTAL                              │
│                                                                        │
│  ┌───────────────────────────────┐   ┌───────────────────────────────┐ │
│  │ 🏫 School Administration      │   │ 👨‍🏫 Staff and Teachers         │ │
│  │    Admin code + password      │   │    Phone + password           │ │
│  │    Gold outline & icon        │   │    Blue outline & icon        │ │
│  └───────────────────────────────┘   └───────────────────────────────┘ │
│  ┌───────────────────────────────┐   ┌───────────────────────────────┐ │
│  │ 👨‍👩‍👧 Parents and Guardians     │   │ 🎓 Learners                   │ │
│  │    Phone + password           │   │    UPI + PIN                  │ │
│  │    Cyan/Emerald outline & icon│   │    Purple outline & icon      │ │
│  └───────────────────────────────┘   └───────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Tap opens role sign-in)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    STAGE 4: DEDICATED SIGN-IN                          │
│  • Admin: Admin code + password                                        │
│  • Teachers: Phone + password                                          │
│  • Guardians: Phone + password                                         │
│  • Learners: UPI + 4-digit PIN (with 5-attempt rate-limit lockout)     │
└────────────────────────────────────────────────────────────────────────┘
```

### Aesthetic & Visual Rules

- **Round Logo Integration**:
  - The official crest is rendered in an exact vector circle with navy border `#2E486D`, parchment disc `#ECD8C0`, and crisp typography.
  - In Portal Gate: Positioned prominently at the top above "SELECT SECURITY PORTAL", replacing the generic shield.
- **Card Styling & Neon Boundaries**:
  - High-density dark slate canvas (`#070D1E` / `bg-slate-950`).
  - Subtle glowing borders with soft inner radial gradients:
    - Admin: Amber/Gold glow (`border-amber-500/50`, `text-amber-400`).
    - Teachers: Electric Blue glow (`border-blue-500/50`, `text-blue-400`).
    - Guardians: Emerald/Cyan glow (`border-emerald-500/50`, `text-emerald-400`).
    - Learners: Royal Purple glow (`border-purple-500/50`, `text-purple-400`).
  - No static pill sandwiches; credential hints use clean unboxed text with icons (`Admin code + password`, `Phone + password`, `UPI + PIN`).
  - Touch targets strictly exceed $44 \times 44\text{px}$ with smooth settling curves (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Round Logo Replacement for Portal Shield**:
  - *Chosen Approach*: Replace the generic shield at the top of the portal gate with the official circular Little Roses Academy logo disc.
  - *Why*: Directly fulfills the user's explicit request and reinforces institutional trust and brand continuity across all devices.
  - *Alternatives Considered*: Retaining the generic shield, which conflicts with school branding.

- **Decision 2: High-Fidelity Asset Pipeline for Splash 1 & Splash 2**:
  - *Chosen Approach*: Pair authentic visual assets for the campus grounds (Splash 1) and desk study (Splash 2) with contrast gradient scrims and styled SVG/CSS fallbacks so no screen ever breaks or flickers.
  - *Why*: Satisfies the Zero-Broken-Image policy while honoring the real Nakuru campus and CBC curriculum context.

- **Decision 3: Non-Blocking 5-Second Timer on Splash 1**:
  - *Chosen Approach*: 5000ms timer for first impressions, with instant click-to-skip so frequent daily teachers and parents are never delayed.
  - *Why*: Satisfies PRD v7 Section 4 while maintaining mobile ergonomic speed.

---

## 4. Technical Architecture & Component Mapping

### Components to Update Upon Approval

1. **`src/components/Splash1.tsx`**:
   - Set 5000ms duration per PRD v7.
   - Embed authentic school-ground imagery with centered round crest and "Tap anywhere to continue" skip cue.
2. **`src/components/Splash2.tsx`**:
   - Integrate learner desk study imagery with centered round crest.
   - Display "KENYAN CBC · Primary School · Grades 1-6" and "LEARN TODAY BUILD TOMORROW".
   - Visible 0% to 100% readiness progress bar triggering transition on completion.
3. **`src/components/PortalSelection.tsx`**:
   - Crown the top of the screen with the official round `Logo` (circular form).
   - Style the "SELECT SECURITY PORTAL" header with elegant gold typography.
   - Refine the 4 role cards (School Administration, Staff and Teachers, Parents and Guardians, Learners) with their respective glowing borders, circular icons, and sign-in cues.
4. **`src/components/Logo.tsx`**:
   - Verify the circular round form conforms exactly to `institute_logo_1778247137607.jpg`.
