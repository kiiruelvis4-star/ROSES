/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Maximize, RotateCcw, Play, Building2, GraduationCap } from 'lucide-react';
import { FirstSplash } from './components/FirstSplash.tsx';
import { SecondSplash } from './components/SecondSplash.tsx';
import { PortalStep3 } from './components/PortalStep3.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { TeachersPortal } from './components/TeachersPortal.tsx';

type DeviceMode = 'phone' | 'tablet' | 'full';
type ActiveStep = 'flow' | 'splash1' | 'splash2' | 'step3' | 'admin' | 'teachers';

export default function App() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('phone');
  const [activeStep, setActiveStep] = useState<ActiveStep>('flow');
  const [replayKey, setReplayKey] = useState(0);

  const handleRestart = () => {
    setReplayKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen w-full bg-[#03060d] text-neutral-100 flex flex-col items-center justify-center relative overflow-hidden select-none font-sans">
      {/* Top Floating Control Bar */}
      <nav
        aria-label="App presentation controls"
        className="fixed top-3 z-50 flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full bg-neutral-900/90 backdrop-blur-md border border-neutral-700/60 shadow-2xl"
      >
        {/* Navigation Modes */}
        <div className="flex items-center gap-1 bg-neutral-950/80 p-0.5 rounded-full border border-neutral-800">
          <button
            onClick={() => {
              setActiveStep('flow');
              handleRestart();
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStep === 'flow'
                ? 'bg-amber-400 text-neutral-950 shadow-md scale-105'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Auto sequence: Quick Splash 1 -> 0-100% Splash 2 -> Stage 3 Portal"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Full Flow</span>
          </button>

          <button
            onClick={() => setActiveStep('splash1')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeStep === 'splash1'
                ? 'bg-blue-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Splash 1
          </button>

          <button
            onClick={() => {
              setActiveStep('splash2');
              handleRestart();
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeStep === 'splash2'
                ? 'bg-blue-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Splash 2
          </button>

          <button
            onClick={() => setActiveStep('step3')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeStep === 'step3'
                ? 'bg-blue-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Stage 3
          </button>

          <button
            onClick={() => setActiveStep('admin')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
              activeStep === 'admin'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="School Administration Portal"
          >
            <Building2 className="w-3 h-3" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => setActiveStep('teachers')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
              activeStep === 'teachers'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Teachers Portal"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Teachers</span>
          </button>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-4 bg-neutral-700 mx-0.5" />

        {/* Device Viewport Selector */}
        <div className="flex items-center gap-1 bg-neutral-950/80 p-0.5 rounded-full border border-neutral-800">
          <button
            onClick={() => setDeviceMode('phone')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              deviceMode === 'phone'
                ? 'bg-neutral-100 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>

          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              deviceMode === 'tablet'
                ? 'bg-neutral-100 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>

          <button
            onClick={() => setDeviceMode('full')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              deviceMode === 'full'
                ? 'bg-neutral-100 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Full Screen Edge-to-Edge"
          >
            <Maximize className="w-3 h-3" />
            <span className="hidden md:inline">Full</span>
          </button>
        </div>

        {/* Replay */}
        <button
          onClick={handleRestart}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ml-0.5"
          title="Restart flow sequence"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Replay</span>
        </button>
      </nav>

      {/* Main Viewport Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0">
        {deviceMode === 'phone' && (
          <div className="h-[84vh] max-h-[790px] aspect-[9/19.5] max-w-[94vw] bg-[#070D1E] overflow-hidden flex flex-col relative shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-2xl">
            {activeStep === 'flow' && <FlowSequence key={replayKey} mode="phone" />}
            {activeStep === 'splash1' && <FirstSplash mode="phone" />}
            {activeStep === 'splash2' && (
              <SecondSplash key={replayKey} mode="phone" replayTrigger={replayKey} />
            )}
            {activeStep === 'step3' && (
              <PortalStep3 mode="phone" onExit={() => setActiveStep('flow')} />
            )}
            {activeStep === 'admin' && (
              <AdminPortal
                mode="phone"
                onBackToPortals={() => setActiveStep('step3')}
                onSwitchToTeachers={() => setActiveStep('teachers')}
              />
            )}
            {activeStep === 'teachers' && (
              <TeachersPortal
                mode="phone"
                onSwitchToAdmin={() => setActiveStep('admin')}
                onExit={() => setActiveStep('step3')}
              />
            )}
          </div>
        )}

        {deviceMode === 'tablet' && (
          <div className="h-[84vh] max-h-[790px] aspect-[3/4] max-w-[94vw] bg-[#070D1E] overflow-hidden flex flex-col relative shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-xl">
            {activeStep === 'flow' && <FlowSequence key={replayKey} mode="tablet" />}
            {activeStep === 'splash1' && <FirstSplash mode="tablet" />}
            {activeStep === 'splash2' && (
              <SecondSplash key={replayKey} mode="tablet" replayTrigger={replayKey} />
            )}
            {activeStep === 'step3' && (
              <PortalStep3 mode="tablet" onExit={() => setActiveStep('flow')} />
            )}
            {activeStep === 'admin' && (
              <AdminPortal
                mode="tablet"
                onBackToPortals={() => setActiveStep('step3')}
                onSwitchToTeachers={() => setActiveStep('teachers')}
              />
            )}
            {activeStep === 'teachers' && (
              <TeachersPortal
                mode="tablet"
                onSwitchToAdmin={() => setActiveStep('admin')}
                onExit={() => setActiveStep('step3')}
              />
            )}
          </div>
        )}

        {deviceMode === 'full' && (
          <div className="w-full h-screen min-h-screen bg-[#070D1E] overflow-hidden flex flex-col relative">
            {activeStep === 'flow' && <FlowSequence key={replayKey} mode="full" />}
            {activeStep === 'splash1' && <FirstSplash mode="full" />}
            {activeStep === 'splash2' && (
              <SecondSplash key={replayKey} mode="full" replayTrigger={replayKey} />
            )}
            {activeStep === 'step3' && (
              <PortalStep3 mode="full" onExit={() => setActiveStep('flow')} />
            )}
            {activeStep === 'admin' && (
              <AdminPortal
                mode="full"
                onBackToPortals={() => setActiveStep('step3')}
                onSwitchToTeachers={() => setActiveStep('teachers')}
              />
            )}
            {activeStep === 'teachers' && (
              <TeachersPortal
                mode="full"
                onSwitchToAdmin={() => setActiveStep('admin')}
                onExit={() => setActiveStep('step3')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Full Flow:
 * 1. Splash 1 displays smoothly for 1.8 seconds (or tap anywhere to skip)
 * 2. Second Splash stays till the progress counter reaches 100%
 * 3. Enters the 3rd stage (Security Portal)
 */
function FlowSequence({ mode }: { mode: 'phone' | 'tablet' | 'full' }) {
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);

  // Fast background timer for Splash 1 (1.8 seconds)
  useEffect(() => {
    if (currentStage === 1) {
      const timer = setTimeout(() => {
        setCurrentStage(2);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  if (currentStage === 1) {
    return (
      <div 
        className="w-full h-full cursor-pointer"
        onClick={() => setCurrentStage(2)}
        title="Tap to proceed"
      >
        <FirstSplash mode={mode} />
      </div>
    );
  }

  if (currentStage === 2) {
    return (
      <SecondSplash
        mode={mode}
        onComplete={() => setCurrentStage(3)}
      />
    );
  }

  return (
    <PortalStep3
      mode={mode}
      onExit={() => setCurrentStage(1)}
    />
  );
}
