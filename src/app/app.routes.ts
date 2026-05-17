import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  // Landing — public, guests only (authenticated users go to /dashboard)
  {
    path: '',
    pathMatch: 'full',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/marketing/landing/landing.component').then(m => m.LandingComponent),
  },

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
      {
        path: 'onboarding',
        loadComponent: () =>
          import('./features/auth/onboarding/onboarding.component').then(m => m.OnboardingComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

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

  { path: '**', redirectTo: '/dashboard' },
];
