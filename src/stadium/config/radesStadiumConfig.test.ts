import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from './radesStadiumConfig';

describe('radesStadiumConfig', () => {
  it('keeps the verified foundation measurements explicit', () => {
    expect(radesStadiumConfig.pitch).toEqual({ length: 105, width: 68 });
    expect(radesStadiumConfig.structure.frameCount).toBe(64);
    expect(radesStadiumConfig.identity.timezone).toBe('Africa/Tunis');

    expect(radesStadiumConfig.verification.values['pitch.length']).toBe(
      'verified-from-project-brief',
    );
    expect(radesStadiumConfig.verification.values.roof).toBe(
      'estimate-requires-calibration',
    );
  });
});
