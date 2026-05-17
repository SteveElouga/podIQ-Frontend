// ─── Tailles composants Cobalt (grille 4pt) ──────────────────────────────────

/** Taille de composant unifiée — s'applique aux boutons, champs, chips */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Hauteur en pixels par taille */
export const SIZE_HEIGHT_PX: Record<ComponentSize, number> = {
  xs: 24,
  sm: 28,
  md: 34,
  lg: 40,
  xl: 48,
};

/** Padding horizontal en pixels par taille */
export const SIZE_PADDING_X: Record<ComponentSize, number> = {
  xs: 6,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
};

/** Taille de police CSS par taille */
export const SIZE_FONT_VAR: Record<ComponentSize, string> = {
  xs: 'var(--fs-xs)',
  sm: 'var(--fs-sm)',
  md: 'var(--fs-md)',
  lg: 'var(--fs-lg)',
  xl: 'var(--fs-xl)',
};

/** Taille des icônes en pixels par taille de composant */
export const SIZE_ICON_PX: Record<ComponentSize, number> = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
};

/** Gap entre éléments en pixels par taille */
export const SIZE_GAP_PX: Record<ComponentSize, number> = {
  xs: 4,
  sm: 5,
  md: 6,
  lg: 8,
  xl: 10,
};
