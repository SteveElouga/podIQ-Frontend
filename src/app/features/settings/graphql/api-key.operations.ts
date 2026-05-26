// ─────────────────────────────────────────────────────────────────────────────
// Settings / API Keys — GraphQL operations
// Centralise toutes les queries et mutations liées à la gestion des clés API.
// ─────────────────────────────────────────────────────────────────────────────

// ── Mutations ─────────────────────────────────────────────────────────────────

export const CREATE_API_KEY_MUTATION = `
  mutation CreateApiKey($name: String!) {
    createApiKey(name: $name) {
      keyId rawKey name createdAt
    }
  }
`;

export const REVOKE_API_KEY_MUTATION = `
  mutation RevokeApiKey($keyId: ID!) {
    revokeApiKey(keyId: $keyId) {
      success
    }
  }
`;

// ── Queries ───────────────────────────────────────────────────────────────────

export const LIST_API_KEYS_QUERY = `
  query ListApiKeys {
    apiKeys {
      keyId name createdAt lastUsed isActive
    }
  }
`;
