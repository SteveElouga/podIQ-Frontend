import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface DsIconConfig {
  name: string;
  size: number;
  stroke: number;
  color: string;
}

export const DS_ICON_DEFAULTS: Readonly<DsIconConfig> = {
  name:   'box',
  size:   16,
  stroke: 1.6,
  color:  'currentColor',
};

// Mapping from project shorthand names → Lucide kebab-case names
const ICON_MAP: Record<string, string> = {
  bell:         'bell',
  search:       'search',
  chevron:      'chevron-right',
  chevDown:     'chevron-down',
  plus:         'plus',
  x:            'x',
  check:        'check',
  arrow:        'arrow-right',
  cube:         'box',
  clock:        'clock',
  git:          'git-branch',
  shield:       'shield',
  key:          'key',
  user:         'user',
  bolt:         'zap',
  alert:        'triangle-alert',
  eye:          'eye',
  eyeOff:       'eye-off',
  copy:         'copy',
  play:         'play',
  refresh:      'refresh-cw',
  filter:       'list-filter',
  code:         'code',
  layers:       'layers',
  settings:     'settings',
  download:     'download',
  upload:       'upload',
  moon:         'moon',
  sun:          'sun',
  sliders:      'sliders-horizontal',
  activity:     'activity',
  folder:       'folder',
  pause:        'pause',
  trash:        'trash-2',
  link:         'link',
  externalLink: 'external-link',
  terminal:     'terminal',
};

@Component({
  selector: 'ds-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <lucide-angular
      [name]="lucideName"
      [size]="size"
      [strokeWidth]="stroke"
      [color]="color"
    />
  `,
})
export class DsIconComponent {
  @Input() name:   string = DS_ICON_DEFAULTS.name;
  @Input() size:   number = DS_ICON_DEFAULTS.size;
  @Input() stroke: number = DS_ICON_DEFAULTS.stroke;
  @Input() color:  string = DS_ICON_DEFAULTS.color;

  @Input() set config(cfg: Partial<DsIconConfig>) {
    if (cfg.name   !== undefined) this.name   = cfg.name;
    if (cfg.size   !== undefined) this.size   = cfg.size;
    if (cfg.stroke !== undefined) this.stroke = cfg.stroke;
    if (cfg.color  !== undefined) this.color  = cfg.color;
  }

  get lucideName(): string {
    return ICON_MAP[this.name] ?? this.name;
  }
}
