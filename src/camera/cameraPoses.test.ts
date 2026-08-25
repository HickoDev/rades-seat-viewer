import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { getSectionCameraPose } from './cameraPoses';

describe('getSectionCameraPose', () => {
  it('keeps the section-focus camera inside the bowl and aimed outward', () => {
    const pose = getSectionCameraPose('lower-09');
    const horizontalCameraRadius = Math.hypot(pose.position.x, pose.position.z);
    const horizontalTargetRadius = Math.hypot(pose.target.x, pose.target.z);

    expect(horizontalCameraRadius).toBeLessThan(horizontalTargetRadius);
    expect(horizontalCameraRadius).toBeLessThan(
      radesStadiumConfig.roof.innerRadiusZ,
    );
    expect(pose.position.y).toBeGreaterThan(pose.target.y);
    expect(pose.position.y).toBeLessThan(radesStadiumConfig.roof.innerHeight);
  });
});
