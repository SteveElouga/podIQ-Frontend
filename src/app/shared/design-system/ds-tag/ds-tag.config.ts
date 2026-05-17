import { TagTone } from '../tokens';

export interface DsTagConfig {
  /** Ton sémantique. Défaut : 'neutral' */
  tone: TagTone;
  /** Icône Lucide facultative à gauche du libellé */
  icon?: string;
  /** Libellé textuel (alternatif à ng-content) */
  label?: string;
}

export const DS_TAG_DEFAULTS: Readonly<DsTagConfig> = {
  tone: 'neutral',
};
