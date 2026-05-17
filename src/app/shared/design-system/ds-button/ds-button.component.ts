import { Component, Input } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';
import { ButtonVariant, ComponentSize, SIZE_ICON_PX } from '../tokens';
import { DsButtonConfig, DS_BUTTON_DEFAULTS } from './ds-button.config';

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [DsIconComponent],
  templateUrl: './ds-button.component.html',
  styleUrls: ['./ds-button.component.scss'],
})
export class DsButtonComponent {
  @Input() variant: ButtonVariant = DS_BUTTON_DEFAULTS.variant;
  @Input() size: ComponentSize    = DS_BUTTON_DEFAULTS.size;
  @Input() icon?: string;
  @Input() iconRight?: string;
  @Input() label?: string;
  @Input() full: boolean     = DS_BUTTON_DEFAULTS.full;
  @Input() disabled: boolean = DS_BUTTON_DEFAULTS.disabled;
  @Input() loading: boolean  = DS_BUTTON_DEFAULTS.loading;
  @Input() type: 'button' | 'submit' | 'reset' = DS_BUTTON_DEFAULTS.type;

  /** Config object — les inputs individuels déclarés après ont priorité */
  @Input() set config(cfg: Partial<DsButtonConfig>) {
    if (cfg.variant   !== undefined) this.variant   = cfg.variant;
    if (cfg.size      !== undefined) this.size      = cfg.size;
    if (cfg.icon      !== undefined) this.icon      = cfg.icon;
    if (cfg.iconRight !== undefined) this.iconRight = cfg.iconRight;
    if (cfg.label     !== undefined) this.label     = cfg.label;
    if (cfg.full      !== undefined) this.full      = cfg.full;
    if (cfg.disabled  !== undefined) this.disabled  = cfg.disabled;
    if (cfg.loading   !== undefined) this.loading   = cfg.loading;
    if (cfg.type      !== undefined) this.type      = cfg.type;
  }

  get classes(): string {
    const base = `ds-btn ds-btn--${this.variant} ds-btn--${this.size}`;
    return this.full ? `${base} ds-btn--full` : base;
  }

  get iconSize(): number {
    return SIZE_ICON_PX[this.size];
  }

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }
}
