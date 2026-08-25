import { describe, expect, it } from 'vitest';

import { createArchedPortalGeometry } from './createArchedPortalGeometry';

describe('createArchedPortalGeometry', () => {
  it('creates a centred unit arch with an optional framed opening', () => {
    const portal = createArchedPortalGeometry();
    const frame = createArchedPortalGeometry({ frameThickness: 0.08 });

    expect(portal.boundingBox?.min.x).toBeCloseTo(-0.5, 5);
    expect(portal.boundingBox?.max.x).toBeCloseTo(0.5, 5);
    expect(portal.boundingBox?.min.y).toBeCloseTo(-0.5, 5);
    expect(portal.boundingBox?.max.y).toBeCloseTo(0.5, 5);
    expect(frame.getAttribute('position').count).toBeGreaterThan(
      portal.getAttribute('position').count,
    );

    portal.dispose();
    frame.dispose();
  });
});
