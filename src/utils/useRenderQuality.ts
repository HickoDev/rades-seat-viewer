import { useStadiumStore } from '../state/useStadiumStore';

export type EffectiveRenderQuality = 'low' | 'high';

export function useRenderQuality(): EffectiveRenderQuality {
  const qualityMode = useStadiumStore((state) => state.qualityMode);
  return qualityMode;
}
