import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  DsIconComponent,
  DsDotComponent,
  DsButtonComponent,
  DsLangSwitcherComponent,
  DsTagComponent,
} from '@shared/design-system';
import { DotTone } from '@shared/design-system/tokens';

export type InstallMethod = 'helm' | 'kubectl' | 'terraform';
export type PlanId       = 'free' | 'pro' | 'ent';
export type TeamSize     = 'solo' | 'small' | 'mid' | 'large';
export type Region       = 'eu' | 'us' | 'ap';
export type InviteRole   = 'admin' | 'member' | 'viewer';

interface Invite  { email: string; role: InviteRole; status: 'sent' | 'draft'; }
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
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {
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
    if (n < s) return 'done';
    if (n === s) return 'current';
    return 'pending';
  }

  next(): void {
    const s = this.currentStep();
    if (s < this.totalSteps) this.currentStep.set(s + 1);
    else this.currentStep.set(6);
  }

  prev(): void {
    const s = this.currentStep();
    if (s > 1) this.currentStep.set(s - 1);
  }

  mainInnerWidth = computed(() => {
    switch (this.currentStep()) {
      case 1:  return '640px';
      case 2:  return '980px';
      case 3:
      case 4:  return '720px';
      case 5:  return '760px';
      default: return '680px';
    }
  });

  // ── Step 1: Workspace ─────────────────────────────────────────
  workspaceName = signal('');
  urlSlug = computed(() =>
    this.workspaceName()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  );
  selectedAccent = signal('#d97706');
  readonly accents = ['#d97706', '#0e7490', '#15803d', '#7c3aed', '#be123c', '#1f2937'];
  firstLetter = computed(() => this.workspaceName().charAt(0).toUpperCase() || 'A');

  selectedTeamSize = signal<TeamSize>('small');
  readonly teamSizes: { id: TeamSize; labelKey: string }[] = [
    { id: 'solo',  labelKey: 'onboarding.teamSize.solo' },
    { id: 'small', labelKey: 'onboarding.teamSize.small' },
    { id: 'mid',   labelKey: 'onboarding.teamSize.mid' },
    { id: 'large', labelKey: 'onboarding.teamSize.large' },
  ];

  selectedRegion = signal<Region>('eu');
  readonly regions: { id: Region; labelKey: string; subKey: string }[] = [
    { id: 'eu', labelKey: 'onboarding.region.eu', subKey: 'onboarding.region.euSub' },
    { id: 'us', labelKey: 'onboarding.region.us', subKey: 'onboarding.region.usSub' },
    { id: 'ap', labelKey: 'onboarding.region.ap', subKey: 'onboarding.region.apSub' },
  ];

  // ── Step 2: Choose plan ───────────────────────────────────────
  billingCycle = signal<'monthly' | 'annual'>('monthly');
  selectedPlan = signal<PlanId>('pro');

  readonly plans: Plan[] = [
    {
      id: 'free',
      nameKey: 'onboarding.plan.free.name',
      price: { monthly: '$0', annual: '$0' },
      perKey: 'onboarding.plan.free.per',
      subKey: 'onboarding.plan.free.sub',
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
      price: { monthly: '$49', annual: '$39' },
      perKey: 'onboarding.plan.pro.per',
      subKey: 'onboarding.plan.pro.sub',
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
      price: { monthly: 'Custom', annual: 'Custom' },
      perKey: 'onboarding.plan.ent.per',
      subKey: 'onboarding.plan.ent.sub',
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

  private readonly translateSvc = inject(TranslateService);

  selectedPlanNameTranslated = computed(() => {
    const plan = this.plans.find(p => p.id === this.selectedPlan())!;
    return this.translateSvc.instant(plan.nameKey);
  });

  // ── Step 3: Connect cluster ───────────────────────────────────
  readonly installOptions: { id: InstallMethod; titleKey: string; descKey: string; icon: string }[] = [
    { id: 'helm',      titleKey: 'onboarding.methods.0.title', descKey: 'onboarding.methods.0.desc', icon: 'cube' },
    { id: 'kubectl',   titleKey: 'onboarding.methods.1.title', descKey: 'onboarding.methods.1.desc', icon: 'code' },
    { id: 'terraform', titleKey: 'onboarding.methods.2.title', descKey: 'onboarding.methods.2.desc', icon: 'layers' },
  ];

  selectedMethod = signal<InstallMethod>('helm');

  readonly codePre = String.raw`# 1. Add the PodIQ helm repo
helm repo add podiq https://charts.podiq.dev
helm repo update

# 2. Install the agent in the podiq-system namespace
helm install podiq podiq/agent \
  --namespace podiq-system --create-namespace \
  --set workspace.token=`;
  readonly codeToken = 'wsk_3f8a92c1e4d7b6';
  readonly codeSuf = String.raw`

# 3. Verify the agent is running
kubectl get pods -n podiq-system`;
  readonly installCommand = this.codePre + this.codeToken + this.codeSuf;

  copied = signal(false);
  copyCommand(): void {
    navigator.clipboard.writeText(this.installCommand).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  // ── Step 4: Invite team ───────────────────────────────────────
  inviteEmail = signal('');
  inviteRole  = signal<InviteRole>('member');
  invites     = signal<Invite[]>([
    { email: 'marie@acme.io',  role: 'admin',  status: 'sent'  },
    { email: 'jp@acme.io',     role: 'member', status: 'sent'  },
    { email: 'sora.k@acme.io', role: 'member', status: 'draft' },
  ]);
  autoInvite  = signal(false);

  autoInviteDomain = computed(() => {
    const first = this.invites()[0];
    if (first) {
      const at = first.email.indexOf('@');
      if (at > 0) return first.email.slice(at);
    }
    return '@your-domain.io';
  });

  readonly roles: { id: InviteRole; labelKey: string; descKey: string }[] = [
    { id: 'admin',  labelKey: 'onboarding.role.admin',  descKey: 'onboarding.role.adminDesc' },
    { id: 'member', labelKey: 'onboarding.role.member', descKey: 'onboarding.role.memberDesc' },
    { id: 'viewer', labelKey: 'onboarding.role.viewer', descKey: 'onboarding.role.viewerDesc' },
  ];

  inviteEmailInvalid = signal(false);
  inviteLinkCopied   = signal(false);

  private readonly EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  addInvite(): void {
    const email = this.inviteEmail().trim();
    if (!email || !this.EMAIL_RE.test(email)) {
      this.inviteEmailInvalid.set(true);
      return;
    }
    this.inviteEmailInvalid.set(false);
    this.invites.update(list => [...list, { email, role: this.inviteRole(), status: 'draft' }]);
    this.inviteEmail.set('');
  }

  clearInviteError(): void {
    if (this.inviteEmailInvalid()) this.inviteEmailInvalid.set(false);
  }

  removeInvite(email: string): void {
    this.invites.update(list => list.filter(i => i.email !== email));
  }

  copyInviteLink(): void {
    const link = `https://app.podiq.io/join/${this.urlSlug() || 'your-workspace'}`;
    navigator.clipboard.writeText(link).then(() => {
      this.inviteLinkCopied.set(true);
      setTimeout(() => this.inviteLinkCopied.set(false), 2000);
    });
  }

  // ── Step 5: Wire up alerts ────────────────────────────────────
  alertRules = signal<AlertRule[]>([
    { id: 'crash',     titleKey: 'onboarding.alert.crash',     hintKey: 'onboarding.alert.crashHint',     tone: 'crit',   enabled: true  },
    { id: 'memory',    titleKey: 'onboarding.alert.memory',    hintKey: 'onboarding.alert.memoryHint',    tone: 'warn',   enabled: true  },
    { id: 'predeploy', titleKey: 'onboarding.alert.predeploy', hintKey: 'onboarding.alert.predeployHint', tone: 'info',   enabled: true  },
    { id: 'fix',       titleKey: 'onboarding.alert.fix',       hintKey: 'onboarding.alert.fixHint',       tone: 'accent', enabled: false },
  ]);

  channels = signal<Channel[]>([
    { id: 'slack',     icon: 'git',   labelKey: 'onboarding.channel.slack',     descKey: 'onboarding.channel.slackDesc',     connected: true,  disabled: false, tag: 'onboarding.channel.recommended' },
    { id: 'pagerduty', icon: 'alert', labelKey: 'onboarding.channel.pagerduty', descKey: 'onboarding.channel.pagerdutyDesc', connected: true,  disabled: false },
    { id: 'email',     icon: 'user',  labelKey: 'onboarding.channel.email',     descKey: 'onboarding.channel.emailDesc',     connected: false, disabled: false },
    { id: 'webhook',   icon: 'code',  labelKey: 'onboarding.channel.webhook',   descKey: 'onboarding.channel.webhookDesc',   connected: false, disabled: false },
    { id: 'teams',     icon: 'cube',  labelKey: 'onboarding.channel.teams',     descKey: 'onboarding.channel.teamsDesc',     connected: false, disabled: true  },
    { id: 'discord',   icon: 'play',  labelKey: 'onboarding.channel.discord',   descKey: 'onboarding.channel.discordDesc',   connected: false, disabled: false },
  ]);

  connectedCount = computed(() => this.channels().filter(c => c.connected).length);

  quietHours = signal(true);

  toggleAlert(id: string): void {
    this.alertRules.update(rules =>
      rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  }

  // ── Complete ──────────────────────────────────────────────────
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

  private readonly router = inject(Router);

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
