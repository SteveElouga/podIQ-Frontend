import { Directive } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

export type DsTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type DsTooltipEvent   = 'hover' | 'focus' | 'both';

/**
 * DsTooltipDirective
 *
 * Encapsule la directive PrimeNG `pTooltip` derrière une API design-system unifiée.
 * Utilise `hostDirectives` pour une composition sans héritage.
 *
 * Usage :
 *   <button dsTooltip="Supprimer l'incident">…</button>
 *   <button dsTooltip="Détails" dsTooltipPos="right" dsTooltipEvent="focus">…</button>
 *   <button dsTooltip="Chargement…" [dsTooltipDisabled]="!isLoading">…</button>
 */
@Directive({
  selector: '[dsTooltip]',
  hostDirectives: [
    {
      directive: Tooltip,
      inputs: [
        // Contenu
        'pTooltip: dsTooltip',
        // Position (top | bottom | left | right)
        'tooltipPosition: dsTooltipPos',
        // Déclencheur (hover | focus | both)
        'tooltipEvent: dsTooltipEvent',
        // Délais en ms
        'showDelay: dsTooltipShowDelay',
        'hideDelay: dsTooltipHideDelay',
        // Désactiver conditionnellement — alias public PrimeNG : tooltipDisabled
        'tooltipDisabled: dsTooltipDisabled',
        // false = autoriser le HTML dans le contenu
        'escape: dsTooltipEscape',
      ],
    },
  ],
})
export class DsTooltipDirective {}
