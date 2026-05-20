import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DotTone } from '../tokens';
import { DS_DOT_DEFAULTS } from './ds-dot.config';

export type { DsDotConfig } from './ds-dot.config';

@Component({
  selector: 'ds-dot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="'ds-dot ds-dot--' + tone() + (pulse() ? ' ds-dot--pulse' : '')"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [attr.aria-label]="tone()"
      role="img"
    ></span>
  `,
  styleUrls: ['./ds-dot.component.scss'],
})
export class DsDotComponent {
  readonly tone  = input<DotTone>(DS_DOT_DEFAULTS.tone);
  readonly size  = input(DS_DOT_DEFAULTS.size);
  readonly pulse = input(DS_DOT_DEFAULTS.pulse);
}
