import { Vector3 } from 'three';

export type InteriorCalibrationViewId =
  | 'main-lower'
  | 'main-upper'
  | 'honor-balcony'
  | 'virage-one'
  | 'virage-two'
  | 'corner'
  | 'opposite-upper'
  | 'behind-goal'
  | 'player-entrance';

export type InteriorCalibrationView = {
  id: InteriorCalibrationViewId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  validates: string;
};

export const interiorCalibrationViews: InteriorCalibrationView[] = [
  {
    id: 'main-lower',
    label: 'Main stand · Lower tier',
    position: [0, 12.4, 74],
    target: [0, 1.2, 0],
    validates: 'lower-tier slope, track clearance, benches and tunnel',
  },
  {
    id: 'main-upper',
    label: 'Main stand · Upper tier',
    position: [0, 25.8, 96],
    target: [0, 1.4, 0],
    validates: 'upper-tier slope, roof coverage and opposite stand',
  },
  {
    id: 'honor-balcony',
    label: "Tribune d'honneur · منصة شرفية",
    position: [0, 15.4, 81.8],
    target: [0, 1.2, 0],
    validates: 'honor balcony, press wings and central player route',
  },
  {
    id: 'virage-one',
    label: 'Virage 1 · Standing terrace',
    position: [106, 14.8, 0],
    target: [0, 1.2, 0],
    validates: 'chairless terrace, end apron, goal and scoreboard',
  },
  {
    id: 'virage-two',
    label: 'Virage 2 · Standing terrace',
    position: [-106, 14.8, 0],
    target: [0, 1.2, 0],
    validates: 'chairless terrace and asymmetric athletics facilities',
  },
  {
    id: 'corner',
    label: 'Lower corner · Bowl junction',
    position: [78, 18.5, 57],
    target: [0, 1.2, 0],
    validates: 'corner aisle wedges, barriers and tier continuity',
  },
  {
    id: 'opposite-upper',
    label: 'Opposite stand · Upper tier',
    position: [0, 25.2, -95],
    target: [0, 1.3, 0],
    validates: 'main-stand facilities, roof truss and catwalk',
  },
  {
    id: 'behind-goal',
    label: 'Pitch level · Behind goal',
    position: [61.5, 2.1, 0],
    target: [0, 1.2, 0],
    validates: 'goal net, advertising boards and virage scale',
  },
  {
    id: 'player-entrance',
    label: 'Pitch level · Player entrance',
    position: [0, 2.05, 40],
    target: [0, 1.15, 0],
    validates: 'retractable tunnel, technical areas and sightline',
  },
];

export function getInteriorCalibrationCameraPose(
  viewId: InteriorCalibrationViewId,
) {
  const view =
    interiorCalibrationViews.find((candidate) => candidate.id === viewId) ??
    interiorCalibrationViews[0];
  return {
    position: new Vector3(...view.position),
    target: new Vector3(...view.target),
  };
}
