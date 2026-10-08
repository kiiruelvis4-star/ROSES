import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';

interface CircularBadgeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function CircularBadgeLogo({ size = 'md', className = '' }: CircularBadgeLogoProps) {
  const [installedLogo, setInstalledLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('lra_installed_school_logo');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        setInstalledLogo(localStorage.getItem('lra_installed_school_logo'));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <Logo size={size} showTagline={false} />
    </div>
  );
}
