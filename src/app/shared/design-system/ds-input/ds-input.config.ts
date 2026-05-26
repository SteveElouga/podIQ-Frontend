export type InputSize = 'sm' | 'md';

export interface DsInputConfig {
  size: InputSize;
}

export const DS_INPUT_DEFAULTS: Readonly<DsInputConfig> = {
  size: 'sm',
};
