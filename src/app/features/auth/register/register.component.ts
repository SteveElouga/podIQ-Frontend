import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  DsIconComponent,
  DsButtonComponent,
  DsTagComponent,
  DsLangSwitcherComponent,
  DsBrandComponent,
  DsDividerComponent,
  DsSsoButtonComponent,
  DsInputComponent,
  DsCheckboxComponent,
  DsAlertComponent,
} from '@shared/design-system';

export type PlanId = 'free' | 'pro' | 'ent';

interface Plan {
  id: PlanId;
  nameKey: string;
  price: string;
  subKey: string;
  tagKey?: string;
}

interface Feature {
  icon: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    DsIconComponent,
    DsButtonComponent,
    DsTagComponent,
    DsLangSwitcherComponent,
    DsBrandComponent,
    DsDividerComponent,
    DsSsoButtonComponent,
    DsInputComponent,
    DsCheckboxComponent,
    DsAlertComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);

  loading      = signal(false);
  error        = signal<string | null>(null);
  showPassword = signal(false);
  selectedPlan = signal<PlanId>('pro');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]],
    terms:    [true, Validators.requiredTrue],
  });

  private readonly passwordValue = toSignal(
    this.form.get('password')!.valueChanges.pipe(startWith('')),
    { initialValue: '' }
  );

  readonly strength = computed(() => {
    const len = (this.passwordValue() ?? '').length;
    if (len === 0)  return { bars: 0, labelKey: '',                           color: '' };
    if (len < 8)   return { bars: 1, labelKey: 'register.strengthWeak',  color: 'var(--crit)' };
    if (len < 12)  return { bars: 2, labelKey: 'register.strengthFair',  color: 'var(--warn)' };
    if (len < 16)  return { bars: 3, labelKey: 'register.strengthGood',  color: 'var(--ok)' };
    return          { bars: 4, labelKey: 'register.strengthStrong', color: 'var(--ok)' };
  });

  readonly plans: Plan[] = [
    { id: 'free', nameKey: 'register.plans.free.name', price: '$0',     subKey: 'register.plans.free.sub' },
    { id: 'pro',  nameKey: 'register.plans.pro.name',  price: '$49',    subKey: 'register.plans.pro.sub',  tagKey: 'register.plans.pro.tag' },
    { id: 'ent',  nameKey: 'register.plans.ent.name',  price: 'Custom', subKey: 'register.plans.ent.sub' },
  ];

  readonly features: Feature[] = [
    { icon: 'clock',  titleKey: 'register.visual.features.0.title', descKey: 'register.visual.features.0.desc' },
    { icon: 'git',    titleKey: 'register.visual.features.1.title', descKey: 'register.visual.features.1.desc' },
    { icon: 'shield', titleKey: 'register.visual.features.2.title', descKey: 'register.visual.features.2.desc' },
    { icon: 'key',    titleKey: 'register.visual.features.3.title', descKey: 'register.visual.features.3.desc' },
  ];

  readonly avatars = [
    { initials: 'LM', bg: 'var(--accent-soft)' },
    { initials: 'JR', bg: 'var(--info-soft)' },
    { initials: 'SK', bg: 'var(--ok-soft)' },
  ];

  readonly barIndices = [0, 1, 2, 3];

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.value;
    this.auth.register({ email: email!, password: password! }).subscribe({
      // /onboarding est hors du périmètre guestGuard — accessible avec le user-JWT
      next: () => this.router.navigate(['/onboarding']),
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
