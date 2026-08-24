export type StaticPlayer = {
  id: string;
  team: 'home' | 'away';
  role: 'goalkeeper' | 'outfield';
  position: [number, number, number];
  rotationY: number;
};

type PitchDimensions = {
  length: number;
  width: number;
};

type FormationPosition = {
  xRatio: number;
  zRatio: number;
  role?: StaticPlayer['role'];
};

const formation: FormationPosition[] = [
  { xRatio: -0.43, zRatio: 0, role: 'goalkeeper' },
  { xRatio: -0.31, zRatio: -0.34 },
  { xRatio: -0.34, zRatio: -0.12 },
  { xRatio: -0.34, zRatio: 0.12 },
  { xRatio: -0.31, zRatio: 0.34 },
  { xRatio: -0.14, zRatio: -0.25 },
  { xRatio: -0.12, zRatio: 0 },
  { xRatio: -0.14, zRatio: 0.25 },
  { xRatio: 0.08, zRatio: -0.25 },
  { xRatio: 0.11, zRatio: 0 },
  { xRatio: 0.08, zRatio: 0.25 },
];

export function createStaticPlayerLayout(
  pitch: PitchDimensions,
): StaticPlayer[] {
  return (['home', 'away'] as const).flatMap((team) => {
    const direction = team === 'home' ? 1 : -1;

    return formation.map((formationPosition, playerIndex) => {
      const x = formationPosition.xRatio * pitch.length * direction;
      const z =
        formationPosition.zRatio * pitch.width * (team === 'home' ? 1 : -1);
      const rotationY = Math.atan2(-x, -z);

      return {
        id: `${team}-${String(playerIndex + 1).padStart(2, '0')}`,
        team,
        role: formationPosition.role ?? 'outfield',
        position: [x, 0.08, z],
        rotationY,
      };
    });
  });
}
