import { lazy, Suspense, useEffect } from 'react';

import { useStadiumStore } from '../state/useStadiumStore';
import { LoadingScreen } from '../ui/LoadingScreen';
import { MatchSetupDialog } from '../ui/MatchSetupDialog';

const StadiumExperience = lazy(async () => {
  const module = await import('./StadiumExperience');
  return { default: module.StadiumExperience };
});

function StadiumLoadingState({ waitingForMatch = false }) {
  return (
    <section
      className="stadium-viewport stadium-viewport--loading"
      aria-label="Interactive stadium view"
    >
      <LoadingScreen
        message={
          waitingForMatch
            ? 'Choose a match time to prepare the stadium.'
            : 'Loading the procedural stadium…'
        }
      />
    </section>
  );
}

export function App() {
  const returnToOverview = useStadiumStore((state) => state.returnToOverview);
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);

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
      {matchStartIso ? (
        <Suspense fallback={<StadiumLoadingState />}>
          <StadiumExperience />
        </Suspense>
      ) : (
        <StadiumLoadingState waitingForMatch />
      )}
    </main>
  );
}
