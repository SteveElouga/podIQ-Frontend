// ─────────────────────────────────────────────────────────────────────────────
// Workspace — GraphQL operations
// Centralise toutes les queries et mutations liées aux workspaces,
// clusters, invitations et règles d'alerte.
// ─────────────────────────────────────────────────────────────────────────────

// ── Mutations ─────────────────────────────────────────────────────────────────

export const CREATE_WORKSPACE_MUTATION = `
  mutation CreateWorkspace($name: String!, $region: String, $teamSize: String, $accentColor: String) {
    createWorkspace(name: $name, region: $region, teamSize: $teamSize, accentColor: $accentColor) {
      id name slug plan role region teamSize accentColor createdAt
    }
  }
`;

export const UPDATE_WORKSPACE_MUTATION = `
  mutation UpdateWorkspace($workspaceId: String!, $name: String, $accentColor: String, $teamSize: String) {
    updateWorkspace(workspaceId: $workspaceId, name: $name, accentColor: $accentColor, teamSize: $teamSize) {
      id onboardedAt
    }
  }
`;

export const GENERATE_INSTALL_TOKEN_MUTATION = `
  mutation GenerateInstallToken($workspaceId: String!) {
    generateInstallToken(workspaceId: $workspaceId) {
      token workspaceId expiresAt
    }
  }
`;

export const GENERATE_INVITE_LINK_MUTATION = `
  mutation GenerateInviteLink($workspaceId: String!) {
    generateInviteLink(workspaceId: $workspaceId) {
      id token status expiresAt
    }
  }
`;

export const INVITE_MEMBER_MUTATION = `
  mutation InviteMember($workspaceId: String!, $email: String!, $role: String) {
    inviteMember(workspaceId: $workspaceId, email: $email, role: $role) {
      id token email role status expiresAt createdAt
    }
  }
`;

export const CREATE_ALERT_RULE_MUTATION = `
  mutation CreateAlertRule($workspaceId: String!, $eventType: String!, $name: String) {
    createAlertRule(workspaceId: $workspaceId, eventType: $eventType, name: $name) {
      id name eventType enabled createdAt
    }
  }
`;

export const CONNECT_CHANNEL_MUTATION = `
  mutation ConnectChannel($workspaceId: String!, $channelType: String!, $config: String!) {
    connectChannel(workspaceId: $workspaceId, channelType: $channelType, config: $config) {
      id type enabled createdAt
    }
  }
`;

export const SET_QUIET_HOURS_MUTATION = `
  mutation SetQuietHours(
    $workspaceId: String!, $enabled: Boolean!, $startTime: String!, $endTime: String!,
    $timezone: String, $weekdaysOnly: Boolean
  ) {
    setQuietHours(
      workspaceId: $workspaceId, enabled: $enabled,
      startTime: $startTime, endTime: $endTime,
      timezone: $timezone, weekdaysOnly: $weekdaysOnly
    ) {
      id enabled startTime endTime timezone weekdaysOnly
    }
  }
`;

// ── Queries ───────────────────────────────────────────────────────────────────

export const CLUSTER_STATUS_QUERY = `
  query ClusterStatus($workspaceId: String!) {
    clusterStatus(workspaceId: $workspaceId) {
      id name k8sVersion status workspaceId lastHeartbeat createdAt
    }
  }
`;
