'use client';

/**
 * MobileLoader — Conditionally loads mobile-only components
 * 
 * Checks window.Capacitor (injected by native bridge) at runtime.
 * If not running in Capacitor, renders nothing.
 * If running in Capacitor, dynamically imports the mobile components.
 * 
 * This avoids importing @capacitor/core at module level, which would
 * cause webpack factory errors in the web dev environment.
 */

import { useEffect, useState, type ReactNode } from 'react';

export function MobileLoader() {
  const [MobileComponents, setMobileComponents] = useState<ReactNode>(null);

  useEffect(() => {
    // window.Capacitor is injected by the native shell
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.()) return;

    // Only import mobile components when we're confirmed in Capacitor
    Promise.all([
      import('./MobileAppShell'),
      import('./MobileOnboarding'),
    ]).then(([shellMod, onboardingMod]) => {
      const Shell = shellMod.default;
      const Onboarding = onboardingMod.default;
      setMobileComponents(
        <>
          <Shell><></></Shell>
          <Onboarding />
        </>
      );
    }).catch(err => {
      console.error('[MobileLoader] Failed to load mobile components:', err);
    });
  }, []);

  return <>{MobileComponents}</>;
}

export default MobileLoader;
