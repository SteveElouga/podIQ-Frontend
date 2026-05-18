import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ds-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="ds-spinner"
      [style.width.px]="size()"
      [style.height.px]="size()"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="10"
        [attr.stroke]="color()"
        [attr.stroke-width]="stroke()"
        stroke-opacity="0.18"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        [attr.stroke]="color()"
        [attr.stroke-width]="stroke()"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: [`
    .ds-spinner {
      animation: ds-spin 700ms linear infinite;
      display: block;
    }
    @keyframes ds-spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class DsSpinnerComponent {
  readonly size   = input(24);
  readonly stroke = input(2);
  readonly color  = input('currentColor');
}
