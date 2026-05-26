// ─── Couleurs sémantiques Cobalt ─────────────────────────────────────────────

/** Tons de statut opérationnel (états système) */
export type SemanticTone = 'ok' | 'warn' | 'crit' | 'info';

/** Toutes les intentions de couleur disponibles dans le design system */
export type ColorIntent =
  | 'primary'   // --accent (orange PodIQ)
  | 'ok'        // --ok     (vert forêt)
  | 'warn'      // --warn   (ambre)
  | 'crit'      // --crit   (rouge profond)
  | 'info'      // --info   (teal)
  | 'neutral'   // --ink-2
  | 'mute'      // --ink-mute
  | 'ink'       // --ink (inverse, fond sombre)
  | 'surface';  // --surface

/** Correspondance intention → CSS variable */
export const COLOR_VAR: Record<ColorIntent, string> = {
  primary: 'var(--accent)',
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  crit: 'var(--crit)',
  info: 'var(--info)',
  neutral: 'var(--ink-2)',
  mute: 'var(--ink-mute)',
  ink: 'var(--ink)',
  surface: 'var(--surface)',
};

/** Tons disponibles pour les tags/badges */
export type TagTone =
  | 'neutral' | 'accent' | 'ok' | 'warn' | 'crit' | 'info' | 'outline' | 'ink';

/** Tons disponibles pour les indicateurs de statut (dot) */
export type DotTone = 'ok' | 'warn' | 'crit' | 'mute' | 'accent' | 'info';

/** Variantes visuelles des boutons */
export type ButtonVariant =
  | 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
