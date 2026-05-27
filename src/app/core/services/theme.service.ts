import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'podiq:theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDark = signal<boolean>(this._getInitialTheme());

  /** Signal public en lecture seule — utilisez-le dans les templates pour réagir aux changements */
  readonly isDark = this._isDark.asReadonly();

  constructor() {
    // Synchronise la classe CSS et localStorage à chaque changement du signal
    effect(() => {
      const dark = this._isDark();
      const html = document.documentElement;

      if (dark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this._isDark.update(v => !v);
  }

  setTheme(theme: Theme): void {
    this._isDark.set(theme === 'dark');
  }

  /** Détermine le thème initial : préférence sauvegardée → préférence système → light */
  private _getInitialTheme(): boolean {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
