import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DsIconComponent, DsButtonComponent, DsLangSwitcherComponent } from '@shared/design-system';

export type InstallMethod = 'helm' | 'kubectl' | 'terraform';

interface Step {
  n: number;
  labelKey: string;
  state: 'done' | 'current' | 'pending';
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DsIconComponent, DsButtonComponent, DsLangSwitcherComponent],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {
  readonly steps: Step[] = [
    { n: 1, labelKey: 'onboarding.steps.0', state: 'done' },
    { n: 2, labelKey: 'onboarding.steps.1', state: 'current' },
    { n: 3, labelKey: 'onboarding.steps.2', state: 'pending' },
    { n: 4, labelKey: 'onboarding.steps.3', state: 'pending' },
  ];

  readonly installOptions: { id: InstallMethod; titleKey: string; descKey: string; icon: string }[] = [
    { id: 'helm',      titleKey: 'onboarding.methods.0.title', descKey: 'onboarding.methods.0.desc', icon: 'cube' },
    { id: 'kubectl',   titleKey: 'onboarding.methods.1.title', descKey: 'onboarding.methods.1.desc', icon: 'code' },
    { id: 'terraform', titleKey: 'onboarding.methods.2.title', descKey: 'onboarding.methods.2.desc', icon: 'layers' },
  ];

  selectedMethod = signal<InstallMethod>('helm');

  readonly installCommand = String.raw`# 1. Add the PodIQ helm repo
helm repo add podiq https://charts.podiq.dev
helm repo update

# 2. Install the agent in the podiq-system namespace
helm install podiq podiq/agent \
  --namespace podiq-system --create-namespace \
  --set workspace.token=wsk_3f8a92c1e4d7b6

# 3. Verify the agent is running
kubectl get pods -n podiq-system`;

  copied = signal(false);

  copyCommand(): void {
    navigator.clipboard.writeText(this.installCommand).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
