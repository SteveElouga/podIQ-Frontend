import { Component, inject } from '@angular/core';
import { LangService } from '../../../core/services/lang.service';

@Component({
  selector: 'ds-lang-switcher',
  standalone: true,
  template: `
    <button class="lang-switcher" type="button" (click)="lang.toggle()"
      [attr.aria-label]="lang.current() === 'fr' ? 'Switch to English' : 'Passer en français'">
      {{ lang.current() === 'fr' ? 'EN' : 'FR' }}
    </button>
  `,
  styleUrls: ['./ds-lang-switcher.component.scss'],
})
export class DsLangSwitcherComponent {
  readonly lang = inject(LangService);
}
