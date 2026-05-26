import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin, of, switchMap, catchError } from 'rxjs';
import {
  DsIconComponent,
  DsDotComponent,
  DsButtonComponent,
  DsLangSwitcherComponent,
  DsTagComponent,
  DsBrandComponent,
  DsAlertComponent,
  DsBannerComponent,
  DsInputComponent,
  DsLoadingInlineComponent,
} from '@shared/design-system';
import { DotTone } from '@shared/design-system/tokens';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceService } from '../../../core/services/workspace.service';

// ── Types locaux ──────────────────────────────────────────────────────────────

export type InstallMethod = 'helm' | 'kubectl' | 'terraform';
export type PlanId       = 'free' | 'pro' | 'ent';
export type TeamSize     = 'solo' | 'small' | 'mid' | 'large';
export type Region       = 'eu' | 'us' | 'ap';
export type InviteRole   = 'admin' | 'member' | 'viewer';

interface Invite    { email: string; role: InviteRole; status: 'sent' | 'draft'; }
interface AlertRule { id: string; titleKey: string; hintKey: string; tone: DotTone; enabled: boolean; }
interface Channel   { id: string; icon: string; labelKey: string; descKey: string; connected: boolean; disabled: boolean; tag?: string; }

interface Plan {
  id: PlanId;
  nameKey: string;
  price: { monthly: string; annual: string };
  perKey: string;
  subKey: string;
  featuresKeys: string[];
  tag?: string;
}

// Correspondance entre les TeamSize frontend et les valeurs backend
const TEAM_SIZE_MAP: Record<TeamSize, string> = {
  solo:  'solo',
  small: '2_10',
  mid:   '11_50',
  large: '50_plus',
};

