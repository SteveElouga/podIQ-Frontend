// ─── PodIQ Design System — Cobalt ────────────────────────────────────────────
// Point d'entrée unique. Importer depuis ici dans tous les feature modules.
// Exemple : import { DsButtonComponent, DsTagComponent } from '@shared/design-system';

// Tokens
export * from './tokens';

// Composants
export { DsIconComponent }      from './ds-icon/ds-icon.component';
export type { DsIconConfig }    from './ds-icon/ds-icon.component';

export { DsButtonComponent }    from './ds-button/ds-button.component';
export type { DsButtonConfig }  from './ds-button/ds-button.config';
export { DS_BUTTON_DEFAULTS }   from './ds-button/ds-button.config';

export { DsTagComponent }       from './ds-tag/ds-tag.component';
export type { DsTagConfig }     from './ds-tag/ds-tag.config';
export { DS_TAG_DEFAULTS }      from './ds-tag/ds-tag.config';

export { DsDotComponent }       from './ds-dot/ds-dot.component';
export type { DsDotConfig }     from './ds-dot/ds-dot.config';
export { DS_DOT_DEFAULTS }      from './ds-dot/ds-dot.config';

export { DsSparklineComponent } from './ds-sparkline/ds-sparkline.component';
export type { DsSparklineConfig } from './ds-sparkline/ds-sparkline.config';
export { DS_SPARKLINE_DEFAULTS } from './ds-sparkline/ds-sparkline.config';

export { DsLangSwitcherComponent } from './ds-lang-switcher/ds-lang-switcher.component';
