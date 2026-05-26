import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';
import { TagTone } from '../tokens';
import { DS_TAG_DEFAULTS } from './ds-tag.config';

export type { DsTagConfig } from './ds-tag.config';

@Component({
  selector: 'ds-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  template: `
    <span [class]="'ds-tag ds-tag--' + tone()">
      @if (icon()) { <ds-icon [name]="icon()!" [size]="10" [stroke]="2" /> }
      @if (label()) { {{ label() }} } @else { <ng-content /> }
    </span>
  `,
  styleUrls: ['./ds-tag.component.scss'],
})
export class DsTagComponent {
  readonly tone = input<TagTone>(DS_TAG_DEFAULTS.tone);
  readonly icon = input<string>();
  readonly label = input<string>();
}
