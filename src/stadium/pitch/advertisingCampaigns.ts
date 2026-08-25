export type AdvertisingCampaign = {
  id: 'itch' | 'github' | 'instagram';
  brand: string;
  eyebrow: string;
  headline: string;
  address: string;
  href: string;
  background: string;
  foreground: string;
  accent: string;
};

/**
 * Pitch-side LED campaign order. The itch.io portfolio is deliberately first
 * because it is the primary destination requested by the project owner.
 */
export const advertisingCampaigns = [
  {
    id: 'itch',
    brand: 'HICKODEV',
    eyebrow: 'INDEPENDENT GAMES',
    headline: 'PLAY MY GAMES',
    address: 'HICKODEV.ITCH.IO',
    href: 'https://hickodev.itch.io/',
    background: '#151311',
    foreground: '#fff7e8',
    accent: '#fa5c5c',
  },
  {
    id: 'github',
    brand: 'HICKODEV',
    eyebrow: 'CODE / EXPERIMENTS / BUILDS',
    headline: 'EXPLORE THE WORK',
    address: 'GITHUB.COM/HICKODEV',
    href: 'https://github.com/HickoDev',
    background: '#0d1117',
    foreground: '#f0f6fc',
    accent: '#58a6ff',
  },
  {
    id: 'instagram',
    brand: 'ALI DRIDI',
    eyebrow: 'PROCESS / PREVIEWS / UPDATES',
    headline: 'FOLLOW THE BUILD',
    address: '@ALIDRIDI_9',
    href: 'https://www.instagram.com/alidridi_9/?hl=en',
    background: '#24131d',
    foreground: '#fff5ef',
    accent: '#f29a72',
  },
] as const satisfies readonly AdvertisingCampaign[];

export const advertisingRotationIntervalMs = 6_500;
