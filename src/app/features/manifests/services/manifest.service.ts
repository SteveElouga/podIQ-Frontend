import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../core/services/graphql.service';
import { ManifestScanResult, ScanManifestRequest } from '../models/manifest.model';
import { environment } from '../../../../environments/environment';

const SCAN_MUTATION = `
  mutation ScanManifest($yamlContent: String!, $manifestType: String) {
    scanManifest(yamlContent: $yamlContent, manifestType: $manifestType) {
      riskLevel summary
      risks { severity category description fix }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class ManifestService {
  private readonly gql = inject(GraphqlService);
  private readonly http = inject(HttpClient);

  scanManifest(req: ScanManifestRequest): Observable<ManifestScanResult> {
    return this.gql
      .mutate<{ scanManifest: ManifestScanResult }>(SCAN_MUTATION, req)
      .pipe(map(res => res.scanManifest));
  }

  cicdScan(apiKey: string, yamlContent: string, manifestType?: string): Observable<CicdScanResult> {
    const headers = new HttpHeaders({ 'X-Api-Key': apiKey, 'Content-Type': 'application/json' });
    return this.http.post<CicdScanResult>(
      `${environment.apiUrl}/api/v1/cicd/scan`,
      { yaml_content: yamlContent, manifest_type: manifestType },
      { headers }
    );
  }
}

export interface CicdScanResult {
  exit_code: number;
  risk_level: string;
  summary: string;
  risks: { severity: string; category: string; description: string; fix: string }[];
}
