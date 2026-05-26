export type BrandSize = 'sm' | 'md';

export interface DsBrandConfig {
  size: BrandSize;
  mark: string;
}

export const DS_BRAND_DEFAULTS: Readonly<DsBrandConfig> = {
  size: 'md',
  mark: 'P',
};
