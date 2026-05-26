import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ds-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-divider" [class.ds-divider--caps]="caps()">
      <span class="ds-divider__line"></span>
      @if (label()) {
        <span class="ds-divider__label mono">{{ label() }}</span>
      }
      <span class="ds-divider__line"></span>
    </div>
  `,
  styleUrl: './ds-divider.scss',
})
export class DsDividerComponent {
  readonly label = input<string>();
  readonly caps = input(true);
}
