import { Vector3 } from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';

export type CameraPose = {
  position: Vector3;
  target: Vector3;
};

export function getOverviewCameraPose(): CameraPose {
  const siteRadius = radesStadiumConfig.roof.outerRadiusX;
  return {
    position: new Vector3(
      siteRadius * 1.2,
      siteRadius * 1.55,
      siteRadius * 3.25,
    ),
    target: new Vector3(0, radesStadiumConfig.roof.innerHeight * 0.2, 0),
  };
}

export function getSectionCameraPose(sectionId: string): CameraPose {
  const [tierId, sectionNumberText] = sectionId.split('-');
  const tier =
    radesStadiumConfig.tiers.find((candidate) => candidate.id === tierId) ??
    radesStadiumConfig.tiers[0];
  const sectionNumber = Math.max(1, Number(sectionNumberText) || 1);
  const angle = ((sectionNumber - 0.5) / tier.sectionCount) * Math.PI * 2;
  const targetRadiusX =
    tier.startRadiusX + tier.rowCount * tier.rowDepth * 0.52;
  const targetRadiusZ =
    tier.startRadiusZ + tier.rowCount * tier.rowDepth * 0.52;
  const target = new Vector3(
    Math.cos(angle) * targetRadiusX,
    tier.baseHeight + tier.rowCount * tier.rowHeight * 0.52,
    Math.sin(angle) * targetRadiusZ,
  );
  const outward = new Vector3(Math.cos(angle), 0, Math.sin(angle));
  const focusDistance =
    tier.id === 'upper'
      ? radesStadiumConfig.pitch.width * 1.18
      : radesStadiumConfig.pitch.width * 1.02;
  const position = target.clone().addScaledVector(outward, -focusDistance);
  position.y = Math.max(
    target.y + 13,
    radesStadiumConfig.roof.innerHeight * 0.6,
  );

  return { position, target };
}
