import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [

  // ── Landing — visiteurs non authentifiés seulement ───────────────────────
  {
    path: '',
    pathMatch: 'full',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/marketing/landing/landing.component').then(m => m.LandingComponent),
  },

  // ── Auth — login + register (non authentifiés seulement) ─────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Onboarding — authentifié requis, mais PAS guestGuard ─────────────────
  // L'utilisateur arrive ici juste après register (user-JWT en place) ou
  // après login si aucun workspace n'existe. Le guestGuard le bloquerait
  // puisqu'il est déjà authentifié.
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/onboarding/onboarding.component').then(m => m.OnboardingComponent),
  },

  // ── Application — workspace-JWT requis ───────────────────────────────────
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'incidents',
        children: [
          {
            path: 'analyze',
            loadComponent: () =>
              import('./features/incidents/analyze/analyze.component').then(m => m.AnalyzeComponent),
          },
          {
            path: 'history',
            loadComponent: () =>
              import('./features/incidents/history/history.component').then(m => m.HistoryComponent),
          },
          { path: '', redirectTo: 'analyze', pathMatch: 'full' },
        ],
      },
      {
        path: 'manifests',
        children: [
          {
            path: 'scan',
            loadComponent: () =>
              import('./features/manifests/scan/scan.component').then(m => m.ScanComponent),
          },
          { path: '', redirectTo: 'scan', pathMatch: 'full' },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: 'api-keys',
            loadComponent: () =>
              import('./features/settings/api-keys/api-keys.component').then(m => m.ApiKeysComponent),
          },
          { path: '', redirectTo: 'api-keys', pathMatch: 'full' },
        ],
      },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '/auth/login' },
];
