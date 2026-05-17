import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';

function passwordsMatch(ctrl: AbstractControl): ValidationErrors | null {
  const pw = ctrl.get('password')?.value;
  const confirm = ctrl.get('confirm')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    FloatLabelModule,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-brand">
        <span class="brand-icon">⎈</span>
        <h1>PodIQ</h1>
        <p>AI-Powered Kubernetes Incident Intelligence</p>
      </div>

      <p-card styleClass="auth-card">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Create Account</h2>
          </div>
        </ng-template>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <p-floatlabel>
              <input
                pInputText
                id="email"
                formControlName="email"
                type="email"
                autocomplete="email"
                style="width:100%"
              />
              <label for="email">Email address</label>
            </p-floatlabel>
          </div>

          <div class="field">
            <p-floatlabel>
              <p-password
                inputId="password"
                formControlName="password"
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
              ></p-password>
              <label for="password">Password</label>
            </p-floatlabel>
          </div>

          <div class="field">
            <p-floatlabel>
              <p-password
                inputId="confirm"
                formControlName="confirm"
                [feedback]="false"
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
              ></p-password>
              <label for="confirm">Confirm password</label>
            </p-floatlabel>
            @if (form.hasError('mismatch') && form.get('confirm')?.touched) {
              <small class="error-hint">Passwords do not match</small>
            }
          </div>

          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="w-full mb-3"></p-message>
          }

          <p-button
            type="submit"
            label="Create Account"
            icon="pi pi-user-plus"
            [loading]="loading()"
            [disabled]="form.invalid"
            styleClass="w-full"
          ></p-button>
        </form>

        <ng-template pTemplate="footer">
          <p class="auth-link">
            Already have an account? <a routerLink="/auth/login">Sign in</a>
          </p>
        </ng-template>
      </p-card>
    </div>
  `,
  styleUrls: ['../auth.scss'],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.value;
    this.auth.register({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
