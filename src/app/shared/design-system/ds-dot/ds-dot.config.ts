import { DotTone } from '../tokens';

export interface DsDotConfig {
  /** Ton sémantique. Défaut : 'ok' */
  tone: DotTone;
  /** Diamètre en pixels. Défaut : 8 */
  size: number;
  /** Active l'animation de pulsation. Défaut : false */
  pulse: boolean;
}

export const DS_DOT_DEFAULTS: Readonly<DsDotConfig> = {
  tone: 'ok',
  size: 8,
  pulse: false,
};
