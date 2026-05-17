export type RiskLevel = 'safe' | 'warning' | 'block';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskItem {
  severity: RiskSeverity;
  category: string;
  description: string;
  fix: string;
}

export interface ManifestScanResult {
  riskLevel: RiskLevel;
  summary: string;
  risks: RiskItem[];
}

export interface ScanManifestRequest {
  yamlContent: string;
  manifestType?: string;
}
