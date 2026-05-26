import { Injectable, inject } from '@angular/core';
import { Observable, interval, map, startWith, share, switchMap } from 'rxjs';
import { GraphqlService } from './graphql.service';
import { ClusterStatus, InvitationPayload, Workspace } from '../models/auth.model';
import {
  CREATE_WORKSPACE_MUTATION,
  UPDATE_WORKSPACE_MUTATION,
  GENERATE_INSTALL_TOKEN_MUTATION,
  GENERATE_INVITE_LINK_MUTATION,
  INVITE_MEMBER_MUTATION,
  CREATE_ALERT_RULE_MUTATION,
  CONNECT_CHANNEL_MUTATION,
  SET_QUIET_HOURS_MUTATION,
  CLUSTER_STATUS_QUERY,
} from '../graphql/workspace.operations';

// ── Param interfaces ──────────────────────────────────────────────────────────

export interface CreateWorkspaceParams {
  name: string;
  region?: string;
  teamSize?: string;
  accentColor?: string;
}

export interface SetQuietHoursParams {
  workspaceId: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone?: string;
  weekdaysOnly?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly gql = inject(GraphqlService);

  // ── Workspace ─────────────────────────────────────────────────────────────

  createWorkspace(params: CreateWorkspaceParams): Observable<Workspace> {
    return this.gql
      .mutate<{ createWorkspace: Workspace }>(CREATE_WORKSPACE_MUTATION, params)
      .pipe(map(r => r.createWorkspace));
  }

  /**
   * Met à jour le workspace. Appelé notamment à la fin de l'onboarding pour
   * poser `onboarded_at` côté backend.
   */
  updateWorkspace(params: {
    workspaceId: string;
    name?: string;
    accentColor?: string;
    teamSize?: string;
  }): Observable<{ id: string; onboardedAt: string | null }> {
    return this.gql
      .mutate<{ updateWorkspace: { id: string; onboardedAt: string | null } }>(UPDATE_WORKSPACE_MUTATION, params)
      .pipe(map(r => r.updateWorkspace));
  }

  // ── Cluster ───────────────────────────────────────────────────────────────

  /**
   * Génère un token d'installation (wsk_xxx) à fournir à l'agent Helm/kubectl.
   * Requiert un workspace-JWT avec rôle admin.
   */
  generateInstallToken(workspaceId: string): Observable<{
    token: string;
    workspaceId: string;
    expiresAt: string;
  }> {
    return this.gql
      .mutate<{ generateInstallToken: { token: string; workspaceId: string; expiresAt: string } }>(
        GENERATE_INSTALL_TOKEN_MUTATION, { workspaceId },
      )
      .pipe(map(r => r.generateInstallToken));
  }

  /** Retourne le statut des clusters rattachés au workspace (sans cache). */
  clusterStatus(workspaceId: string): Observable<ClusterStatus[]> {
    return this.gql
      .query<{ clusterStatus: ClusterStatus[] }>(CLUSTER_STATUS_QUERY, { workspaceId }, 0)
      .pipe(map(r => r.clusterStatus));
  }

  /**
   * Polling toutes les 5 secondes sur `clusterStatus`.
   * À combiner avec `takeUntilDestroyed(destroyRef)` dans le composant.
   */
  pollClusterStatus(workspaceId: string): Observable<ClusterStatus[]> {
    return interval(5_000).pipe(
      startWith(0),
      switchMap(() => this.clusterStatus(workspaceId)),
      share(),
    );
  }

  // ── Invitations ───────────────────────────────────────────────────────────

  inviteMember(params: { workspaceId: string; email: string; role: string }): Observable<InvitationPayload> {
    return this.gql
      .mutate<{ inviteMember: InvitationPayload }>(INVITE_MEMBER_MUTATION, params)
      .pipe(map(r => r.inviteMember));
  }

  /**
   * Génère un lien d'invitation ouvert (sans email cible).
   * Retourne le token UUID à intégrer dans l'URL : `/join/<token>`.
   */
  generateInviteLink(workspaceId: string): Observable<{ token: string; expiresAt: string }> {
    return this.gql
      .mutate<{ generateInviteLink: { id: string; token: string; status: string; expiresAt: string } }>(
        GENERATE_INVITE_LINK_MUTATION, { workspaceId },
      )
      .pipe(map(r => r.generateInviteLink));
  }

  // ── Alertes & canaux ──────────────────────────────────────────────────────

  createAlertRule(params: {
    workspaceId: string;
    eventType: string;
    name?: string;
  }): Observable<{ id: string; name: string; eventType: string; enabled: boolean }> {
    return this.gql
      .mutate<{ createAlertRule: { id: string; name: string; eventType: string; enabled: boolean } }>(
        CREATE_ALERT_RULE_MUTATION, params,
      )
      .pipe(map(r => r.createAlertRule));
  }

  /**
   * Connecte un canal de notification.
   * `config` est un objet JSON sérialisé en string (ex : `'{"webhook_url":"..."}'`).
   */
  connectChannel(params: {
    workspaceId: string;
    channelType: string;
    config: string;
  }): Observable<{ id: string; type: string; enabled: boolean }> {
    return this.gql
      .mutate<{ connectChannel: { id: string; type: string; enabled: boolean } }>(
        CONNECT_CHANNEL_MUTATION, params,
      )
      .pipe(map(r => r.connectChannel));
  }

  setQuietHours(params: SetQuietHoursParams): Observable<{
    id: string; enabled: boolean; startTime: string;
    endTime: string; timezone: string; weekdaysOnly: boolean;
  }> {
    return this.gql
      .mutate<{ setQuietHours: { id: string; enabled: boolean; startTime: string; endTime: string; timezone: string; weekdaysOnly: boolean } }>(
        SET_QUIET_HOURS_MUTATION, params,
      )
      .pipe(map(r => r.setQuietHours));
  }
}
