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

export { DsSpinnerComponent }      from './ds-spinner/ds-spinner.component';

export { DsAlertComponent }          from './ds-alert/ds-alert';
export type { DsAlertConfig, AlertTone, AlertVariant } from './ds-alert/ds-alert.config';
export { DS_ALERT_DEFAULTS }         from './ds-alert/ds-alert.config';

export { DsBannerComponent }         from './ds-banner/ds-banner';
export type { DsBannerConfig, BannerVariant } from './ds-banner/ds-banner.config';
export { DS_BANNER_DEFAULTS }        from './ds-banner/ds-banner.config';

export { DsDividerComponent }        from './ds-divider/ds-divider';

export { DsBrandComponent }          from './ds-brand/ds-brand';
export type { DsBrandConfig, BrandSize } from './ds-brand/ds-brand.config';
export { DS_BRAND_DEFAULTS }         from './ds-brand/ds-brand.config';

export { DsCheckboxComponent }       from './ds-checkbox/ds-checkbox';

export { DsSsoButtonComponent }      from './ds-sso-button/ds-sso-button';

export { DsInputComponent }          from './ds-input/ds-input';
export type { DsInputConfig, InputSize } from './ds-input/ds-input.config';
export { DS_INPUT_DEFAULTS }         from './ds-input/ds-input.config';

export { DsLoadingInlineComponent }  from './ds-loading-inline/ds-loading-inline';
export type { DsLoadingInlineConfig, LoadingVariant } from './ds-loading-inline/ds-loading-inline.config';
export { DS_LOADING_INLINE_DEFAULTS } from './ds-loading-inline/ds-loading-inline.config';

export { DsToastContainerComponent } from './ds-toast/ds-toast-container.component';
export { ToastService }              from '../../core/services/toast.service';
export type { Toast, ToastTone }     from '../../core/services/toast.service';
