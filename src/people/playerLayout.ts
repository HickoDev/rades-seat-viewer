export type MatchPlayer = {
  id: string;
  team: 'home' | 'away';
  role: 'goalkeeper' | 'outfield';
  position: [number, number, number];
  rotationY: number;
  motionPhase: number;
  motionRadiusX: number;
  motionRadiusZ: number;
};

export type MatchPlayerPose = {
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
  role?: MatchPlayer['role'];
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

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function createMatchPlayerLayout(pitch: PitchDimensions): MatchPlayer[] {
  return (['home', 'away'] as const).flatMap((team, teamIndex) => {
    const direction = team === 'home' ? 1 : -1;

    return formation.map((formationPosition, playerIndex) => {
      const x = formationPosition.xRatio * pitch.length * direction;
      const z =
        formationPosition.zRatio * pitch.width * (team === 'home' ? 1 : -1);
      const rotationY = Math.atan2(-x, -z);
      const role = formationPosition.role ?? 'outfield';

      return {
        id: `${team}-${String(playerIndex + 1).padStart(2, '0')}`,
        team,
        role,
        position: [x, 0.08, z],
        rotationY,
        motionPhase: teamIndex * Math.PI + playerIndex * 0.83,
        motionRadiusX:
          role === 'goalkeeper' ? 1.3 : 2.1 + (playerIndex % 3) * 0.55,
        motionRadiusZ:
          role === 'goalkeeper' ? 3.2 : 1.6 + (playerIndex % 4) * 0.48,
      };
    });
  });
}

export function calculateBallPosition(
  elapsedSeconds: number,
  pitch: PitchDimensions,
): [number, number, number] {
  const halfLength = pitch.length / 2 - 2.4;
  const halfWidth = pitch.width / 2 - 2.4;
  const x =
    Math.sin(elapsedSeconds * 0.115) * pitch.length * 0.3 +
    Math.sin(elapsedSeconds * 0.31 + 0.8) * pitch.length * 0.08;
  const z =
    Math.sin(elapsedSeconds * 0.19 + 1.4) * pitch.width * 0.27 +
    Math.cos(elapsedSeconds * 0.37) * pitch.width * 0.055;
  const bounce = Math.abs(Math.sin(elapsedSeconds * 2.4)) * 0.035;

  return [
    clamp(x, -halfLength, halfLength),
    0.16 + bounce,
    clamp(z, -halfWidth, halfWidth),
  ];
}

export function calculateMatchPlayerPose(
  player: MatchPlayer,
  elapsedSeconds: number,
  pitch: PitchDimensions,
  ballPosition = calculateBallPosition(elapsedSeconds, pitch),
): MatchPlayerPose {
  const [baseX, baseY, baseZ] = player.position;
  const cadence = player.role === 'goalkeeper' ? 0.42 : 0.64;
  const phase = elapsedSeconds * cadence + player.motionPhase;
  const ballInfluence = player.role === 'goalkeeper' ? 0.025 : 0.095;
  const halfLength = pitch.length / 2 - 1.4;
  const halfWidth = pitch.width / 2 - 1.2;
  const x = clamp(
    baseX +
      Math.sin(phase) * player.motionRadiusX +
      ballPosition[0] * ballInfluence,
    -halfLength,
    halfLength,
  );
  const goalkeeperWidthLimit = pitch.width * 0.18;
  const z = clamp(
    baseZ +
      Math.cos(phase * 0.83) * player.motionRadiusZ +
      ballPosition[2] * ballInfluence,
    player.role === 'goalkeeper' ? -goalkeeperWidthLimit : -halfWidth,
    player.role === 'goalkeeper' ? goalkeeperWidthLimit : halfWidth,
  );
  const y = baseY + Math.abs(Math.sin(phase * 2.15)) * 0.025;
  const rotationY = Math.atan2(ballPosition[0] - x, ballPosition[2] - z);

  return { position: [x, y, z], rotationY };
}

// Compatibility for older callers while the public concept remains a match layout.
export const createStaticPlayerLayout = createMatchPlayerLayout;
