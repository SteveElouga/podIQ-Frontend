import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  DsIconComponent,
  DsButtonComponent,
  DsTagComponent,
  DsDotComponent,
  DsLangSwitcherComponent,
} from '@shared/design-system';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DsIconComponent, DsButtonComponent, DsTagComponent, DsDotComponent, DsLangSwitcherComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  readonly features = [
    { icon: 'clock',   tagKey: 'landing.features.0.tag', titleKey: 'landing.features.0.title', descKey: 'landing.features.0.desc' },
    { icon: 'git',     tagKey: 'landing.features.1.tag', titleKey: 'landing.features.1.title', descKey: 'landing.features.1.desc' },
    { icon: 'shield',  tagKey: 'landing.features.2.tag', titleKey: 'landing.features.2.title', descKey: 'landing.features.2.desc' },
  ];

  readonly trustBadges = [
    { labelKey: 'landing.hero.trust.0' },
    { labelKey: 'landing.hero.trust.1' },
    { labelKey: 'landing.hero.trust.2' },
  ];

  readonly logoNames = ['MERIDIAN', 'northwind/', 'Cobalt·', 'fjord', 'MICA labs', '↗ uplift', 'vector'];

  showDemo = signal(false);

  openDemo(): void  { this.showDemo.set(true); }
  closeDemo(): void { this.showDemo.set(false); }

  @HostListener('document:keydown.escape')
  onEsc(): void { this.closeDemo(); }
}
