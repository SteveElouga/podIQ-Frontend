import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';

@Component({
  selector: 'ds-sso-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  templateUrl: './ds-sso-button.html',
  styleUrl: './ds-sso-button.scss',
})
export class DsSsoButtonComponent {
  readonly icon     = input<string>();
  readonly full     = input(false);
  readonly disabled = input(false);
}
