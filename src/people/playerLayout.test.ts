import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import {
  calculateBallPosition,
  calculateMatchPlayerPose,
  createMatchPlayerLayout,
} from './playerLayout';

const players = createMatchPlayerLayout(radesStadiumConfig.pitch);

describe('createMatchPlayerLayout', () => {
  it('places two teams of eleven including their goalkeepers', () => {
    expect(players).toHaveLength(22);
    expect(players.filter((player) => player.team === 'home')).toHaveLength(11);
    expect(players.filter((player) => player.team === 'away')).toHaveLength(11);
    expect(
      players.filter((player) => player.role === 'goalkeeper'),
    ).toHaveLength(2);
    expect(new Set(players.map((player) => player.id)).size).toBe(22);
  });

  it('keeps every player inside the field of play and facing inward', () => {
    const halfLength = radesStadiumConfig.pitch.length / 2;
    const halfWidth = radesStadiumConfig.pitch.width / 2;

    players.forEach((player) => {
      expect(Math.abs(player.position[0])).toBeLessThan(halfLength);
      expect(Math.abs(player.position[2])).toBeLessThan(halfWidth);
      const forwardX = Math.sin(player.rotationY);
      const forwardZ = Math.cos(player.rotationY);
      const towardCenterX = -player.position[0];
      const towardCenterZ = -player.position[2];
      expect(
        forwardX * towardCenterX + forwardZ * towardCenterZ,
      ).toBeGreaterThan(0);
    });
  });

  it('keeps the animated ball and players inside the field of play', () => {
    const halfLength = radesStadiumConfig.pitch.length / 2;
    const halfWidth = radesStadiumConfig.pitch.width / 2;

    for (let elapsedSeconds = 0; elapsedSeconds <= 180; elapsedSeconds += 7.5) {
      const ball = calculateBallPosition(
        elapsedSeconds,
        radesStadiumConfig.pitch,
      );
      expect(Math.abs(ball[0])).toBeLessThan(halfLength);
      expect(Math.abs(ball[2])).toBeLessThan(halfWidth);

      players.forEach((player) => {
        const pose = calculateMatchPlayerPose(
          player,
          elapsedSeconds,
          radesStadiumConfig.pitch,
          ball,
        );
        expect(Math.abs(pose.position[0])).toBeLessThan(halfLength);
        expect(Math.abs(pose.position[2])).toBeLessThan(halfWidth);
        if (player.role === 'goalkeeper') {
          expect(Math.abs(pose.position[2])).toBeLessThan(
            radesStadiumConfig.pitch.width * 0.2,
          );
        }
      });
    }
  });

  it('moves outfield players through deterministic match-like routes', () => {
    const player = players.find((candidate) => candidate.role === 'outfield');
    expect(player).toBeDefined();
    if (!player) return;

    const start = calculateMatchPlayerPose(player, 0, radesStadiumConfig.pitch);
    const later = calculateMatchPlayerPose(player, 8, radesStadiumConfig.pitch);
    expect(later.position).not.toEqual(start.position);
    expect(later.rotationY).not.toBe(start.rotationY);
    expect(later.movementSpeed).toBeGreaterThan(0);
    expect(later.movementSpeed).toBeLessThan(10);
    expect(later.leanRadians).toBeGreaterThanOrEqual(0);
    expect(later.leanRadians).toBeLessThanOrEqual(0.1);
  });

  it('moves the ball through smooth dribbles and short passes', () => {
    let previous = calculateBallPosition(0, radesStadiumConfig.pitch);
    let maximumStep = 0;
    let maximumHeight = previous[1];

    for (
      let elapsedSeconds = 0.1;
      elapsedSeconds <= 60;
      elapsedSeconds += 0.1
    ) {
      const next = calculateBallPosition(
        elapsedSeconds,
        radesStadiumConfig.pitch,
      );
      maximumStep = Math.max(
        maximumStep,
        Math.hypot(next[0] - previous[0], next[2] - previous[2]),
      );
      maximumHeight = Math.max(maximumHeight, next[1]);
      previous = next;
    }

    expect(maximumStep).toBeLessThan(1.2);
    expect(maximumHeight).toBeGreaterThan(0.45);
    expect(maximumHeight).toBeLessThan(0.65);
  });
});
