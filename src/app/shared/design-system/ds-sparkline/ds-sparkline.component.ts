import { Component, Input } from '@angular/core';
import { DsSparklineConfig, DS_SPARKLINE_DEFAULTS } from './ds-sparkline.config';

@Component({
  selector: 'ds-sparkline',
  standalone: true,
  template: `
    <svg [attr.width]="width" [attr.height]="height" style="display:block;flex-shrink:0" aria-hidden="true">
      @if (fill) {
        <path [attr.d]="areaPath" [attr.fill]="color" opacity="0.10" />
      }
      <path
        [attr.d]="linePath"
        fill="none"
        [attr.stroke]="color"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class DsSparklineComponent {
  @Input() points: number[] = [];
  @Input() width:  number   = DS_SPARKLINE_DEFAULTS.width;
  @Input() height: number   = DS_SPARKLINE_DEFAULTS.height;
  @Input() color:  string   = DS_SPARKLINE_DEFAULTS.color;
  @Input() fill:   boolean  = DS_SPARKLINE_DEFAULTS.fill;

  @Input() set config(cfg: Partial<DsSparklineConfig>) {
    if (cfg.points !== undefined) this.points = cfg.points;
    if (cfg.width  !== undefined) this.width  = cfg.width;
    if (cfg.height !== undefined) this.height = cfg.height;
    if (cfg.color  !== undefined) this.color  = cfg.color;
    if (cfg.fill   !== undefined) this.fill   = cfg.fill;
  }

  private get computed(): { linePath: string; areaPath: string } {
    const { points, width, height } = this;
    if (points.length < 2) return { linePath: '', areaPath: '' };
    const max   = Math.max(...points);
    const min   = Math.min(...points);
    const range = max - min || 1;
    const step  = width / (points.length - 1);
    const pts   = points.map((p, i) => [
      i * step,
      height - ((p - min) / range) * (height - 4) - 2,
    ]);
    const line = pts.map(([x, y], i) =>
      `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    ).join(' ');
    return { linePath: line, areaPath: `${line} L${width} ${height} L0 ${height} Z` };
  }

  get linePath(): string { return this.computed.linePath; }
  get areaPath(): string { return this.computed.areaPath; }
}
