export type BannerVariant = 'promo' | 'note';

export interface DsBannerConfig {
  variant: BannerVariant;
  icon: string | null;
}

export const DS_BANNER_DEFAULTS: Readonly<DsBannerConfig> = {
  variant: 'promo',
  icon: null,
};

export const BANNER_DEFAULT_ICON: Record<BannerVariant, string | null> = {
  promo: 'bolt',
  note:  'shield',
};
