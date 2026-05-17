import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ManifestService } from '../services/manifest.service';
import { ManifestScanResult, RiskLevel } from '../models/manifest.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FloatLabelModule } from 'primeng/floatlabel';

const MANIFEST_TYPES = [
  { label: 'Deployment', value: 'Deployment' },
  { label: 'StatefulSet', value: 'StatefulSet' },
  { label: 'DaemonSet', value: 'DaemonSet' },
  { label: 'Pod', value: 'Pod' },
  { label: 'CronJob', value: 'CronJob' },
  { label: 'Job', value: 'Job' },
];

const EXAMPLE_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: myapp:latest
        env:
        - name: DB_PASSWORD
          value: "hardcoded_password"
        resources: {}
`;

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    MessageModule,
    TextareaModule,
    SelectModule,
    DividerModule,
    AccordionModule,
    ProgressSpinnerModule,
    FloatLabelModule,
  ],
  template: `
    <div class="scan-page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Scan Manifest</h2>
          <p class="page-subtitle">Analyze a Kubernetes manifest before deployment to detect risks</p>
        </div>
      </div>

      <div class="scan-layout">
        <!-- Editor Panel -->
        <p-card styleClass="editor-card" header="YAML Manifest">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="editor-actions">
              <p-select
                formControlName="manifestType"
                [options]="manifestTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Manifest type (optional)"
                styleClass="type-select"
              ></p-select>
              <p-button
                type="button"
                label="Load example"
                icon="pi pi-file-import"
                [text]="true"
                size="small"
                (click)="loadExample()"
              ></p-button>
            </div>

            <textarea
              pTextarea
              formControlName="yamlContent"
              rows="22"
              class="yaml-editor"
              placeholder="Paste your YAML manifest here…"
              spellcheck="false"
            ></textarea>

            @if (error()) {
              <p-message severity="error" [text]="error()!" styleClass="mt-2"></p-message>
            }

            <div class="form-footer">
              <p-button
                type="submit"
                label="Analyze"
                icon="pi pi-shield"
                [loading]="loading()"
                [disabled]="form.invalid"
              ></p-button>
              @if (result()) {
                <p-button
                  type="button"
                  label="Clear"
                  icon="pi pi-times"
                  outlined
                  (click)="reset()"
                ></p-button>
              }
            </div>
          </form>
        </p-card>

        <!-- Result Panel -->
        <div class="result-panel">
          @if (loading()) {
            <p-card styleClass="result-loading">
              <div class="loading-content">
                <p-progressSpinner strokeWidth="3"></p-progressSpinner>
                <p>Analyzing manifest…<br><small>AI model running pre-deploy checks</small></p>
              </div>
            </p-card>
          }

          @if (result()) {
            <p-card styleClass="result-card">
              <div class="result-header">
                <div class="risk-badge" [class]="'risk-' + result()!.riskLevel">
                  <i [class]="riskIcon(result()!.riskLevel)"></i>
                  <span class="risk-label">{{ result()!.riskLevel | uppercase }}</span>
                </div>
                <p class="result-summary">{{ result()!.summary }}</p>
              </div>

              <p-divider></p-divider>

              @if (result()!.risks.length > 0) {
                <div class="risks-list">
                  <h4 class="risks-title">{{ result()!.risks.length }} Issue(s) Found</h4>

                  @for (risk of result()!.risks; track risk.category + risk.description) {
                    <div class="risk-item" [class]="'severity-' + risk.severity">
                      <div class="risk-item-header">
                        <p-tag
                          [value]="risk.severity"
                          [severity]="severityTag(risk.severity)"
                        ></p-tag>
                        <span class="risk-category">{{ risk.category }}</span>
                      </div>
                      <p class="risk-description">{{ risk.description }}</p>
                      <div class="risk-fix">
                        <i class="pi pi-wrench fix-icon"></i>
                        <span>{{ risk.fix }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="no-risks">
                  <i class="pi pi-check-circle"></i>
                  <p>No issues detected. This manifest looks good!</p>
                </div>
              }
            </p-card>
          }

          @if (!result() && !loading()) {
            <div class="empty-result">
              <i class="pi pi-shield empty-icon"></i>
              <p>Paste a YAML manifest and click <strong>Analyze</strong> to see the risk report</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./scan.component.scss'],
})
export class ScanComponent {
  private readonly manifests = inject(ManifestService);
  private readonly fb = inject(FormBuilder);

  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<ManifestScanResult | null>(null);

  manifestTypes = MANIFEST_TYPES;

  form = this.fb.group({
    yamlContent: ['', Validators.required],
    manifestType: ['Deployment'],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    const yamlContent = this.form.value.yamlContent ?? '';
    const manifestType = this.form.value.manifestType ?? undefined;
    this.manifests
      .scanManifest({ yamlContent, manifestType })
      .subscribe({
        next: res => {
          this.result.set(res);
          this.loading.set(false);
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  loadExample(): void {
    this.form.patchValue({ yamlContent: EXAMPLE_YAML });
  }

  reset(): void {
    this.form.reset({ manifestType: 'Deployment' });
    this.result.set(null);
    this.error.set(null);
  }

  riskIcon(level: RiskLevel): string {
    if (level === 'safe') return 'pi pi-check-circle';
    if (level === 'warning') return 'pi pi-exclamation-triangle';
    return 'pi pi-ban';
  }

  severityTag(severity: string): 'success' | 'info' | 'warn' | 'danger' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      low: 'info',
      medium: 'warn',
      high: 'danger',
      critical: 'danger',
    };
    return map[severity] ?? 'info';
  }
}
