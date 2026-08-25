import type { StadiumConfig } from '../types/stadium.types';

type TierConfig = StadiumConfig['tiers'][number];
type GrandstandConfig = StadiumConfig['grandstand'];

export type InteriorSectionZone = {
  id:
    | 'virage-one'
    | 'virage-two'
    | 'closed-upper-virage'
    | 'honor-press'
    | 'opposite-stand'
    | 'lateral-corner';
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

  const oppositeIndices = new Set(
    grandstand.sectionIndices.map(
      (index) => (index + tier.sectionCount / 2) % tier.sectionCount,
    ),
  );
  if (oppositeIndices.has(sectionIndex)) {
    return {
      id: 'opposite-stand',
      label: 'Tribune opposée',
      viewingArea: 'seated',
    };
  }

  return {
    id: 'lateral-corner',
    label: 'Tribune latérale / angle',
    viewingArea: 'seated',
  };
}
