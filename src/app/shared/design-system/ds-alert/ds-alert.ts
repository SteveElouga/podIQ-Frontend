import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';
import { ALERT_ICON, DS_ALERT_DEFAULTS } from './ds-alert.config';

export type { DsAlertConfig, AlertTone, AlertVariant } from './ds-alert.config';

@Component({
  selector: 'ds-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  templateUrl: './ds-alert.html',
  styleUrl: './ds-alert.scss',
})
export class DsAlertComponent {
  readonly tone    = input(DS_ALERT_DEFAULTS.tone);
  readonly variant = input(DS_ALERT_DEFAULTS.variant);
  readonly icon    = input<string | null | undefined>(DS_ALERT_DEFAULTS.icon);

  readonly resolvedIcon = computed(() => {
    const explicit = this.icon();
    if (explicit === null) return null;
    if (explicit) return explicit;
    return ALERT_ICON[this.tone()] ?? 'alert';
  });

  readonly iconSize = computed(() => this.variant() === 'banner' ? 13 : 14);
}
