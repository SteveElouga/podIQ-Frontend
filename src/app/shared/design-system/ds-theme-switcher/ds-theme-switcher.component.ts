import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { DsIconComponent } from '../ds-icon/ds-icon.component';

@Component({
  selector: 'ds-theme-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  template: `
    <button
      class="theme-switcher"
      type="button"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.isDark() ? 'Passer en mode clair' : 'Passer en mode sombre'"
      [attr.title]="theme.isDark() ? 'Mode clair' : 'Mode sombre'"
    >
      @if (theme.isDark()) {
        <ds-icon name="sun"  [size]="15" [stroke]="1.8" />
      } @else {
        <ds-icon name="moon" [size]="15" [stroke]="1.8" />
      }
    </button>
  `,
  styleUrls: ['./ds-theme-switcher.component.scss'],
})
export class DsThemeSwitcherComponent {
  readonly theme = inject(ThemeService);
}
