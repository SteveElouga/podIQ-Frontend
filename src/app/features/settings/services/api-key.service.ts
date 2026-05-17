import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../core/services/graphql.service';
import { ApiKey, CreateApiKeyResponse } from '../models/api-key.model';

const CREATE_MUTATION = `
  mutation CreateApiKey($name: String!) {
    createApiKey(name: $name) {
      keyId rawKey name createdAt
    }
  }
`;

const REVOKE_MUTATION = `
  mutation RevokeApiKey($keyId: ID!) {
    revokeApiKey(keyId: $keyId) {
      success
    }
  }
`;

const LIST_QUERY = `
  query ListApiKeys {
    apiKeys {
      keyId name createdAt lastUsed isActive
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  private readonly gql = inject(GraphqlService);

  createApiKey(name: string): Observable<CreateApiKeyResponse> {
    return this.gql
      .mutate<{ createApiKey: CreateApiKeyResponse }>(CREATE_MUTATION, { name })
      .pipe(map(res => res.createApiKey));
  }

  listApiKeys(): Observable<ApiKey[]> {
    return this.gql
      .query<{ apiKeys: ApiKey[] }>(LIST_QUERY)
      .pipe(map(res => res.apiKeys ?? []));
  }

  revokeApiKey(keyId: string): Observable<boolean> {
    return this.gql
      .mutate<{ revokeApiKey: { success: boolean } }>(REVOKE_MUTATION, { keyId })
      .pipe(map(res => res.revokeApiKey.success));
  }
}
