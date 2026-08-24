import { useEffect, useState } from 'react';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { readHeatmapCache, writeHeatmapCache } from './heatmapCache';
import { createHeatmapCacheKey } from './sunlightHeatmap';
import type {
  SunHeatmapWorkerRequest,
  SunHeatmapWorkerResponse,
} from './sunlightHeatmap.types';

export type HeatmapStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useSunlightHeatmap() {
  const showSunHeatmap = useStadiumStore((state) => state.showSunHeatmap);
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const matchEndIso = useStadiumStore((state) => state.matchEndIso);
  const resolution = useStadiumStore((state) => state.heatmapResolution);
  const result = useStadiumStore((state) => state.sunHeatmapResult);
  const setResult = useStadiumStore((state) => state.setSunHeatmapResult);
  const [status, setStatus] = useState<HeatmapStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!showSunHeatmap || !matchStartIso || !matchEndIso) {
      return;
    }
    let active = true;
    const updateStatus = (
      nextStatus: HeatmapStatus,
      nextError: string | null = null,
    ) => {
      queueMicrotask(() => {
        if (!active) return;
        setStatus(nextStatus);
        setErrorMessage(nextError);
      });
    };

    const cacheKey = createHeatmapCacheKey(
      radesStadiumConfig.version,
      matchStartIso,
      matchEndIso,
      resolution,
    );
    const cached = readHeatmapCache(cacheKey);
    if (cached) {
      setResult(cached);
      updateStatus('ready');
      return () => {
        active = false;
      };
    }

    setResult(null);
    updateStatus('loading');
    const worker = new Worker(
      new URL('../workers/sunlightHeatmap.worker.ts', import.meta.url),
      { type: 'module', name: 'rades-sunlight-heatmap' },
    );
    const request: SunHeatmapWorkerRequest = {
      type: 'simulate',
      cacheKey,
      matchStartIso,
      matchEndIso,
      resolution,
    };

    worker.onmessage = (event: MessageEvent<SunHeatmapWorkerResponse>) => {
      if (event.data.type === 'error') {
        if (event.data.cacheKey !== cacheKey) return;
        updateStatus('error', event.data.message);
        return;
      }
      if (event.data.result.cacheKey !== cacheKey) return;
      writeHeatmapCache(event.data.result);
      setResult(event.data.result);
      updateStatus('ready');
    };
    worker.onerror = () => {
      updateStatus(
        'error',
        'The background heatmap worker stopped unexpectedly.',
      );
    };
    worker.postMessage(request);

    return () => {
      active = false;
      worker.terminate();
    };
  }, [matchEndIso, matchStartIso, resolution, setResult, showSunHeatmap]);

  return {
    result,
    status: showSunHeatmap && matchStartIso && matchEndIso ? status : 'idle',
    errorMessage,
  };
}
