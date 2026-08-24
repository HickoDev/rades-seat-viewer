import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { createStaticPlayerLayout } from './playerLayout';

const players = createStaticPlayerLayout(radesStadiumConfig.pitch);

describe('createStaticPlayerLayout', () => {
  it('places two static teams of eleven including their goalkeepers', () => {
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
});
