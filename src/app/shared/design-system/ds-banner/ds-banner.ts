import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';
import { BANNER_DEFAULT_ICON, DS_BANNER_DEFAULTS } from './ds-banner.config';

export type { DsBannerConfig, BannerVariant } from './ds-banner.config';

@Component({
  selector: 'ds-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  templateUrl: './ds-banner.html',
  styleUrl: './ds-banner.scss',
})
export class DsBannerComponent {
  readonly variant = input(DS_BANNER_DEFAULTS.variant);
  readonly icon = input<string | null | undefined>(DS_BANNER_DEFAULTS.icon);

  readonly resolvedIcon = computed(() => {
    const explicit = this.icon();
    if (explicit === null) return null;
    if (explicit) return explicit;
    return BANNER_DEFAULT_ICON[this.variant()];
  });

  readonly iconSize = computed(() => 16);
  readonly iconClass = computed(() => '');
}
