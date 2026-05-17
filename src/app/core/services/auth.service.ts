import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { GraphqlService } from './graphql.service';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.model';

const TOKEN_KEY = 'podiq_token';

const REGISTER_MUTATION = `
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token userId email
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token userId email
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly gql = inject(GraphqlService);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly isAuthenticated = computed(() => !!this._token());
  readonly token = computed(() => this._token());

  register(req: RegisterRequest): Observable<{ register: AuthResponse }> {
    return this.gql
      .mutate<{ register: AuthResponse }>(REGISTER_MUTATION, req)
      .pipe(tap(res => this._saveToken(res.register.token)));
  }

  login(req: LoginRequest): Observable<{ login: AuthResponse }> {
    return this.gql
      .mutate<{ login: AuthResponse }>(LOGIN_MUTATION, req)
      .pipe(tap(res => this._saveToken(res.login.token)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): CurrentUser | null {
    const t = this._token();
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return { userId: payload.user_id, email: payload.email, exp: payload.exp };
    } catch {
      return null;
    }
  }

  private _saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }
}
