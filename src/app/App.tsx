import { useEffect } from 'react';

import { StadiumCanvas } from '../scene/StadiumCanvas';
import { useStadiumStore } from '../state/useStadiumStore';
import { StadiumSidebar } from '../ui/StadiumSidebar';
import { MatchSetupDialog } from '../ui/MatchSetupDialog';
import { MobileBottomSheet } from '../ui/MobileBottomSheet';

export function App() {
  const returnToOverview = useStadiumStore((state) => state.returnToOverview);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        returnToOverview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [returnToOverview]);

  return (
    <main className="app-shell">
      <MatchSetupDialog />
      <MobileBottomSheet>
        <StadiumSidebar />
      </MobileBottomSheet>
      <StadiumCanvas />
    </main>
  );
}
