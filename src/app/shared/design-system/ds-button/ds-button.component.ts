import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';
import { ButtonVariant, ComponentSize, SIZE_ICON_PX } from '../tokens';
import { DS_BUTTON_DEFAULTS } from './ds-button.config';

export type { DsButtonConfig } from './ds-button.config';

@Component({
  selector: 'ds-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  templateUrl: './ds-button.component.html',
  styleUrls: ['./ds-button.component.scss'],
})
export class DsButtonComponent {
  readonly variant   = input<ButtonVariant>(DS_BUTTON_DEFAULTS.variant);
  readonly size      = input<ComponentSize>(DS_BUTTON_DEFAULTS.size);
  readonly icon      = input<string>();
  readonly iconRight = input<string>();
  readonly label     = input<string>();
  readonly full      = input(DS_BUTTON_DEFAULTS.full);
  readonly disabled  = input(DS_BUTTON_DEFAULTS.disabled);
  readonly loading   = input(DS_BUTTON_DEFAULTS.loading);
  readonly type      = input<'button' | 'submit' | 'reset'>(DS_BUTTON_DEFAULTS.type);

  readonly classes = computed(() => {
    const base = `ds-btn ds-btn--${this.variant()} ds-btn--${this.size()}`;
    return this.full() ? `${base} ds-btn--full` : base;
  });

  readonly iconSize = computed(() => SIZE_ICON_PX[this.size()]);

  readonly isDisabled = computed(() => this.disabled() || this.loading());
}
