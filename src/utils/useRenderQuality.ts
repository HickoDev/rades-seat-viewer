import { useEffect, useState } from 'react';

import { useStadiumStore } from '../state/useStadiumStore';

export type EffectiveRenderQuality = 'low' | 'high';

function isCompactViewport() {
  return window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
}

export function useRenderQuality(): EffectiveRenderQuality {
  const qualityMode = useStadiumStore((state) => state.qualityMode);
  const matchSetupOpen = useStadiumStore((state) => state.matchSetupOpen);
  const [compact, setCompact] = useState(isCompactViewport);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px), (pointer: coarse)');
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // The opening dialog obscures the scene, so defer the expensive high-quality
  // stadium pass until the user enters the viewer.
  if (matchSetupOpen) return 'low';
  return qualityMode === 'auto' ? (compact ? 'low' : 'high') : qualityMode;
}
