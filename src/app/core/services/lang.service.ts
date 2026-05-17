import { computed, inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly translate = inject(TranslateService);

  readonly current = computed<Lang>(() => {
    const lang = this.translate.currentLang();
    return lang === 'en' ? 'en' : 'fr';
  });

  constructor() {
    const saved = localStorage.getItem('podiq:lang') as Lang | null;
    this.translate.use(saved === 'en' ? 'en' : 'fr');
  }

  toggle(): void {
    const next: Lang = this.current() === 'fr' ? 'en' : 'fr';
    this.translate.use(next);
    localStorage.setItem('podiq:lang', next);
  }
}
