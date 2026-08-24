export type AccessRampPlacement = {
  x: number;
  z: number;
};

export function createAccessRampPlacements({
  centerXs,
  centerZ,
  count,
  entranceSide,
}: {
  centerXs: number[];
  centerZ: number;
  count: number;
  entranceSide: -1 | 1;
}): AccessRampPlacement[] {
  return centerXs.slice(0, count).map((x) => ({
    x,
    z: entranceSide * Math.abs(centerZ),
  }));
}
