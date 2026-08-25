import type { StadiumConfig } from '../types/stadium.types';

type GrandstandConfig = StadiumConfig['grandstand'];

export type GrandstandFacilityKind =
  'honor-suite' | 'press-suite' | 'control-room' | 'service-core';

export type GrandstandFacilityVolume = {
  id: string;
  kind: GrandstandFacilityKind;
  centerX: number;
  width: number;
  height: number;
  depth: number;
  baseHeight: number;
  windowBayCount: number;
};

export function createGrandstandFacilityLayout(
  grandstand: GrandstandConfig,
): GrandstandFacilityVolume[] {
  const pressCenter =
    grandstand.centralSuiteWidth / 2 +
    grandstand.suiteGap +
    grandstand.pressSuiteWidth / 2;
  const controlCenter =
    pressCenter +
    grandstand.pressSuiteWidth / 2 +
    grandstand.suiteGap +
    grandstand.controlRoomWidth / 2;
  const serviceCenter =
    controlCenter +
    grandstand.controlRoomWidth / 2 +
    grandstand.suiteGap +
    grandstand.serviceCoreWidth / 2;

  return [
    {
      id: 'honor-center',
      kind: 'honor-suite',
      centerX: 0,
      width: grandstand.centralSuiteWidth,
      height: grandstand.centralSuiteHeight,
      depth: grandstand.depth + 0.8,
      baseHeight: grandstand.baseHeight,
      windowBayCount: 6,
    },
    ...([-1, 1] as const).flatMap((side) => [
      {
        id: `press-${side}`,
        kind: 'press-suite' as const,
        centerX: side * pressCenter,
        width: grandstand.pressSuiteWidth,
        height: grandstand.pressSuiteHeight,
        depth: grandstand.depth,
        baseHeight: grandstand.baseHeight,
        windowBayCount: 5,
      },
      {
        id: `control-${side}`,
        kind: 'control-room' as const,
        centerX: side * controlCenter,
        width: grandstand.controlRoomWidth,
        height: grandstand.controlRoomHeight,
        depth: grandstand.depth * 0.9,
        baseHeight: grandstand.baseHeight + 0.7,
        windowBayCount: 2,
      },
      {
        id: `service-${side}`,
        kind: 'service-core' as const,
        centerX: side * serviceCenter,
        width: grandstand.serviceCoreWidth,
        height: grandstand.serviceCoreHeight,
        depth: grandstand.depth + 1.4,
        baseHeight: grandstand.baseHeight - 0.8,
        windowBayCount: 1,
      },
    ]),
  ];
}
