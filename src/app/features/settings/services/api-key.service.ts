import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../core/services/graphql.service';
import { ApiKey, CreateApiKeyResponse } from '../models/api-key.model';
import {
  CREATE_API_KEY_MUTATION,
  REVOKE_API_KEY_MUTATION,
  LIST_API_KEYS_QUERY,
} from '../graphql/api-key.operations';

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  private readonly gql = inject(GraphqlService);

  createApiKey(name: string): Observable<CreateApiKeyResponse> {
    return this.gql
      .mutate<{ createApiKey: CreateApiKeyResponse }>(CREATE_API_KEY_MUTATION, { name })
      .pipe(map(res => res.createApiKey));
  }

  listApiKeys(): Observable<ApiKey[]> {
    return this.gql
      .query<{ apiKeys: ApiKey[] }>(LIST_API_KEYS_QUERY)
      .pipe(map(res => res.apiKeys ?? []));
  }

  revokeApiKey(keyId: string): Observable<boolean> {
    return this.gql
      .mutate<{ revokeApiKey: { success: boolean } }>(REVOKE_API_KEY_MUTATION, { keyId })
      .pipe(map(res => res.revokeApiKey.success));
  }
}
