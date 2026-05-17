import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IncidentService } from '../services/incident.service';
import { AnalysisJob } from '../models/incident.model';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { RouterLink as RouterLinkDirective } from '@angular/router';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLinkDirective,
    CardModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    FloatLabelModule,
    TagModule,
    DividerModule,
    ChipModule,
  ],
  template: `
    <div class="analyze-page">
      <div class="page-header">
        <h2 class="page-title">Analyze Incident</h2>
        <p class="page-subtitle">Enter the pod details to trigger an AI-powered diagnosis</p>
      </div>

      <!-- Form -->
      @if (phase() === 'form') {
        <p-card styleClass="form-card">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <div class="field">
                <p-floatlabel>
                  <input pInputText id="podName" formControlName="podName" style="width:100%" />
                  <label for="podName">Pod Name</label>
                </p-floatlabel>
                <small class="field-hint">e.g. api-gateway-7d9f, postgres-0</small>
              </div>
              <div class="field">
                <p-floatlabel>
                  <input pInputText id="namespace" formControlName="namespace" style="width:100%" />
                  <label for="namespace">Namespace</label>
                </p-floatlabel>
                <small class="field-hint">e.g. default, production</small>
              </div>
            </div>

            <div class="form-actions">
              <p-button
                type="submit"
                label="Start Analysis"
                icon="pi pi-bolt"
                [loading]="submitting()"
                [disabled]="form.invalid"
              ></p-button>
            </div>
          </form>

          @if (submitError()) {
            <p-message severity="error" [text]="submitError()!" styleClass="mt-3"></p-message>
          }
        </p-card>
      }

      <!-- Polling -->
      @if (phase() === 'polling') {
        <p-card styleClass="polling-card">
          <div class="polling-content">
            <p-progressSpinner strokeWidth="3" animationDuration=".8s"></p-progressSpinner>
            <div class="polling-info">
              <h3 class="polling-title">Analyzing pod <code>{{ form.value.podName }}</code></h3>
              <p class="polling-status">Status: <strong>{{ currentJob()?.status }}</strong></p>
              <p class="polling-hint">Collecting logs, scanning namespace, querying AI model…</p>
            </div>
          </div>
        </p-card>
      }

      <!-- Failed -->
      @if (phase() === 'failed') {
        <p-card styleClass="error-card">
          <div class="error-content">
            <i class="pi pi-times-circle error-icon"></i>
            <h3>Analysis Failed</h3>
            <p>{{ currentJob()?.error || 'An unexpected error occurred.' }}</p>
            <p-button label="Try Again" icon="pi pi-refresh" (click)="reset()"></p-button>
          </div>
        </p-card>
      }

      <!-- Result -->
      @if (phase() === 'result') {
        @if (currentJob()?.result; as result) {
          <div class="result-grid">
            <!-- Diagnosis -->
            <p-card styleClass="result-card" header="Diagnosis">
              <div class="result-meta">
                <p-tag [value]="result.errorType" severity="danger"></p-tag>
                <p-tag
                  [value]="result.confidence + ' confidence'"
                  [severity]="confidenceSeverity(result.confidence)"
                ></p-tag>
                @if (result.isRecurring) {
                  <p-tag
                    [value]="'Recurring × ' + result.recurrenceCount"
                    severity="warn"
                    icon="pi pi-refresh"
                  ></p-tag>
                }
              </div>

              <p-divider></p-divider>

              <div class="result-block">
                <h4>Root Cause</h4>
                <p>{{ result.rootCause }}</p>
              </div>
              <div class="result-block">
                <h4>Explanation</h4>
                <p>{{ result.explanation }}</p>
              </div>
            </p-card>

            <!-- Solution -->
            <p-card styleClass="result-card solution-card" header="Solution">
              <pre class="solution-text">{{ result.solution }}</pre>
            </p-card>

            <!-- Correlation -->
            @if (result.correlatedService) {
              <p-card
                styleClass="result-card correlation-card"
                header="Cross-Service Correlation"
              >
                <div class="correlation-content">
                  <i class="pi pi-link correlation-icon"></i>
                  <div>
                    <div class="correlation-service">
                      <p-chip [label]="result.correlatedService" icon="pi pi-server"></p-chip>
                    </div>
                    <p class="correlation-explanation">{{ result.correlationExplanation }}</p>
                  </div>
                </div>
              </p-card>
            }

            <div class="result-actions">
              <p-button label="New Analysis" icon="pi pi-plus" outlined (click)="reset()"></p-button>
              <p-button
                label="View History"
                icon="pi pi-history"
                text
                routerLink="/incidents/history"
              ></p-button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styleUrls: ['./analyze.component.scss'],
})
export class AnalyzeComponent implements OnDestroy {
  private readonly incidents = inject(IncidentService);
  private readonly fb = inject(FormBuilder);
  private pollSub?: Subscription;

  phase = signal<'form' | 'polling' | 'result' | 'failed'>('form');
  submitting = signal(false);
  submitError = signal<string | null>(null);
  currentJob = signal<AnalysisJob | null>(null);

  form = this.fb.group({
    podName: ['', Validators.required],
    namespace: ['default', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.submitError.set(null);
    const podName = this.form.value.podName ?? '';
    const namespace = this.form.value.namespace ?? '';
    this.incidents.analyze({ podName, namespace }).subscribe({
      next: res => {
        this.submitting.set(false);
        this.phase.set('polling');
        this._startPolling(res.analyzeIncident.jobId);
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.submitError.set(err.message);
      },
    });
  }

  private _startPolling(jobId: string): void {
    this.pollSub = this.incidents.pollJob(jobId).subscribe({
      next: job => {
        this.currentJob.set(job);
        if (job.status === 'complete') this.phase.set('result');
        if (job.status === 'failed') this.phase.set('failed');
      },
      error: (err: Error) => {
        this.phase.set('failed');
        this.currentJob.update(j => (j ? { ...j, error: err.message } : null));
      },
    });
  }

  reset(): void {
    this.pollSub?.unsubscribe();
    this.phase.set('form');
    this.currentJob.set(null);
    this.submitError.set(null);
  }

  confidenceSeverity(confidence: string): 'success' | 'warn' | 'danger' {
    if (confidence === 'high') return 'success';
    if (confidence === 'medium') return 'warn';
    return 'danger';
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}
