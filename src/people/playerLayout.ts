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
  movementSpeed: number;
  stridePhase: number;
  leanRadians: number;
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

const ballRoute: ReadonlyArray<readonly [number, number]> = [
  [-0.34, -0.08],
  [-0.18, 0.24],
  [0.03, 0.12],
  [0.3, -0.2],
  [0.16, -0.04],
  [-0.08, -0.26],
  [-0.31, 0.17],
  [-0.12, 0.04],
];

const ballRouteSegmentSeconds = 5.5;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function calculatePlayerGroundPosition(
  player: MatchPlayer,
  elapsedSeconds: number,
  pitch: PitchDimensions,
  ballPosition: [number, number, number],
): [number, number] {
  const [baseX, , baseZ] = player.position;
  const phase =
    elapsedSeconds * (player.role === 'goalkeeper' ? 0.48 : 0.62) +
    player.motionPhase;
  const halfLength = pitch.length / 2 - 1.4;
  const halfWidth = pitch.width / 2 - 1.2;

  if (player.role === 'goalkeeper') {
    return [
      clamp(
        baseX +
          Math.sin(phase * 0.72) * player.motionRadiusX +
          ballPosition[0] * 0.018,
        -halfLength,
        halfLength,
      ),
      clamp(
        baseZ +
          Math.cos(phase) * player.motionRadiusZ +
          ballPosition[2] * 0.045,
        -pitch.width * 0.18,
        pitch.width * 0.18,
      ),
    ];
  }

  const routeX =
    Math.sin(phase) * player.motionRadiusX +
    Math.sin(phase * 0.43 + player.motionPhase) * 0.9;
  const routeZ =
    Math.cos(phase * 0.81) * player.motionRadiusZ +
    Math.sin(phase * 0.37 + player.motionPhase) * 0.7;
  const tacticalX = baseX + routeX + ballPosition[0] * 0.16;
  const tacticalZ = baseZ + routeZ + ballPosition[2] * 0.12;
  const distanceToBall = Math.hypot(
    ballPosition[0] - tacticalX,
    ballPosition[2] - tacticalZ,
  );
  const proximity = clamp(1 - distanceToBall / 27, 0, 1);
  const engagement = proximity * proximity * 0.78;
  const contestRadius = 1.05 + (player.motionPhase % 1.8);
  const contestX =
    ballPosition[0] + Math.cos(player.motionPhase) * contestRadius;
  const contestZ =
    ballPosition[2] + Math.sin(player.motionPhase) * contestRadius;

  return [
    clamp(lerp(tacticalX, contestX, engagement), -halfLength, halfLength),
    clamp(lerp(tacticalZ, contestZ, engagement), -halfWidth, halfWidth),
  ];
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
  const routeTime = Math.max(0, elapsedSeconds) / ballRouteSegmentSeconds;
  const segmentIndex = Math.floor(routeTime) % ballRoute.length;
  const nextIndex = (segmentIndex + 1) % ballRoute.length;
  const progress = routeTime - Math.floor(routeTime);
  const easedProgress = smoothstep(progress);
  const start = ballRoute[segmentIndex];
  const end = ballRoute[nextIndex];
  const x = lerp(start[0], end[0], easedProgress) * pitch.length;
  const z = lerp(start[1], end[1], easedProgress) * pitch.width;
  const passLift =
    Math.sin(progress * Math.PI) ** 2 * (segmentIndex % 3 === 1 ? 0.42 : 0.08);
  const dribbleBounce =
    Math.abs(Math.sin(elapsedSeconds * 6.2)) *
    (0.025 + Math.sin(progress * Math.PI) * 0.02);

  return [
    clamp(x, -halfLength, halfLength),
    0.13 + passLift + dribbleBounce,
    clamp(z, -halfWidth, halfWidth),
  ];
}

export function calculateMatchPlayerPose(
  player: MatchPlayer,
  elapsedSeconds: number,
  pitch: PitchDimensions,
  ballPosition = calculateBallPosition(elapsedSeconds, pitch),
): MatchPlayerPose {
  const [, baseY] = player.position;
  const [x, z] = calculatePlayerGroundPosition(
    player,
    elapsedSeconds,
    pitch,
    ballPosition,
  );
  const sampleSeconds = 0.08;
  const futureBall = calculateBallPosition(
    elapsedSeconds + sampleSeconds,
    pitch,
  );
  const [futureX, futureZ] = calculatePlayerGroundPosition(
    player,
    elapsedSeconds + sampleSeconds,
    pitch,
    futureBall,
  );
  const velocityX = (futureX - x) / sampleSeconds;
  const velocityZ = (futureZ - z) / sampleSeconds;
  const movementSpeed = Math.hypot(velocityX, velocityZ);
  const stridePhase =
    elapsedSeconds * (3.8 + clamp(movementSpeed, 0, 7) * 0.72) +
    player.motionPhase;
  const strideHeight =
    Math.abs(Math.sin(stridePhase)) *
    clamp((movementSpeed - 0.2) * 0.008, 0, 0.052);
  const moving = movementSpeed > 0.18;
  const rotationY = moving
    ? Math.atan2(velocityX, velocityZ)
    : Math.atan2(ballPosition[0] - x, ballPosition[2] - z);
  const leanRadians = clamp(movementSpeed * 0.012, 0, 0.1);

  return {
    position: [x, baseY + strideHeight, z],
    rotationY,
    movementSpeed,
    stridePhase,
    leanRadians,
  };
}

// Compatibility for older callers while the public concept remains a match layout.
export const createStaticPlayerLayout = createMatchPlayerLayout;
