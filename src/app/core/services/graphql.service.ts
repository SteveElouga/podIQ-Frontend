import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface CacheEntry {
  obs: Observable<unknown>;
  timestamp: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/graphql`;
  private readonly _cache = new Map<string, CacheEntry>();

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

  mutate<T>(mutation: string, variables?: object): Observable<T> {
    this._cache.clear();
    return this._fetch<T>(mutation, variables);
  }

  invalidate(querySubstring?: string): void {
    if (!querySubstring) {
      this._cache.clear();
      return;
    }
    for (const key of this._cache.keys()) {
      if (key.includes(querySubstring)) this._cache.delete(key);
    }
  }

  private _fetch<T>(query: string, variables?: object): Observable<T> {
    return this.http
      .post<{ data: T; errors?: { message: string }[] }>(this.url, { query, variables })
      .pipe(
        map(res => {
          if (res.errors?.length) throw new Error(res.errors[0].message);
          return res.data;
        })
      );
  }
}
