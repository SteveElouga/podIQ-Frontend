import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';

@Component({
  selector: 'ds-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  templateUrl: './ds-checkbox.html',
  styleUrl: './ds-checkbox.scss',
})
export class DsCheckboxComponent {
  readonly checked = input(false);
  readonly alignTop = input(false);
  readonly stroke = input(2.5);
  readonly checkedChange = output<boolean>();

  onToggle(event: Event): void {
    event.preventDefault();
    this.checkedChange.emit(!this.checked());
  }
}
