import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { GraphqlService } from './graphql.service';
import {
  AuthResponse,
  WorkspaceAuthResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  Workspace,
} from '../models/auth.model';
import {
  REGISTER_MUTATION,
  LOGIN_MUTATION,
  SELECT_WORKSPACE_MUTATION,
  REFRESH_TOKEN_MUTATION,
  LIST_WORKSPACES_QUERY,
} from '../graphql/auth.operations';

const TOKEN_KEY = 'podiq_token';

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly gql = inject(GraphqlService);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  // Décode le payload JWT sans vérifier la signature (lecture seule côté front)
  private readonly _payload = computed<Record<string, unknown> | null>(() => {
    const t = this._token();
    if (!t) return null;
    try {
      return JSON.parse(atob(t.split('.')[1])) as Record<string, unknown>;
    } catch {
      return null;
    }
  });

  // ── Signaux publics ───────────────────────────────────────────────────────
  readonly isAuthenticated = computed(() => !!this._token());
  readonly token = computed(() => this._token());
  /** Présent uniquement dans le workspace-JWT (après selectWorkspace). */
  readonly workspaceId = computed(() => (this._payload()?.['workspace_id'] as string) ?? null);
  readonly role = computed(() => (this._payload()?.['role'] as 'admin' | 'member' | 'viewer') ?? null);
  readonly hasWorkspace = computed(() => !!this.workspaceId());

  // ── Auth basique ──────────────────────────────────────────────────────────

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
    // `replaceUrl: true` évite un double-push dans l'historique.
    // `onSameUrlNavigation` par défaut ignore la nav si déjà sur /auth/login,
    // ce qui prévient l'InvalidStateError quand deux logouts sont déclenchés
    // simultanément (ex. intercepteur + composant).
    this.router.navigate(['/auth/login'], { replaceUrl: true }).catch(() => {
      // Navigation annulée (ex. guard actif, transition en cours) — on ignore.
    });
  }

  // ── Flux workspace-JWT ────────────────────────────────────────────────────

  /**
   * Liste les workspaces auxquels l'utilisateur appartient.
   * Nécessite un user-JWT (ou workspace-JWT).
   * Utilisé après login pour décider de rediriger vers l'onboarding ou le dashboard.
   */
  listWorkspaces(): Observable<Workspace[]> {
    return this.gql
      .query<{ listWorkspaces: Workspace[] }>(LIST_WORKSPACES_QUERY, {}, 0)
      .pipe(map(res => res.listWorkspaces));
  }

  /**
   * Échange le user-JWT contre un workspace-JWT signé par le gateway.
   * Le workspace-JWT contient workspace_id + role — requis pour toutes les
   * mutations protégées (analyzeIncident, inviteMember, etc.).
   */
  selectWorkspace(workspaceId: string): Observable<WorkspaceAuthResponse> {
    return this.gql
      .mutate<{ selectWorkspace: WorkspaceAuthResponse }>(SELECT_WORKSPACE_MUTATION, { workspaceId })
      .pipe(
        map(res => res.selectWorkspace),
        tap(ws => this._saveToken(ws.token)),
      );
  }

  /**
   * Renouvelle le workspace-JWT via le cookie httpOnly refresh_token.
   * À appeler avant expiration du token (durée par défaut : 60 min).
   */
  refreshToken(): Observable<WorkspaceAuthResponse> {
    return this.gql
      .mutate<{ refreshToken: WorkspaceAuthResponse }>(REFRESH_TOKEN_MUTATION)
      .pipe(
        map(res => res.refreshToken),
        tap(ws => this._saveToken(ws.token)),
      );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getCurrentUser(): CurrentUser | null {
    const p = this._payload();
    if (!p) return null;
    return {
      userId: p['user_id'] as string,
      email: p['email'] as string,
      exp: p['exp'] as number,
      workspaceId: p['workspace_id'] as string | undefined,
      role: p['role'] as 'admin' | 'member' | 'viewer' | undefined,
    };
  }

  private _saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }
}
