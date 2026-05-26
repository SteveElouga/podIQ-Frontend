import { SemanticTone } from '../tokens';

export type AlertTone = SemanticTone;

export type AlertVariant = 'inline' | 'banner';

export interface DsAlertConfig {
  tone: AlertTone;
  variant: AlertVariant;
  icon: string | null;
}

export const DS_ALERT_DEFAULTS: Readonly<DsAlertConfig> = {
  tone: 'crit',
  variant: 'inline',
  icon: 'alert',
};

export const ALERT_ICON: Partial<Record<AlertTone, string>> = {
  crit: 'alert',
  warn: 'alert',
  info: 'bolt',
  ok: 'check',
};
