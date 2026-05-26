// ─────────────────────────────────────────────────────────────────────────────
// Auth — GraphQL operations
// Centralise toutes les queries et mutations liées à l'authentification.
// ─────────────────────────────────────────────────────────────────────────────

// ── Mutations ─────────────────────────────────────────────────────────────────

export const REGISTER_MUTATION = `
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token userId email
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token userId email
    }
  }
`;

export const SELECT_WORKSPACE_MUTATION = `
  mutation SelectWorkspace($workspaceId: String!) {
    selectWorkspace(workspaceId: $workspaceId) {
      token userId email workspaceId role
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = `
  mutation {
    refreshToken {
      token userId email workspaceId role
    }
  }
`;

// ── Queries ───────────────────────────────────────────────────────────────────

export const LIST_WORKSPACES_QUERY = `
  query {
    listWorkspaces {
      id name slug plan role region
    }
  }
`;
