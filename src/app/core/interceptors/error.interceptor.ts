/**
 * @file error.interceptor.ts
 * @description Intercepteur HTTP global — gestion des erreurs et renouvellement JWT.
 *
 * ## Rôle
 * Intercepte toutes les requêtes HTTP sortantes et leurs réponses pour :
 *   1. Détecter les erreurs d'authentification (UNAUTHENTICATED / 401)
 *   2. Tenter un renouvellement silencieux du JWT via le cookie httpOnly
 *   3. Rejouer la requête originale avec le nouveau token
 *   4. Rediriger vers /auth/login si le renouvellement échoue
 *   5. Afficher un toast pour les erreurs réseau et serveur (5xx)
 *
 * ## Pourquoi switchMap sur la réponse (pas tap) ?
 * Le backend GraphQL retourne TOUJOURS HTTP 200, même pour les erreurs d'auth.
 * L'erreur UNAUTHENTICATED se trouve dans `body.errors[].extensions.code`.
 * Un `tap` ne peut pas remplacer la réponse dans le flux — seul `switchMap`
 * permet de substituer l'observable de retry à la réponse originale.
 *
 * ## Flow de renouvellement
 *
 * ```
 * Requête → HTTP 200 { errors: [{ code: UNAUTHENTICATED }] }
 *                │
 *                ▼
 *         refreshToken()   ← mutation GraphQL, utilise le cookie httpOnly
 *                │
 *           ┌────┴────┐
 *        Succès      Échec
 *           │              │
 *           ▼              ▼
 *      Retry requête    logout() → /auth/login
 *      (nouveau JWT)
 * ```
 *
 * ## Protection contre les boucles infinies
 * `isRefreshRequest()` détecte si la requête qui échoue EST la mutation
 * refreshToken elle-même. Dans ce cas on ne tente pas de nouveau refresh —
 * on appelle directement logout().
 *
 * ## Ce que cet intercepteur ne gère PAS (intentionnel)
 * - Les erreurs de validation GraphQL (ex: champ manquant) → propagées au service appelant
 * - Les erreurs réseau pendant l'onboarding en mode local (demo token) → gérées dans
 *   OnboardingComponent._onEnterStep3() qui ne doit PAS tenter de refresh
 *   (le workspace-JWT n'existe pas encore si le backend était indisponible au step 1)
 *
 * ## Requêtes concurrentes avec JWT expiré
 * Si plusieurs requêtes arrivent simultanément avec un token expiré, chacune
 * tentera son propre refresh. Le backend doit accepter plusieurs usages du
 * même refresh token dans une courte fenêtre (rotation avec grace period),
 * ou une implémentation BehaviorSubject doit être ajoutée ici pour sérialiser
 * les refreshs. Pour l'instant le comportement est acceptable.
 */

import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpResponse,
  HttpRequest,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, of, Observable, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

// ── Types internes ────────────────────────────────────────────────────────────

/** Structure minimale d'une erreur dans un body GraphQL. */
interface GraphQLError {
  message: string;
  extensions?: { code?: string };
}

// ── Helpers purs (pas d'injection) ───────────────────────────────────────────

/**
 * Renvoie true si le body GraphQL contient au moins une erreur UNAUTHENTICATED.
 * Le backend retourne HTTP 200 même pour les erreurs d'auth — ce helper
 * permet de les distinguer des réponses valides.
 */
function isGqlUnauthenticated(body: unknown): boolean {
  const b = body as { errors?: GraphQLError[] } | null;
  return !!b?.errors?.some(e => e.extensions?.code === 'UNAUTHENTICATED');
}

/**
 * Renvoie true si la requête HTTP est la mutation `refreshToken` elle-même.
 *
 * Utilisé pour briser la boucle infinie : si le refresh échoue avec
 * UNAUTHENTICATED, on ne tente pas un deuxième refresh — on appelle logout().
 *
 * Détection par inspection du body GraphQL (champ `query` contient "refreshToken").
 */
function isRefreshRequest(req: HttpRequest<unknown>): boolean {
  const body = req.body as { query?: string } | null;
  return typeof body?.query === 'string' && body.query.includes('refreshToken');
}

/**
 * Tente de renouveler le JWT via le cookie httpOnly, puis rejoue la requête.
 *
 * @param req  - La requête originale à rejouer après le refresh
 * @param next - La fonction next de l'intercepteur (relance la requête dans la chaîne)
 * @param auth - AuthService (refreshToken + logout)
 * @returns    - Observable du retry, ou EMPTY après logout si le refresh échoue
 *
 * Note : `auth.refreshToken()` appelle la mutation GraphQL `refreshToken` et
 * sauvegarde automatiquement le nouveau token dans localStorage via `_saveToken()`.
 * Le retry via `next(req)` passe par `authInterceptor` qui ajoute le nouveau Bearer.
 */
function refreshAndRetry(
  req: HttpRequest<unknown>,
  next: (r: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
  auth: AuthService,
): Observable<HttpEvent<unknown>> {
  return auth.refreshToken().pipe(
    switchMap(() => next(req)),
    catchError(() => {
      // Le cookie refresh_token est invalide ou expiré.
      // On déconnecte proprement — l'utilisateur devra se reconnecter.
      auth.logout();
      return EMPTY;
    }),
  );
}

// ── Intercepteur ──────────────────────────────────────────────────────────────

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const messages = inject(MessageService);

  // Calculé une seule fois par requête pour tout le pipeline RxJS.
  const isRefreshReq = isRefreshRequest(req);

  return next(req).pipe(

    // ── Cas 1 : UNAUTHENTICATED dans un HTTP 200 (GraphQL) ────────────────────
    //
    // GraphQL encapsule les erreurs d'auth dans le body avec HTTP 200.
    // On utilise switchMap (et non tap) pour pouvoir substituer l'observable
    // du retry à la réponse UNAUTHENTICATED dans le flux.
    //
    // Guard `isRefreshReq` : si c'est déjà la requête de refresh qui revient
    // UNAUTHENTICATED, on ne re-tente pas — on laisse passer, le catchError
    // de refreshAndRetry appellera logout().
    switchMap(event => {
      if (!(event instanceof HttpResponse)) return of(event);
      if (!isGqlUnauthenticated(event.body) || isRefreshReq) return of(event);

      return refreshAndRetry(req, next, auth);
    }),

    // ── Cas 2 : 401 HTTP (endpoints REST hors GraphQL) ────────────────────────
    //
    // Même stratégie que pour UNAUTHENTICATED GraphQL.
    // Guard `isRefreshReq` identique pour éviter la boucle infinie.
    //
    // ── Cas 3 : Erreurs réseau et serveur ─────────────────────────────────────
    //
    // status 0   → pas de réseau / CORS / serveur unreachable → toast
    // status 5xx → erreur serveur inattendue → toast
    // Autres     → propagés au service appelant (validation, 404, etc.)
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isRefreshReq) {
        return refreshAndRetry(req, next, auth);
      }

      if (err.status === 0) {
        messages.add({
          severity: 'error',
          summary: 'Réseau indisponible',
          detail: 'Impossible de joindre le serveur. Vérifiez votre connexion.',
          life: 6_000,
        });
      } else if (err.status >= 500) {
        messages.add({
          severity: 'error',
          summary: 'Erreur serveur',
          detail: `Erreur inattendue (${err.status}). Veuillez réessayer.`,
          life: 6_000,
        });
      }

      return throwError(() => err);
    }),
  );
};
