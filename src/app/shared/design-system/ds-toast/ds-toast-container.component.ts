import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { DsIconComponent } from '../ds-icon/ds-icon.component';

const TONE_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  ok: { icon: 'check', color: 'var(--ok)', bg: 'var(--ok-soft)', border: 'var(--ok)' },
  warn: { icon: 'alert', color: 'var(--warn)', bg: 'var(--warn-soft)', border: 'var(--warn)' },
  crit: { icon: 'alert', color: 'var(--crit)', bg: 'var(--crit-soft)', border: 'var(--crit)' },
  info: { icon: 'bolt', color: 'var(--info)', bg: 'var(--info-soft)', border: 'var(--info)' },
};

@Component({
  selector: 'ds-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  template: `
    <div
      class="toast-region"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (t of toastSvc.toasts(); track t.id) {
        <div
          class="toast"
          [style.--toast-color]="meta(t).color"
          [style.--toast-bg]="meta(t).bg"
          [style.--toast-border]="meta(t).border"
          [attr.aria-live]="t.tone === 'crit' ? 'assertive' : 'polite'"
          role="alert"
        >
          <span class="toast__icon">
            <ds-icon [name]="meta(t).icon" [size]="15" [stroke]="2.2" />
          </span>
          <div class="toast__body">
            <p class="toast__title">{{ t.title }}</p>
            @if (t.description) {
              <p class="toast__desc">{{ t.description }}</p>
            }
          </div>
          <button class="toast__close" type="button" aria-label="Fermer" (click)="toastSvc.dismiss(t.id)">
            <ds-icon name="x" [size]="13" [stroke]="2" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-region {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 360px;
      width: 100%;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--toast-border);
      border-radius: var(--r-md);
      box-shadow: var(--shadow-md);
      pointer-events: all;
      animation: toast-in 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .toast__icon {
      width: 28px;
      height: 28px;
      border-radius: var(--r-sm);
      background: var(--toast-bg);
      color: var(--toast-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toast__body {
      flex: 1;
      min-width: 0;
    }

    .toast__title {
      margin: 0;
      font-size: 13px;
      font-weight: var(--fw-semibold);
      color: var(--ink);
      font-family: var(--font-sans);
      line-height: 1.35;
    }

    .toast__desc {
      margin: 3px 0 0;
      font-size: 12px;
      color: var(--ink-mute);
      font-family: var(--font-sans);
      line-height: 1.45;
    }

    .toast__close {
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--ink-mute);
      padding: 2px;
      display: flex;
      align-items: center;
      border-radius: var(--r-sm);
      flex-shrink: 0;
      margin-top: 1px;
      transition: color 150ms, background 150ms;

      &:hover {
        color: var(--ink);
        background: var(--surface-2);
      }
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateX(16px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `],
})
export class DsToastContainerComponent {
  readonly toastSvc = inject(ToastService);

  meta(t: Toast) {
    return TONE_META[t.tone] ?? TONE_META['info'];
  }
}
