import { describe, expect, it } from 'vitest';

import { createPlayerTunnelFrameMatrices } from './createPlayerTunnelFrameMatrices';

describe('createPlayerTunnelFrameMatrices', () => {
  it('creates repeated portal ribs, side scissor braces, and wheeled bases', () => {
    const frameCount = 16;
    const layout = createPlayerTunnelFrameMatrices({
      eaveHeight: 2.5,
      frameCount,
      frameRadius: 0.045,
      length: 30,
      ridgeHeight: 3.25,
      width: 5.2,
    });

    expect(layout.frameMembers).toHaveLength(
      frameCount * 4 + (frameCount - 1) * 4,
    );
    expect(layout.wheelPositions).toHaveLength(frameCount * 2);
    expect(
      layout.frameMembers.every((matrix) =>
        matrix.elements.every(Number.isFinite),
      ),
    ).toBe(true);
  });
});
