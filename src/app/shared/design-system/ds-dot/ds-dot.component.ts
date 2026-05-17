import { Component, Input } from '@angular/core';
import { DotTone } from '../tokens';
import { DsDotConfig, DS_DOT_DEFAULTS } from './ds-dot.config';

@Component({
  selector: 'ds-dot',
  standalone: true,
  template: `
    <span
      [class]="'ds-dot ds-dot--' + tone + (pulse ? ' ds-dot--pulse' : '')"
      [style.width.px]="size"
      [style.height.px]="size"
      [attr.aria-label]="tone"
      role="img"
    ></span>
  `,
  styleUrls: ['./ds-dot.component.scss'],
})
export class DsDotComponent {
  @Input() tone:  DotTone = DS_DOT_DEFAULTS.tone;
  @Input() size:  number  = DS_DOT_DEFAULTS.size;
  @Input() pulse: boolean = DS_DOT_DEFAULTS.pulse;

  @Input() set config(cfg: Partial<DsDotConfig>) {
    if (cfg.tone  !== undefined) this.tone  = cfg.tone;
    if (cfg.size  !== undefined) this.size  = cfg.size;
    if (cfg.pulse !== undefined) this.pulse = cfg.pulse;
  }
}
