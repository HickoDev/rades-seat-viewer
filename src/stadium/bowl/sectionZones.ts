import type { StadiumConfig } from '../types/stadium.types';

type TierConfig = StadiumConfig['tiers'][number];
type GrandstandConfig = StadiumConfig['grandstand'];

export type InteriorSectionZone = {
  id:
    | 'virage-one'
    | 'virage-two'
    | 'closed-upper-virage'
    | 'honor-press'
    | 'enceinte'
    | 'pelouse';
  label: string;
  viewingArea: 'terrace' | 'seated' | 'official' | 'closed';
};

export function getInteriorSectionZone(
  tier: TierConfig,
  sectionIndex: number,
  grandstand: GrandstandConfig,
): InteriorSectionZone {
  if (tier.closedToVisitorsSectionIndices.includes(sectionIndex)) {
    return {
      id: 'closed-upper-virage',
      label: 'Upper virage - closed to visitors',
      viewingArea: 'closed',
    };
  }
  const isTerrace = tier.seatlessSectionIndices.includes(sectionIndex);
  if (isTerrace) {
    const inFirstVirage =
      sectionIndex <= 2 || sectionIndex >= tier.sectionCount - 3;
    return inFirstVirage
      ? {
          id: 'virage-one',
          label: 'Virage 1 · Terrasse debout',
          viewingArea: 'terrace',
        }
      : {
          id: 'virage-two',
          label: 'Virage 2 · Terrasse debout',
          viewingArea: 'terrace',
        };
  }

  if (grandstand.sectionIndices.includes(sectionIndex)) {
    return {
      id: 'honor-press',
      label: "Tribune d'honneur · منصة شرفية / Presse",
      viewingArea: 'official',
    };
  }

  const sectionCenterAngle =
    ((sectionIndex + 0.5) / tier.sectionCount) * Math.PI * 2;
  const isOnEnceinteSide = Math.sin(sectionCenterAngle) * grandstand.side > 0;
  if (isOnEnceinteSide) {
    return {
      id: 'enceinte',
      label:
        tier.id === 'upper' ? 'Enceinte supérieure' : 'Enceinte inférieure',
      viewingArea: 'seated',
    };
  }

  return {
    id: 'pelouse',
    label: 'Pelouse',
    viewingArea: 'seated',
  };
}
