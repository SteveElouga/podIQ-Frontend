export type LoadingVariant = 'spinner' | 'dot';

export interface DsLoadingInlineConfig {
  variant: LoadingVariant;
  size: number;
}

export const DS_LOADING_INLINE_DEFAULTS: Readonly<DsLoadingInlineConfig> = {
  variant: 'spinner',
  size: 14,
};
