/**
 * @file graphql.service.ts
 * @description Client GraphQL bas niveau — transport HTTP + cache in-memory.
 *
 * ## Responsabilités
 * - Envoyer toutes les opérations GraphQL (queries / mutations) en POST /graphql
 * - Mettre en cache les queries avec un TTL configurable (défaut 5 min)
 * - Invalider le cache sur toute mutation
 * - Transformer les erreurs GraphQL métier en exceptions RxJS
 *
 * ## Ce que ce service ne fait PAS
 * La gestion des erreurs d'authentification (UNAUTHENTICATED) est entièrement
 * déléguée à `errorInterceptor`. Ce service ne voit jamais ces erreurs :
 * l'intercepteur les intercepte, tente un refresh JWT, rejoue la requête,
 * et ce service reçoit directement la réponse du retry.
 *
 * Si le refresh échoue, l'intercepteur émet EMPTY (flux terminé sans valeur)
 * et redirige vers /auth/login — ce service n'est jamais notifié.
 *
 * ## Contrat des erreurs GraphQL
 * Le backend retourne HTTP 200 même en cas d'erreur. La structure est :
 * ```json
 * { "data": null, "errors": [{ "message": "...", "extensions": { "code": "..." } }] }
 * ```
 * Ce service lève une `Error` avec le premier message d'erreur pour toute
 * erreur non-UNAUTHENTICATED (ex: validation, not found, forbidden…).
 * L'appelant (service métier) est responsable du `catchError`.
 *
 * ## Cache
 * - `query(q, vars, ttl)` : mis en cache par clé `query:variables` avec TTL
 * - `query(q, vars, 0)`   : contourne le cache (ex: clusterStatus, polling)
 * - `mutate()`            : vide intégralement le cache (cohérence des données)
 * - `invalidate(substr)`  : vide sélectivement les entrées dont la clé contient substr
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ── Types internes ────────────────────────────────────────────────────────────

interface CacheEntry {
  obs: Observable<unknown>;
  timestamp: number;
}

// ── Constantes ────────────────────────────────────────────────────────────────

/** TTL par défaut du cache de queries : 5 minutes. */
const DEFAULT_TTL = 5 * 60 * 1000;

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/graphql`;
  private readonly _cache = new Map<string, CacheEntry>();

  // ── API publique ────────────────────────────────────────────────────────────

  /**
   * Exécute une query GraphQL avec mise en cache.
   *
   * @param query     - Chaîne GraphQL (depuis un fichier *.operations.ts)
   * @param variables - Variables de la query
   * @param ttl       - Durée de vie du cache en ms. `0` = pas de cache (ex: polling)
   * @returns Observable émettant `data` de la réponse GraphQL
   *
   * @example
   * this.gql.query<{ clusterStatus: ClusterStatus[] }>(CLUSTER_STATUS_QUERY, { workspaceId }, 0)
   */
  query<T>(query: string, variables?: object, ttl = DEFAULT_TTL): Observable<T> {
    if (ttl === 0) {
      return this._fetch<T>(query, variables);
    }

    const key = `${query}:${JSON.stringify(variables ?? {})}`;
    const cached = this._cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.obs as Observable<T>;
    }

    const obs = this._fetch<T>(query, variables).pipe(shareReplay(1));
    this._cache.set(key, { obs, timestamp: Date.now() });
    return obs;
  }

  /**
   * Exécute une mutation GraphQL.
   * Vide intégralement le cache — toute mutation peut invalider des données lues.
   *
   * @param mutation  - Chaîne GraphQL (depuis un fichier *.operations.ts)
   * @param variables - Variables de la mutation
   * @returns Observable émettant `data` de la réponse GraphQL
   */
  mutate<T>(mutation: string, variables?: object): Observable<T> {
    this._cache.clear();
    return this._fetch<T>(mutation, variables);
  }

  /**
   * Invalide manuellement des entrées du cache.
   *
   * @param querySubstring - Si fourni, supprime les entrées dont la clé contient
   *                         cette chaîne. Sinon, vide tout le cache.
   */
  invalidate(querySubstring?: string): void {
    if (!querySubstring) {
      this._cache.clear();
      return;
    }
    for (const key of this._cache.keys()) {
      if (key.includes(querySubstring)) this._cache.delete(key);
    }
  }

  // ── Implémentation interne ──────────────────────────────────────────────────

  /**
   * Effectue le POST HTTP vers /graphql et mappe la réponse.
   *
   * Ordre d'exécution dans le pipeline Angular :
   *   1. authInterceptor    → ajoute Authorization: Bearer <token>
   *   2. errorInterceptor   → détecte UNAUTHENTICATED, tente refresh + retry
   *   3. Ce map             → reçoit la réponse finale (originale ou du retry)
   *                           et lève une Error pour les erreurs GraphQL non-auth
   *
   * Si errorInterceptor retourne EMPTY (refresh échoué → logout), ce map
   * n't s'exécute jamais — le flux se termine silencieusement et
   * l'utilisateur est redirigé vers /auth/login.
   */
  private _fetch<T>(query: string, variables?: object): Observable<T> {
    return this.http
      .post<{ data: T; errors?: { message: string }[] }>(this.url, { query, variables })
      .pipe(
        map(res => {
          if (res.errors?.length) throw new Error(res.errors[0].message);
          return res.data;
        }),
      );
  }
}