// Correspondance entre les IDs de règles et les eventTypes backend
const EVENT_TYPE_MAP: Record<string, string> = {
  crash:     'crashloop',
  memory:    'oom',
  predeploy: 'predeploy_block',
  fix:       'fix_found',
};

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    DsIconComponent,
    DsDotComponent,
    DsButtonComponent,
    DsLangSwitcherComponent,
    DsTagComponent,
    DsBrandComponent,
    DsAlertComponent,
    DsBannerComponent,
    DsInputComponent,
    DsLoadingInlineComponent,
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {
  private readonly auth        = inject(AuthService);
  private readonly wsService   = inject(WorkspaceService);
  private readonly router      = inject(Router);
  private readonly destroyRef  = inject(DestroyRef);
  private readonly translateSvc = inject(TranslateService);

  // ── Navigation étapes ─────────────────────────────────────────────────────

  readonly totalSteps = 5;
  currentStep = signal(1);

  readonly stepLabels = [
    'onboarding.steps.0',
    'onboarding.steps.1',
    'onboarding.steps.2',
    'onboarding.steps.3',
    'onboarding.steps.4',
  ];

  stepState(n: number): 'done' | 'current' | 'pending' {
    const s = this.currentStep();
    if (n < s)  return 'done';
    if (n === s) return 'current';
    return 'pending';
  }

  /** Avance d'une étape (usage interne uniquement). */
  private _advance(): void {
    const s = this.currentStep();
    if (s < this.totalSteps) this.currentStep.set(s + 1);
    else                      this.currentStep.set(6); // → écran Complete
  }

  /** Avance pour les étapes sans appel API (step 2, 3, 4 via "Skip" ou "Continue"). */
  next(): void { this._advance(); }

  prev(): void {
    const s = this.currentStep();
    if (s > 1) this.currentStep.set(s - 1);
  }

  mainInnerWidth = computed(() => {
    switch (this.currentStep()) {
      case 1: return '640px';
      case 2: return '980px';
      case 3:
      case 4: return '720px';
      case 5: return '760px';
      default: return '680px';
    }
  });

  // ── États de chargement / erreur par étape ────────────────────────────────

  step1Loading  = signal(false);
  step1Error    = signal<string | null>(null);
  step3Loading  = signal(false);
  step3Error    = signal<string | null>(null);
  step4Loading  = signal(false);
  step5Loading  = signal(false);
  completeLoading = signal(false);

  // ── Step 1 : Workspace ────────────────────────────────────────────────────

  workspaceName    = signal('');
  urlSlug          = computed(() =>
    this.workspaceName()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''),
  );
  selectedAccent   = signal('#d97706');
  readonly accents = ['#d97706', '#0e7490', '#15803d', '#7c3aed', '#be123c', '#1f2937'];
  firstLetter      = computed(() => this.workspaceName().charAt(0).toUpperCase() || 'A');

  selectedTeamSize = signal<TeamSize>('small');
  readonly teamSizes: { id: TeamSize; labelKey: string }[] = [
    { id: 'solo',  labelKey: 'onboarding.teamSize.solo'  },
    { id: 'small', labelKey: 'onboarding.teamSize.small' },
    { id: 'mid',   labelKey: 'onboarding.teamSize.mid'   },
    { id: 'large', labelKey: 'onboarding.teamSize.large' },
  ];

  selectedRegion  = signal<Region>('eu');
  readonly regions: { id: Region; labelKey: string; subKey: string }[] = [
    { id: 'eu', labelKey: 'onboarding.region.eu', subKey: 'onboarding.region.euSub' },
    { id: 'us', labelKey: 'onboarding.region.us', subKey: 'onboarding.region.usSub' },
    { id: 'ap', labelKey: 'onboarding.region.ap', subKey: 'onboarding.region.apSub' },
  ];

  /**
   * Step 1 → Continue : crée le workspace puis échange immédiatement le
   * user-JWT contre un workspace-JWT (contient workspace_id + role).
   */
  submitWorkspace(): void {
    const name = this.workspaceName().trim();
    if (name.length < 2) {
      this.step1Error.set(this.translateSvc.instant('onboarding.workspace.nameError'));
      return;
    }

    this.step1Loading.set(true);
    this.step1Error.set(null);

    this.wsService
      .createWorkspace({
        name,
        region:      this.selectedRegion(),
        teamSize:    TEAM_SIZE_MAP[this.selectedTeamSize()],
        accentColor: this.selectedAccent(),
      })
      .pipe(
        // Si createWorkspace échoue (backend indisponible, mutation inconnue…),
        // on génère un workspace local pour ne pas bloquer le flow UI.
        catchError(err => {
          console.warn('[Onboarding step 1] createWorkspace failed — continuing in local mode:', err);
          return of({ id: `local_${Date.now()}`, name, slug: this.urlSlug() } as import('../../../core/models/auth.model').Workspace);
        }),
        // Échange le user-JWT contre un workspace-JWT.
        // Si selectWorkspace échoue aussi (ex. ID local), on ignore l'erreur
        // et on continue : le workspaceId() sera null mais le flux avance.
        switchMap(ws =>
          this.auth.selectWorkspace(ws.id).pipe(
            catchError(err => {
              console.warn('[Onboarding step 1] selectWorkspace failed — skipping JWT upgrade:', err);
              return of(null);
            }),
          ),
        ),
      )
      .subscribe({
        next: () => {
          this.step1Loading.set(false);
          this._advance();
        },
        // Cette branche ne devrait plus être atteinte grâce aux catchError ci-dessus,
        // mais on la garde comme filet de sécurité.
        error: (err: Error) => {
          console.error('[Onboarding step 1] Unexpected error:', err);
          this.step1Loading.set(false);
          this.step1Error.set(err.message ?? this.translateSvc.instant('onboarding.error.unexpected'));
        },
      });
  }

  // ── Step 2 : Choose plan (local uniquement — backend NON IMPLÉMENTÉ) ───────

  billingCycle = signal<'monthly' | 'annual'>('monthly');
  selectedPlan = signal<PlanId>('pro');

  readonly plans: Plan[] = [
    {
      id: 'free',
      nameKey: 'onboarding.plan.free.name',
      price:   { monthly: '$0', annual: '$0' },
      perKey:  'onboarding.plan.free.per',
      subKey:  'onboarding.plan.free.sub',
      featuresKeys: [
        'onboarding.plan.free.f0',
        'onboarding.plan.free.f1',
        'onboarding.plan.free.f2',
        'onboarding.plan.free.f3',
      ],
    },
    {
      id: 'pro',
      nameKey: 'onboarding.plan.pro.name',
      price:   { monthly: '$49', annual: '$39' },
      perKey:  'onboarding.plan.pro.per',
      subKey:  'onboarding.plan.pro.sub',
      featuresKeys: [
        'onboarding.plan.pro.f0',
        'onboarding.plan.pro.f1',
        'onboarding.plan.pro.f2',
        'onboarding.plan.pro.f3',
        'onboarding.plan.pro.f4',
        'onboarding.plan.pro.f5',
      ],
      tag: 'onboarding.plan.pro.tag',
    },
    {
      id: 'ent',
      nameKey: 'onboarding.plan.ent.name',
      price:   { monthly: 'Custom', annual: 'Custom' },
      perKey:  'onboarding.plan.ent.per',
      subKey:  'onboarding.plan.ent.sub',
      featuresKeys: [
        'onboarding.plan.ent.f0',
        'onboarding.plan.ent.f1',
        'onboarding.plan.ent.f2',
        'onboarding.plan.ent.f3',
        'onboarding.plan.ent.f4',
        'onboarding.plan.ent.f5',
      ],
    },
  ];

  planPrice(p: Plan): string {
    return this.billingCycle() === 'annual' ? p.price.annual : p.price.monthly;
  }

  selectedPlanNameTranslated = computed(() => {
    const plan = this.plans.find(p => p.id === this.selectedPlan())!;
    return this.translateSvc.instant(plan.nameKey);
  });

  // ── Step 3 : Connect cluster ──────────────────────────────────────────────

  readonly installOptions: { id: InstallMethod; titleKey: string; descKey: string; icon: string }[] = [
    { id: 'helm',      titleKey: 'onboarding.methods.0.title', descKey: 'onboarding.methods.0.desc', icon: 'cube'   },
    { id: 'kubectl',   titleKey: 'onboarding.methods.1.title', descKey: 'onboarding.methods.1.desc', icon: 'code'   },
    { id: 'terraform', titleKey: 'onboarding.methods.2.title', descKey: 'onboarding.methods.2.desc', icon: 'layers' },
  ];

  selectedMethod       = signal<InstallMethod>('helm');
  installToken         = signal<string | null>(null);
  clusterConnected     = signal(false);
  connectedClusterName = signal<string | null>(null);
  copied               = signal(false);

  // Snippet de commande avec le token dynamique
  readonly codePre = String.raw`# 1. Add the PodIQ helm repo
helm repo add podiq https://charts.podiq.dev
helm repo update

# 2. Install the agent in the podiq-system namespace
helm install podiq podiq/agent \
  --namespace podiq-system --create-namespace \
  --set workspace.token=`;

  readonly codeSuf = String.raw`

# 3. Verify the agent is running
kubectl get pods -n podiq-system`;

  readonly installCommand = computed(
    () => this.codePre + (this.installToken() ?? '…') + this.codeSuf,
  );

  copyCommand(): void {
    navigator.clipboard.writeText(this.installCommand()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2_000);
    });
  }

  // ── Step 4 : Invite team ──────────────────────────────────────────────────

  inviteEmail        = signal('');
  inviteRole         = signal<InviteRole>('member');
  /** Liste vide au démarrage — seules les vraies invitations envoyées s'y accumulent. */
  invites            = signal<Invite[]>([]);
  autoInvite         = signal(false);
  inviteEmailInvalid = signal(false);
  inviteLinkCopied   = signal(false);

  autoInviteDomain = computed(() => {
    const first = this.invites()[0];
    if (first) {
      const at = first.email.indexOf('@');
      if (at > 0) return first.email.slice(at);
    }
    return '@your-domain.io';
  });

  readonly roles: { id: InviteRole; labelKey: string; descKey: string }[] = [
    { id: 'admin',  labelKey: 'onboarding.role.admin',  descKey: 'onboarding.role.adminDesc'  },
    { id: 'member', labelKey: 'onboarding.role.member', descKey: 'onboarding.role.memberDesc' },
    { id: 'viewer', labelKey: 'onboarding.role.viewer', descKey: 'onboarding.role.viewerDesc' },
  ];

  private readonly EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Appelle `inviteMember` côté backend puis ajoute l'entrée dans la liste.
   * En cas d'erreur API, l'invite est ajouté en statut 'draft' localement.
   */
  addInvite(): void {
    const email = this.inviteEmail().trim();
    if (!email || !this.EMAIL_RE.test(email)) {
      this.inviteEmailInvalid.set(true);
      return;
    }
    this.inviteEmailInvalid.set(false);

    const wsId = this.auth.workspaceId();
    const role = this.inviteRole();

    if (!wsId) {
      // Pas encore de workspace-JWT (cas d'erreur à step 1) → ajout local uniquement
      this.invites.update(list => [...list, { email, role, status: 'draft' }]);
      this.inviteEmail.set('');
      return;
    }

    this.step4Loading.set(true);
    this.wsService.inviteMember({ workspaceId: wsId, email, role }).subscribe({
      next: () => {
        this.invites.update(list => [...list, { email, role, status: 'sent' }]);
        this.inviteEmail.set('');
        this.step4Loading.set(false);
      },
      error: () => {
        // L'invitation est ajoutée localement en brouillon si l'API échoue
        this.invites.update(list => [...list, { email, role, status: 'draft' }]);
        this.inviteEmail.set('');
        this.step4Loading.set(false);
      },
    });
  }

  onWorkspaceNameChange(value: string): void {
    this.workspaceName.set(value);
    if (this.step1Error()) this.step1Error.set(null);
  }

  clearInviteError(): void {
    if (this.inviteEmailInvalid()) this.inviteEmailInvalid.set(false);
  }

  removeInvite(email: string): void {
    this.invites.update(list => list.filter(i => i.email !== email));
  }

  /**
   * Génère un lien d'invitation ouvert via `generateInviteLink` (backend).
   * Fallback sur un lien local si le workspace n'est pas encore créé.
   */
  copyInviteLink(): void {
    const wsId = this.auth.workspaceId();
    if (!wsId) {
      const link = `${globalThis.location.origin}/join/${this.urlSlug() || 'your-workspace'}`;
      navigator.clipboard.writeText(link).then(() => {
        this.inviteLinkCopied.set(true);
        setTimeout(() => this.inviteLinkCopied.set(false), 2_000);
      });
      return;
    }

    this.wsService.generateInviteLink(wsId).subscribe({
      next: result => {
        const link = `${globalThis.location.origin}/join/${result.token}`;
        navigator.clipboard.writeText(link).then(() => {
          this.inviteLinkCopied.set(true);
          setTimeout(() => this.inviteLinkCopied.set(false), 2_000);
        });
      },
      error: () => {
        // Fallback silencieux
        const link = `${globalThis.location.origin}/join/${this.urlSlug() || 'your-workspace'}`;
        navigator.clipboard.writeText(link).then(() => {
          this.inviteLinkCopied.set(true);
          setTimeout(() => this.inviteLinkCopied.set(false), 2_000);
        });
      },
    });
  }

  // ── Step 5 : Wire up alerts ───────────────────────────────────────────────

  alertRules = signal<AlertRule[]>([
    { id: 'crash',     titleKey: 'onboarding.alert.crash',     hintKey: 'onboarding.alert.crashHint',     tone: 'crit',   enabled: true  },
    { id: 'memory',    titleKey: 'onboarding.alert.memory',    hintKey: 'onboarding.alert.memoryHint',    tone: 'warn',   enabled: true  },
    { id: 'predeploy', titleKey: 'onboarding.alert.predeploy', hintKey: 'onboarding.alert.predeployHint', tone: 'info',   enabled: true  },
    { id: 'fix',       titleKey: 'onboarding.alert.fix',       hintKey: 'onboarding.alert.fixHint',       tone: 'accent', enabled: false },
  ]);

  channels = signal<Channel[]>([
    { id: 'slack',     icon: 'git',   labelKey: 'onboarding.channel.slack',     descKey: 'onboarding.channel.slackDesc',     connected: false, disabled: false, tag: 'onboarding.channel.recommended' },
    { id: 'pagerduty', icon: 'alert', labelKey: 'onboarding.channel.pagerduty', descKey: 'onboarding.channel.pagerdutyDesc', connected: false, disabled: false },
    { id: 'email',     icon: 'user',  labelKey: 'onboarding.channel.email',     descKey: 'onboarding.channel.emailDesc',     connected: false, disabled: false },
    { id: 'webhook',   icon: 'code',  labelKey: 'onboarding.channel.webhook',   descKey: 'onboarding.channel.webhookDesc',   connected: false, disabled: false },
    { id: 'teams',     icon: 'cube',  labelKey: 'onboarding.channel.teams',     descKey: 'onboarding.channel.teamsDesc',     connected: false, disabled: true  },
    { id: 'discord',   icon: 'play',  labelKey: 'onboarding.channel.discord',   descKey: 'onboarding.channel.discordDesc',   connected: false, disabled: false },
  ]);

  connectedCount = computed(() => this.channels().filter(c => c.connected).length);
  quietHours     = signal(true);

  toggleAlert(id: string): void {
    this.alertRules.update(rules =>
      rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r),
    );
  }

  /**
   * Step 5 → Finish :
   * 1. Crée une AlertRule backend pour chaque règle activée.
   * 2. Configure les quiet hours si activées.
   * Continue vers l'écran Complete même si certains appels échouent.
   */
  finishAlerts(): void {
    const wsId = this.auth.workspaceId();
    if (!wsId) {
      // Cas dégradé : continuer sans appel API
      this._advance();
      return;
    }

    this.step5Loading.set(true);

    const ruleCalls$ = this.alertRules()
      .filter(r => r.enabled)
      .map(r =>
        this.wsService.createAlertRule({
          workspaceId: wsId,
          eventType:   EVENT_TYPE_MAP[r.id] ?? r.id,
          name:        r.titleKey,
        }),
      );

    const quietCalls$ = this.quietHours()
      ? [this.wsService.setQuietHours({
          workspaceId:  wsId,
          enabled:      true,
          startTime:    '22:00',
          endTime:      '07:00',
          timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone,
          weekdaysOnly: false,
        })]
      : [];

    const allCalls$ = [...ruleCalls$, ...quietCalls$];

    if (allCalls$.length === 0) {
      this.step5Loading.set(false);
      this._advance();
      return;
    }

    forkJoin(allCalls$).subscribe({
      next:  () => { this.step5Loading.set(false); this._advance(); },
      // On continue même en cas d'erreur partielle (non-bloquant pour l'UX)
      error: () => { this.step5Loading.set(false); this._advance(); },
    });
  }

  // ── Complete ──────────────────────────────────────────────────────────────

  readonly summaryCards: { icon: string; labelKey: string; valueKey: string }[] = [
    { icon: 'cube',  labelKey: 'onboarding.complete.workspace', valueKey: 'onboarding.complete.workspaceValue' },
    { icon: 'git',   labelKey: 'onboarding.complete.cluster',   valueKey: 'onboarding.complete.clusterValue'   },
    { icon: 'user',  labelKey: 'onboarding.complete.team',      valueKey: 'onboarding.complete.teamValue'      },
    { icon: 'alert', labelKey: 'onboarding.complete.alerts',    valueKey: 'onboarding.complete.alertsValue'    },
  ];

  readonly nextActions: { icon: string; titleKey: string; subKey: string }[] = [
    { icon: 'shield', titleKey: 'onboarding.complete.action0Title', subKey: 'onboarding.complete.action0Sub' },
    { icon: 'git',    titleKey: 'onboarding.complete.action1Title', subKey: 'onboarding.complete.action1Sub' },
    { icon: 'clock',  titleKey: 'onboarding.complete.action2Title', subKey: 'onboarding.complete.action2Sub' },
  ];

  /**
   * Marque le workspace comme onboardé (`onboarded_at` côté backend)
   * puis navigue vers le dashboard.
   */
  goToDashboard(): void {
    const wsId = this.auth.workspaceId();
    if (!wsId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.completeLoading.set(true);
    this.wsService.updateWorkspace({ workspaceId: wsId }).subscribe({
      next:  () => { this.completeLoading.set(false); this.router.navigate(['/dashboard']); },
      error: () => { this.completeLoading.set(false); this.router.navigate(['/dashboard']); },
    });
  }

  // ── Lifecycle / side-effects ──────────────────────────────────────────────

  constructor() {
    /**
     * Dès que l'utilisateur entre en step 3, générer le token d'installation
     * et démarrer le polling sur clusterStatus.
     * `untracked` évite que la lecture de `installToken` dans la condition
     * ne re-déclenche l'effect si le signal change.
     */
    effect(() => {
      const step = this.currentStep();
      if (step === 3) {
        untracked(() => this._onEnterStep3());
      }
    });
  }

  /**
   * Appelé à l'entrée du step 3 (connect cluster).
   * Génère le token d'installation (`wsk_xxx`) nécessaire à la commande Helm/kubectl.
   *
   * ## Pourquoi on ne tente PAS refreshToken() ici
   *
   * `refreshToken()` renouvelle un workspace-JWT *existant* via le cookie httpOnly.
   * Il est adapté aux sessions en cours dans un workspace (dashboard, incidents…)
   * où le JWT expire après 60 min d'activité.
   *
   * Pendant l'onboarding, si `wsId` est null, c'est parce que `selectWorkspace()`
   * a échoué au step 1 (backend indisponible au moment de la création).
   * Un refresh ne peut pas créer un workspace-JWT pour un workspace qui n'a pas
   * encore de session établie côté backend — il retournerait soit un user-JWT,
   * soit le JWT d'un workspace précédent, résultat imprévisible.
   *
   * La bonne résolution serait de relancer `selectWorkspace(workspaceId)` avec
   * l'ID du workspace créé. En attendant, on propose le token de démo pour ne
   * pas bloquer l'utilisateur.
   *
   * ## Gestion des erreurs
   *
   * Si `generateInstallToken` revient avec UNAUTHENTICATED, c'est `errorInterceptor`
   * qui prend la main (refresh + retry ou logout). La branche `error:` ci-dessous
   * ne reçoit que les erreurs non-auth (réseau, serveur 5xx, timeout…) pour
   * lesquelles le token de démo est un fallback approprié.
   *
   * Le polling `_startClusterPolling` ne démarre qu'en cas de succès réel —
   * inutile de poller si on n'a pas de vrai cluster à attendre.
   */
  private _onEnterStep3(): void {
    if (this.installToken()) return; // déjà chargé, ne pas re-générer

    const wsId = this.auth.workspaceId();

    if (!wsId) {
      // Pas de workspace-JWT : le backend était indisponible au step 1.
      // Voir la JSDoc ci-dessus pour l'explication complète.
      console.warn('[Onboarding step 3] No workspace JWT — using demo token');
      this.installToken.set('wsk_demo_00000000000000000000000000000000');
      this.step3Error.set(this.translateSvc.instant('onboarding.cluster.noWorkspace'));
      return;
    }

    this.step3Loading.set(true);
    this.step3Error.set(null);

    this.wsService.generateInstallToken(wsId).subscribe({
      next: result => {
        this.step3Loading.set(false);
        this.installToken.set(result.token);
        this._startClusterPolling(wsId);
      },
      error: (err: Error) => {
        // Erreur non-auth (réseau, 5xx…) — errorInterceptor a déjà géré
        // les cas UNAUTHENTICATED. On utilise le token de démo comme fallback.
        console.error('[Onboarding step 3] generateInstallToken failed:', err);
        this.step3Loading.set(false);
        this.installToken.set('wsk_demo_00000000000000000000000000000000');
        this.step3Error.set(
          this.translateSvc.instant('onboarding.cluster.apiError', { message: err.message }),
        );
      },
    });
  }

  /**
   * Poll `clusterStatus` toutes les 5 s. S'arrête automatiquement :
   * - quand un cluster passe à `connected`
   * - quand le composant est détruit (takeUntilDestroyed)
   */
  private _startClusterPolling(wsId: string): void {
    this.wsService
      .pollClusterStatus(wsId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(clusters => {
        // Arrêter de traiter les résultats si l'utilisateur a quitté step 3
        if (this.currentStep() !== 3) return;

        const connected = clusters.find(c => c.status === 'connected');
        if (connected) {
          this.clusterConnected.set(true);
          this.connectedClusterName.set(connected.name);
          // Pas d'unsubscribe explicite : le polling est géré par `pollClusterStatus`
          // qui expose un `share()` — les prochaines émissions seront ignorées via le
          // check `currentStep() !== 3` au changement d'étape.
        }
      });
  }
}
