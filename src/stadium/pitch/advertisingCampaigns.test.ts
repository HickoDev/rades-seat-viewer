import { describe, expect, it } from 'vitest';

import {
  advertisingCampaignPhases,
  advertisingCampaigns,
} from './advertisingCampaigns';

describe('advertisingCampaigns', () => {
  it('keeps the requested creator destinations in priority order', () => {
    expect(advertisingCampaigns.map(({ id }) => id)).toEqual([
      'itch',
      'github',
      'instagram',
      'facebook',
    ]);
    expect(advertisingCampaigns.map(({ href }) => href)).toEqual([
      'https://hickodev.itch.io/',
      'https://github.com/HickoDev',
      'https://www.instagram.com/alidridi_9/?hl=en',
      'https://www.facebook.com/ali.dridi.319/',
    ]);
  });

  it('keeps Instagram and Facebook together in the contact phase', () => {
    expect(advertisingCampaignPhases).toEqual([
      ['itch'],
      ['github'],
      ['instagram', 'facebook'],
    ]);
  });

  it('provides complete board artwork copy for every destination', () => {
    for (const campaign of advertisingCampaigns) {
      expect(campaign.brand).not.toBe('');
      expect(campaign.eyebrow).not.toBe('');
      expect(campaign.headline).not.toBe('');
      expect(campaign.address).not.toBe('');
      expect(new URL(campaign.href).protocol).toBe('https:');
    }
  });
});
