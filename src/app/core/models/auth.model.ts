// ── Réponse login / register (user-JWT, sans workspace) ──────────────────────
export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

// ── Réponse selectWorkspace / refreshToken / acceptInvitation ────────────────
export interface WorkspaceAuthResponse {
  token: string;
  userId: string;
  email: string;
  workspaceId: string;
  role: 'admin' | 'member' | 'viewer';
}

// ── Requêtes ─────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// ── Payload décodé du JWT courant (user-JWT ou workspace-JWT) ─────────────────
export interface CurrentUser {
  userId: string;
  email: string;
  exp: number;
  workspaceId?: string;
  role?: 'admin' | 'member' | 'viewer';
}

// ── Workspace ─────────────────────────────────────────────────────────────────
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
  region: string;
  teamSize?: string;
  accentColor?: string;
  onboardedAt?: string | null;
  createdAt?: string;
}

// ── Cluster ───────────────────────────────────────────────────────────────────
export interface ClusterStatus {
  id: string;
  name: string;
  k8sVersion: string;
  status: 'pending' | 'connected' | 'disconnected';
  workspaceId: string;
  lastHeartbeat: string | null;
  createdAt: string;
}

// ── Invitation ────────────────────────────────────────────────────────────────
export interface InvitationPayload {
  id: string;
  token: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}
