import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
  users:        'users',
  home:         'house',
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
  edit:         'pencil',
  externalLink: 'external-link',
  terminal:     'terminal',
  mail:         'mail',
  message:      'message-square',
  slack:        'slack',
  more:         'more',
};

@Component({
  selector: 'ds-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <lucide-angular
      [name]="lucideName()"
      [size]="size()"
      [strokeWidth]="stroke()"
      [color]="color()"
    />
  `,
})
export class DsIconComponent {
  readonly name   = input(DS_ICON_DEFAULTS.name);
  readonly size   = input(DS_ICON_DEFAULTS.size);
  readonly stroke = input(DS_ICON_DEFAULTS.stroke);
  readonly color  = input(DS_ICON_DEFAULTS.color);

  readonly lucideName = computed(() => ICON_MAP[this.name()] ?? this.name());
}
