import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DsSpinnerComponent } from '../ds-spinner/ds-spinner.component';
import { DS_LOADING_INLINE_DEFAULTS } from './ds-loading-inline.config';

export type { DsLoadingInlineConfig, LoadingVariant } from './ds-loading-inline.config';

@Component({
  selector: 'ds-loading-inline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsSpinnerComponent],
  template: `
    <span [class]="'ds-loading-inline ds-loading-inline--' + variant()">
      @if (variant() === 'spinner') {
        <ds-spinner [size]="size()" [stroke]="2" />
      } @else {
        <span class="ds-loading-inline__dot"></span>
      }
      @if (label()) {
        <span class="ds-loading-inline__text">{{ label() }}</span>
      }
    </span>
  `,
  styleUrl: './ds-loading-inline.scss',
})
export class DsLoadingInlineComponent {
  readonly label   = input<string>();
  readonly variant = input(DS_LOADING_INLINE_DEFAULTS.variant);
  readonly size    = input(DS_LOADING_INLINE_DEFAULTS.size);
}
