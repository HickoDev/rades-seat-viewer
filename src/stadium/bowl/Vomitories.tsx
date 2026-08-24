import type { StadiumConfig } from '../types/stadium.types';

type TierConfig = StadiumConfig['tiers'][number];

export function Vomitories({ tier }: { tier: TierConfig }) {
  return (
    <group name={`${tier.id}-vomitories`}>
      {Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
        if (sectionIndex % tier.vomitoryEverySections !== 0) {
          return null;
        }

        const angle = ((sectionIndex + 0.5) / tier.sectionCount) * Math.PI * 2;
        const radiusX = tier.startRadiusX + tier.vomitoryRow * tier.rowDepth;
        const radiusZ = tier.startRadiusZ + tier.vomitoryRow * tier.rowDepth;
        const height =
          tier.baseHeight +
          tier.vomitoryRow * tier.rowHeight +
          tier.vomitoryHeight / 2;

        return (
          <mesh
            key={sectionIndex}
            name={`${tier.id}-vomitory-${sectionIndex + 1}`}
            position={[
              Math.cos(angle) * radiusX,
              height,
              Math.sin(angle) * radiusZ,
            ]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            <boxGeometry
              args={[tier.vomitoryWidth, tier.vomitoryHeight, 1.1]}
            />
            <meshStandardMaterial color="#101713" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}
