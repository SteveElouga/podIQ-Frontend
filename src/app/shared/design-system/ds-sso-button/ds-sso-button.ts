import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DsIconComponent } from '../ds-icon/ds-icon.component';

export type SsoBrand = 'google' | 'github' | 'saml';

@Component({
  selector: 'ds-sso-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsIconComponent],
  templateUrl: './ds-sso-button.html',
  styleUrl: './ds-sso-button.scss',
})
export class DsSsoButtonComponent {
  /** Prioritaire sur icon — affiche un vrai SVG de marque */
  readonly brand = input<SsoBrand>();
  /** Icône lucide de fallback */
  readonly icon = input<string>();
  readonly full = input(false);
  readonly disabled = input(false);
}
