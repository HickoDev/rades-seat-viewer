export type AdvertisingCampaign = {
  id: AdvertisingCampaignId;
  brand: string;
  eyebrow: string;
  headline: string;
  address: string;
  href: string;
  background: string;
  foreground: string;
  accent: string;
};

export type AdvertisingCampaignId =
  'itch' | 'github' | 'instagram' | 'facebook';

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
    eyebrow: 'MY SOCIALS / LET US TALK',
    headline: 'CONTACT ME',
    address: 'INSTAGRAM / @ALIDRIDI_9',
    href: 'https://www.instagram.com/alidridi_9/?hl=en',
    background: '#24131d',
    foreground: '#fff5ef',
    accent: '#f29a72',
  },
  {
    id: 'facebook',
    brand: 'ALI DRIDI',
    eyebrow: 'MY SOCIALS / LET US TALK',
    headline: 'CONTACT ME',
    address: 'FACEBOOK / ALI DRIDI',
    href: 'https://www.facebook.com/ali.dridi.319/',
    background: '#132238',
    foreground: '#f5f8ff',
    accent: '#75a7f7',
  },
] as const satisfies readonly AdvertisingCampaign[];

/**
 * The final rotation step is one social/contact phase. Its two destinations
 * alternate across adjacent boards so Instagram and Facebook appear together.
 */
export const advertisingCampaignPhases: readonly (readonly AdvertisingCampaignId[])[] =
  [['itch'], ['github'], ['instagram', 'facebook']];

export const advertisingRotationIntervalMs = 6_500;
