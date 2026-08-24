import type { StadiumConfig } from '../stadium/types/stadium.types';

export type TechnicalAreaPerson = {
  id: string;
  team: 'home' | 'away';
  pose: 'seated' | 'standing';
  position: [number, number, number];
  rotationY: number;
};

export function createTechnicalAreaLayout(
  config: Pick<
    StadiumConfig,
    'grandstand' | 'occupants' | 'pitch' | 'structure'
  >,
): TechnicalAreaPerson[] {
  const { grandstand, occupants, pitch, structure } = config;
  const centerZ =
    grandstand.side * (pitch.width / 2 + structure.benchSidelineOffset);
  const centerOffsetX =
    structure.benchLength / 2 + structure.benchSeparation / 2;
  const rotationY = grandstand.side === 1 ? Math.PI : 0;

  return (['home', 'away'] as const).flatMap((team, teamIndex) => {
    const centerX = (teamIndex === 0 ? -1 : 1) * centerOffsetX;
    const seated = Array.from(
      { length: occupants.technicalAreaSeatedPerTeam },
      (_, personIndex): TechnicalAreaPerson => ({
        id: `${team}-bench-${String(personIndex + 1).padStart(2, '0')}`,
        team,
        pose: 'seated',
        position: [
          centerX +
            ((personIndex + 0.5) / occupants.technicalAreaSeatedPerTeam - 0.5) *
              structure.benchLength *
              0.76,
          0.14,
          centerZ + grandstand.side * 0.18,
        ],
        rotationY,
      }),
    );
    const standing = Array.from(
      { length: occupants.technicalAreaStandingPerTeam },
      (_, personIndex): TechnicalAreaPerson => ({
        id: `${team}-staff-${String(personIndex + 1).padStart(2, '0')}`,
        team,
        pose: 'standing',
        position: [
          centerX +
            (personIndex - (occupants.technicalAreaStandingPerTeam - 1) / 2) *
              structure.benchLength *
              0.38,
          0.14,
          centerZ - grandstand.side * (structure.benchDepth / 2 + 1.05),
        ],
        rotationY,
      }),
    );

    return [...seated, ...standing];
  });
}
