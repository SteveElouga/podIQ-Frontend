import { ButtonVariant, ComponentSize } from '../tokens';

export interface DsButtonConfig {
  /** Variante visuelle. Défaut : 'secondary' */
  variant: ButtonVariant;
  /** Taille. Défaut : 'md' */
  size: ComponentSize;
  /** Icône Lucide à gauche du libellé */
  icon?: string;
  /** Icône Lucide à droite du libellé */
  iconRight?: string;
  /** Libellé textuel (alternatif à ng-content) */
  label?: string;
  /** Prend toute la largeur disponible. Défaut : false */
  full: boolean;
  /** Désactivé. Défaut : false */
  disabled: boolean;
  /** Affiche un spinner et bloque l'interaction. Défaut : false */
  loading: boolean;
  /** Type HTML natif. Défaut : 'button' */
  type: 'button' | 'submit' | 'reset';
}

export const DS_BUTTON_DEFAULTS: Readonly<DsButtonConfig> = {
  variant:  'secondary',
  size:     'md',
  full:     false,
  disabled: false,
  loading:  false,
  type:     'button',
};
