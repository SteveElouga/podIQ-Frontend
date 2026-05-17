import { Injectable, signal } from '@angular/core';

export type ToastTone = 'ok' | 'warn' | 'crit' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  ok(title: string, description?: string, duration = 4000): string {
    return this.add('ok', title, description, duration);
  }

  warn(title: string, description?: string, duration = 6000): string {
    return this.add('warn', title, description, duration);
  }

  error(title: string, description?: string, duration = 0): string {
    return this.add('crit', title, description, duration);
  }

  info(title: string, description?: string, duration = 4000): string {
    return this.add('info', title, description, duration);
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(tone: ToastTone, title: string, description?: string, duration = 4000): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.toasts.update(list => [...list, { id, tone, title, description, duration }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }
}
