export interface ApiKey {
  keyId: string;
  name: string;
  createdAt: string;
  lastUsed?: string | null;
  isActive: boolean;
}

export interface CreateApiKeyResponse {
  keyId: string;
  rawKey: string;
  name: string;
  createdAt: string;
}
