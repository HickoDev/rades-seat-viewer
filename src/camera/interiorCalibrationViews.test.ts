import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import {
  getInteriorCalibrationCameraPose,
  interiorCalibrationViews,
} from './interiorCalibrationViews';

describe('interior calibration views', () => {
  it('keeps every validation camera inside the stadium envelope and below the roof', () => {
    interiorCalibrationViews.forEach((view) => {
      const pose = getInteriorCalibrationCameraPose(view.id);
      expect(Math.abs(pose.position.x)).toBeLessThan(
        radesStadiumConfig.roof.outerRadiusX,
      );
      expect(Math.abs(pose.position.z)).toBeLessThan(
        radesStadiumConfig.roof.outerRadiusZ,
      );
      expect(pose.position.y).toBeGreaterThan(1);
      expect(pose.position.y).toBeLessThan(radesStadiumConfig.roof.innerHeight);
      expect(pose.position.distanceTo(pose.target)).toBeGreaterThan(20);
    });
  });

  it('covers both virages and raises the upper main-stand view', () => {
    const firstVirage = getInteriorCalibrationCameraPose('virage-one');
    const secondVirage = getInteriorCalibrationCameraPose('virage-two');
    const lower = getInteriorCalibrationCameraPose('main-lower');
    const upper = getInteriorCalibrationCameraPose('main-upper');

    expect(Math.sign(firstVirage.position.x)).toBe(
      -Math.sign(secondVirage.position.x),
    );
    expect(upper.position.y).toBeGreaterThan(lower.position.y);
  });
});
