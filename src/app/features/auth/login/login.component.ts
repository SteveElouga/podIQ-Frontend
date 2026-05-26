import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, switchMap, map } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  DsButtonComponent,
  DsTagComponent,
  DsDotComponent,
  DsSparklineComponent,
  DsLangSwitcherComponent,
  DsBrandComponent,
  DsDividerComponent,
  DsSsoButtonComponent,
  DsInputComponent,
  DsCheckboxComponent,
  DsAlertComponent,
  DsBannerComponent,
} from '@shared/design-system';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    DsButtonComponent,
    DsTagComponent,
    DsDotComponent,
    DsSparklineComponent,
    DsLangSwitcherComponent,
    DsBrandComponent,
    DsDividerComponent,
    DsSsoButtonComponent,
    DsInputComponent,
    DsCheckboxComponent,
    DsAlertComponent,
    DsBannerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);

  loading      = signal(false);
  error        = signal<string | null>(null);
  showPassword = signal(false);

  readonly sparkPoints = [8, 9, 12, 18, 22, 16, 9, 6, 5, 4, 4, 3];

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.value;

    this.auth
      .login({ email: email!, password: password! })
      // ── Étape 2 : récupérer les workspaces de l'utilisateur ──────────────
      .pipe(
        switchMap(() => this.auth.listWorkspaces()),
        switchMap(workspaces => {
          if (workspaces.length === 0) {
            // Pas encore de workspace → onboarding
            return of({ redirect: '/onboarding' as const });
          }
          // Sélectionner le premier workspace (ou ajouter un sélecteur si plusieurs)
          // → obtenir le workspace-JWT (contient workspace_id + role)
          return this.auth
            .selectWorkspace(workspaces[0].id)
            .pipe(map(() => ({ redirect: '/dashboard' as const })));
        }),
      )
      .subscribe({
        next:  ({ redirect }) => this.router.navigate([redirect]),
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
