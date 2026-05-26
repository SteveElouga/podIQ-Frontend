import { ChangeDetectionStrategy, Component, input, output, ViewEncapsulation } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';
import { DS_INPUT_DEFAULTS } from './ds-input.config';

export type { DsInputConfig, InputSize } from './ds-input.config';

@Component({
  selector: 'ds-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [DsIconComponent, TranslatePipe],
  templateUrl: './ds-input.html',
  styleUrl: './ds-input.scss',
})
export class DsInputComponent {
  readonly label = input<string>();
  readonly hint = input<string>();
  readonly icon = input<string>();
  readonly toggleIcon = input<string>();
  readonly forId = input<string>();
  readonly size = input(DS_INPUT_DEFAULTS.size);
  readonly readonly = input(false);
  readonly error = input(false);
  readonly errorKey = input<string>();
  readonly errorMessage = input<string>();
  readonly toggleClick = output<Event>();
}
