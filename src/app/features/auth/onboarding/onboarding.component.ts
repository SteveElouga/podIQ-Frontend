import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  DsIconComponent,
  DsButtonComponent,
  DsLangSwitcherComponent,
  DsTagComponent,
} from '@shared/design-system';

export type InstallMethod = 'helm' | 'kubectl' | 'terraform';
export type PlanId       = 'free' | 'pro' | 'ent';
export type TeamSize     = 'solo' | 'small' | 'mid' | 'large';
export type Region       = 'eu' | 'us' | 'ap';
export type InviteRole   = 'admin' | 'member' | 'viewer';

interface Invite  { email: string; role: InviteRole; }
interface AlertRule { id: string; labelKey: string; enabled: boolean; }
interface Channel { id: string; icon: string; labelKey: string; connected: boolean; active: boolean; disabled: boolean; }

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
  invites     = signal<Invite[]>([]);
  autoInvite  = signal(false);

  readonly roles: { id: InviteRole; labelKey: string; descKey: string }[] = [
    { id: 'admin',  labelKey: 'onboarding.role.admin',  descKey: 'onboarding.role.adminDesc' },
    { id: 'member', labelKey: 'onboarding.role.member', descKey: 'onboarding.role.memberDesc' },
    { id: 'viewer', labelKey: 'onboarding.role.viewer', descKey: 'onboarding.role.viewerDesc' },
  ];

  addInvite(): void {
    const email = this.inviteEmail().trim();
    if (!email) return;
    this.invites.update(list => [...list, { email, role: this.inviteRole() }]);
    this.inviteEmail.set('');
  }

  removeInvite(email: string): void {
    this.invites.update(list => list.filter(i => i.email !== email));
  }

  // ── Step 5: Wire up alerts ────────────────────────────────────
  alertRules = signal<AlertRule[]>([
    { id: 'crash',     labelKey: 'onboarding.alert.crash',     enabled: true  },
    { id: 'memory',    labelKey: 'onboarding.alert.memory',    enabled: true  },
    { id: 'predeploy', labelKey: 'onboarding.alert.predeploy', enabled: false },
    { id: 'fix',       labelKey: 'onboarding.alert.fix',       enabled: true  },
  ]);

  channels = signal<Channel[]>([
    { id: 'slack',     icon: 'slack',   labelKey: 'onboarding.channel.slack',     connected: true,  active: true,  disabled: false },
    { id: 'pagerduty', icon: 'bell',    labelKey: 'onboarding.channel.pagerduty', connected: true,  active: false, disabled: false },
    { id: 'email',     icon: 'mail',    labelKey: 'onboarding.channel.email',     connected: false, active: false, disabled: false },
    { id: 'webhook',   icon: 'code',    labelKey: 'onboarding.channel.webhook',   connected: false, active: false, disabled: false },
    { id: 'teams',     icon: 'message', labelKey: 'onboarding.channel.teams',     connected: false, active: false, disabled: true  },
    { id: 'discord',   icon: 'message', labelKey: 'onboarding.channel.discord',   connected: false, active: false, disabled: false },
  ]);

  quietHours = signal(false);

  toggleAlert(id: string): void {
    this.alertRules.update(rules =>
      rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  }

  toggleChannel(id: string): void {
    this.channels.update(chs =>
      chs.map(c => c.id === id ? { ...c, active: !c.active } : c)
    );
  }

  // ── Complete ──────────────────────────────────────────────────
  readonly summaryCards: { icon: string; titleKey: string; subKey: string }[] = [
    { icon: 'home',    titleKey: 'onboarding.complete.workspace', subKey: 'onboarding.complete.workspaceSub' },
    { icon: 'cube',    titleKey: 'onboarding.complete.cluster',   subKey: 'onboarding.complete.clusterSub'   },
    { icon: 'users',   titleKey: 'onboarding.complete.team',      subKey: 'onboarding.complete.teamSub'      },
    { icon: 'bell',    titleKey: 'onboarding.complete.alerts',    subKey: 'onboarding.complete.alertsSub'    },
  ];

  readonly nextActions: string[] = [
    'onboarding.complete.action0',
    'onboarding.complete.action1',
    'onboarding.complete.action2',
  ];

  private readonly router = inject(Router);

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
