/**
 * Little Roses Academy (LRA) - Phase 0 Foundation Application
 * 
 * Motto: MUCH FROM LITTLE
 * Pillars: LEARN • LOVE • LEAD
 * Tagline: LEARN TODAY BUILD TOMORROW
 * Target Viewport: ~390 × 844 Android-native feel
 * 
 * SPECIFICATION RULES:
 * - PHASE 0 ONLY: Foundation build
 * - ONE connected school operating system with 4 portals
 * - Permanent IDs for all entities
 * - Academic Year & Term models (no hardcoded dates)
 * - Grade 1-6 model (no Grade 7+, no streams)
 * - Central Subject Colour System (Grades 1-3 vs 4-6)
 * - Central Assessment Colour System (EE, ME, AE, BE)
 * - Theme System (LIGHT, DARK, SYSTEM)
 * - ZERO fake/demo data
 * - Biometric / Passkey login prompt modal
 */

import React, { useState, useEffect } from 'react';
import { SplashPhase0 } from './components/SplashPhase0.tsx';
import { PortalGateway } from './components/PortalGateway.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';
import { AdminPortalPhase0 } from './components/AdminPortalPhase0.tsx';
import { TeacherPortalPhase0 } from './components/TeacherPortalPhase0.tsx';
import { ParentPortalPhase0 } from './components/ParentPortalPhase0.tsx';
import { LearnerPortalPhase0 } from './components/LearnerPortalPhase0.tsx';
import { InitialAdminSetupModal } from './components/InitialAdminSetupModal.tsx';
import { BiometricModal } from './components/BiometricModal.tsx';
import { PortalType, UserSession } from './types/phase0.ts';
import { phase0Storage } from './services/phase0Storage.ts';
import { themeManager } from './services/themeManager.ts';
import { Smartphone, Maximize, RotateCcw } from 'lucide-react';

