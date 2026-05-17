import { Component, Input } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';
import { TagTone } from '../tokens';
import { DsTagConfig, DS_TAG_DEFAULTS } from './ds-tag.config';

@Component({
  selector: 'ds-tag',
  standalone: true,
  imports: [DsIconComponent],
  template: `
    <span [class]="'ds-tag ds-tag--' + tone">
      @if (icon) { <ds-icon [name]="icon" [size]="10" [stroke]="2" /> }
      @if (label) { {{ label }} } @else { <ng-content /> }
    </span>
  `,
  styleUrls: ['./ds-tag.component.scss'],
})
export class DsTagComponent {
  @Input() tone: TagTone = DS_TAG_DEFAULTS.tone;
  @Input() icon?: string;
  @Input() label?: string;

  @Input() set config(cfg: Partial<DsTagConfig>) {
    if (cfg.tone  !== undefined) this.tone  = cfg.tone;
    if (cfg.icon  !== undefined) this.icon  = cfg.icon;
    if (cfg.label !== undefined) this.label = cfg.label;
  }
}
