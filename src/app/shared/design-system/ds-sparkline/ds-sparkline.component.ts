import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DS_SPARKLINE_DEFAULTS } from './ds-sparkline.config';

export type { DsSparklineConfig } from './ds-sparkline.config';

@Component({
  selector: 'ds-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="width()" [attr.height]="height()" style="display:block;flex-shrink:0" aria-hidden="true">
      @if (fill()) {
        <path [attr.d]="paths().areaPath" [attr.fill]="color()" opacity="0.10" />
      }
      <path
        [attr.d]="paths().linePath"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class DsSparklineComponent {
  readonly points = input<number[]>([]);
  readonly width = input(DS_SPARKLINE_DEFAULTS.width);
  readonly height = input(DS_SPARKLINE_DEFAULTS.height);
  readonly color = input(DS_SPARKLINE_DEFAULTS.color);
  readonly fill = input(DS_SPARKLINE_DEFAULTS.fill);

  readonly paths = computed(() => {
    const pts = this.points();
    const width = this.width();
    const height = this.height();
    if (pts.length < 2) return { linePath: '', areaPath: '' };
    const max = Math.max(...pts);
    const min = Math.min(...pts);
    const range = max - min || 1;
    const step = width / (pts.length - 1);
    const coords = pts.map((p, i) => [
      i * step,
      height - ((p - min) / range) * (height - 4) - 2,
    ]);
    const line = coords.map(([x, y], i) =>
      `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    ).join(' ');
    return { linePath: line, areaPath: `${line} L${width} ${height} L0 ${height} Z` };
  });
}