type AppScreen =
  | 'splash'
  | 'gateway'
  | 'auth'
  | 'admin_portal'
  | 'teacher_portal'
  | 'parent_portal'
  | 'learner_portal';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [selectedPortal, setSelectedPortal] = useState<PortalType>('ADMIN');
  const [currentSession, setCurrentSession] = useState<UserSession | null>(
    phase0Storage.getCurrentSession()
  );

  // Modals
  const [showInitialAdminSetup, setShowInitialAdminSetup] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingBiometricUserId, setPendingBiometricUserId] = useState<string | null>(null);

  // Viewport display toggle
  const [phoneFrame, setPhoneFrame] = useState(true);

  // Initialize theme and session listeners
  useEffect(() => {
    const unsubStorage = phase0Storage.subscribe(() => {
      const sess = phase0Storage.getCurrentSession();
      setCurrentSession(sess);
      if (!sess && screen.endsWith('_portal')) {
        setScreen('gateway');
      }
    });

    return () => {
      unsubStorage();
    };
  }, [screen]);

  // Handlers
  const handleSelectPortal = (portal: PortalType) => {
    setSelectedPortal(portal);
    // If active session matches this portal, go straight in
    if (currentSession && currentSession.portal === portal) {
      navigateToPortal(portal);
    } else {
      setScreen('auth');
    }
  };

  const navigateToPortal = (portal: PortalType) => {
    switch (portal) {
      case 'ADMIN':
        setScreen('admin_portal');
        break;
      case 'TEACHER':
        setScreen('teacher_portal');
        break;
      case 'PARENT':
        setScreen('parent_portal');
        break;
      case 'LEARNER':
        setScreen('learner_portal');
        break;
    }
  };

  const handleAuthSuccess = (session: UserSession) => {
    setCurrentSession(session);

    // SPECIFICATION Section 15:
    // First normal successful login may offer: "Enable biometric login?"
    if (
      phase0Storage.isBiometricSupported() &&
      !phase0Storage.isBiometricEnabledForUser(session.userId)
    ) {
      setPendingBiometricUserId(session.userId);
      setShowBiometricModal(true);
    } else {
      navigateToPortal(session.portal);
    }
  };

  const handleEnableBiometric = () => {
    if (pendingBiometricUserId) {
      phase0Storage.setBiometricEnabledForUser(pendingBiometricUserId, true);
    }
    setShowBiometricModal(false);
    if (currentSession) {
      navigateToPortal(currentSession.portal);
    }
  };

  const handleDismissBiometric = () => {
    setShowBiometricModal(false);
    if (currentSession) {
      navigateToPortal(currentSession.portal);
    }
  };

  const handleSignOut = () => {
    phase0Storage.clearSession();
    setCurrentSession(null);
    setScreen('gateway');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 select-none">
      {/* Top Device Viewport Controls for Desktop/Tablet */}
      <aside aria-label="Device Controls" className="hidden sm:flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-md text-xs font-semibold text-slate-300">
        <span className="text-[11px] font-bold text-amber-400">LRA Phase 0:</span>
        <button
          onClick={() => setPhoneFrame(true)}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition ${
            phoneFrame
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'hover:text-white'
          }`}
          title="Phone View (~390 × 844)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile View</span>
        </button>
        <button
          onClick={() => setPhoneFrame(false)}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition ${
            !phoneFrame
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'hover:text-white'
          }`}
          title="Expanded View"
        >
          <Maximize className="w-3.5 h-3.5" />
          <span>Expanded View</span>
        </button>
        <span className="w-px h-3.5 bg-slate-700" />
        <button
          onClick={() => setScreen('splash')}
          className="text-slate-400 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded"
          title="Restart Splash"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Splash</span>
        </button>
      </aside>

      {/* Viewport Container (Target ~390 × 844 Android-native feel) */}
      <div
        className={`w-full transition-all duration-300 overflow-hidden relative shadow-2xl ${
          phoneFrame
            ? 'max-w-[420px] h-[100dvh] sm:h-[844px] sm:max-h-[92vh] sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 bg-slate-950'
            : 'max-w-6xl h-[100dvh] sm:h-[90vh] sm:rounded-3xl sm:border sm:border-slate-800 bg-slate-950'
        }`}
      >
        {/* SCREEN 1: SPLASH */}
        {screen === 'splash' && (
          <SplashPhase0 onComplete={() => setScreen('gateway')} />
        )}

        {/* SCREEN 2: PORTAL GATEWAY */}
        {screen === 'gateway' && (
          <PortalGateway
            onSelectPortal={handleSelectPortal}
            onOpenInitialSetup={() => setShowInitialAdminSetup(true)}
          />
        )}

        {/* SCREEN 3: AUTHENTICATION */}
        {screen === 'auth' && (
          <AuthScreen
            portal={selectedPortal}
            onBack={() => setScreen('gateway')}
            onSuccess={handleAuthSuccess}
            onNeedInitialSetup={() => setShowInitialAdminSetup(true)}
          />
        )}

        {/* SCREEN 4: ADMIN PORTAL */}
        {screen === 'admin_portal' && currentSession && (
          <AdminPortalPhase0
            session={currentSession}
            onSignOut={handleSignOut}
          />
        )}

        {/* SCREEN 5: TEACHER PORTAL */}
        {screen === 'teacher_portal' && currentSession && (
          <TeacherPortalPhase0
            session={currentSession}
            onSignOut={handleSignOut}
          />
        )}

        {/* SCREEN 6: PARENT PORTAL */}
        {screen === 'parent_portal' && currentSession && (
          <ParentPortalPhase0
            session={currentSession}
            onSignOut={handleSignOut}
          />
        )}

        {/* SCREEN 7: LEARNER PORTAL */}
        {screen === 'learner_portal' && currentSession && (
          <LearnerPortalPhase0
            session={currentSession}
            onSignOut={handleSignOut}
          />
        )}
      </div>

      {/* Initial Admin Setup Modal */}
      <InitialAdminSetupModal
        isOpen={showInitialAdminSetup}
        onClose={() => setShowInitialAdminSetup(false)}
        onAdminCreated={() => {
          setSelectedPortal('ADMIN');
          setScreen('auth');
        }}
      />

      {/* Biometric Enable Modal */}
      <BiometricModal
        isOpen={showBiometricModal}
        onEnable={handleEnableBiometric}
        onDismiss={handleDismissBiometric}
      />
    </div>
  );
};

export default App;
