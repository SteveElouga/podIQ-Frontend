import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiKeyService } from '../services/api-key.service';
import { ApiKey, CreateApiKeyResponse } from '../models/api-key.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    TagModule,
    DialogModule,
    MessageModule,
    DividerModule,
    ConfirmDialogModule,
    TooltipModule,
    ToastModule,
    SkeletonModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="api-keys-page">
      <div class="page-header">
        <div>
          <h2 class="page-title">API Keys</h2>
          <p class="page-subtitle">Manage API keys for CI/CD pipeline integration</p>
        </div>
        <p-button
          label="Create Key"
          icon="pi pi-plus"
          (click)="showCreate = true"
        ></p-button>
      </div>

      <!-- CI/CD instructions -->
      <p-card styleClass="info-card" header="CI/CD Integration">
        <p class="info-text">
          Use API keys to authenticate the
          <code>POST /api/v1/cicd/scan</code> endpoint from your pipeline.
          Pass the key in the <code>X-Api-Key</code> header.
        </p>
        <div class="code-block">
          <pre>curl -X POST http://your-podiq-host/api/v1/cicd/scan \
  -H "X-Api-Key: &lt;your-api-key&gt;" \
  -H "Content-Type: application/json" \
  -d '&#123;"yaml_content": "...", "manifest_type": "Deployment"&#125;'

# Exit codes: 0=safe  1=warning  2=block (pipeline stops)</pre>
        </div>
      </p-card>

      <!-- Keys Table -->
      <p-card styleClass="table-card">
        @if (loading()) {
          <div class="skeleton-rows">
            @for (i of [1,2,3]; track i) {
              <p-skeleton height="48px" styleClass="mb-2"></p-skeleton>
            }
          </div>
        } @else {
          <p-table [value]="keys()" styleClass="p-datatable-sm" responsiveLayout="scroll">
            <ng-template pTemplate="header">
              <tr>
                <th>Name</th>
                <th>Key ID</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Status</th>
                <th></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-key>
              <tr>
                <td><strong>{{ key.name }}</strong></td>
                <td><code class="key-id">{{ key.keyId | slice:0:8 }}…</code></td>
                <td class="date-cell">{{ key.createdAt | date:'MMM d, y' }}</td>
                <td class="date-cell">{{ key.lastUsed ? (key.lastUsed | date:'MMM d') : '–' }}</td>
                <td>
                  <p-tag
                    [value]="key.isActive ? 'Active' : 'Revoked'"
                    [severity]="key.isActive ? 'success' : 'danger'"
                  ></p-tag>
                </td>
                <td>
                  @if (key.isActive) {
                    <p-button
                      icon="pi pi-trash"
                      severity="danger"
                      [text]="true"
                      size="small"
                      pTooltip="Revoke key"
                      (click)="confirmRevoke(key)"
                    ></p-button>
                  }
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="empty-cell">
                  No API keys yet. Create one to integrate with your CI/CD pipeline.
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>

    <!-- Create Dialog -->
    <p-dialog
      [(visible)]="showCreate"
      [modal]="true"
      header="Create API Key"
      [draggable]="false"
      styleClass="create-dialog"
    >
      <form [formGroup]="createForm" (ngSubmit)="createKey()">
        <div class="field">
          <p-floatlabel>
            <input pInputText id="name" formControlName="name" style="width:100%" />
            <label for="name">Key name</label>
          </p-floatlabel>
          <small class="field-hint">e.g. github-actions-prod, gitlab-ci-staging</small>
        </div>

        @if (createError()) {
          <p-message severity="error" [text]="createError()!" styleClass="mb-3"></p-message>
        }

        <div class="dialog-actions">
          <p-button type="button" label="Cancel" outlined (click)="showCreate = false"></p-button>
          <p-button
            type="submit"
            label="Create"
            icon="pi pi-check"
            [loading]="creating()"
            [disabled]="createForm.invalid"
          ></p-button>
        </div>
      </form>
    </p-dialog>

    <!-- New Key Display Dialog -->
    <p-dialog
      [(visible)]="showNewKey"
      [modal]="true"
      header="API Key Created"
      [draggable]="false"
      [closable]="false"
      styleClass="new-key-dialog"
    >
      <div class="new-key-content">
        <p-message
          severity="warn"
          text="Copy this key now — it will never be shown again."
          styleClass="mb-4"
        ></p-message>

        <div class="key-display">
          <code class="key-value">{{ newKey()?.rawKey }}</code>
          <p-button
            icon="pi pi-copy"
            [text]="true"
            pTooltip="Copy to clipboard"
            (click)="copyKey()"
          ></p-button>
        </div>

        <div class="new-key-meta">
          <span><strong>Name:</strong> {{ newKey()?.name }}</span>
          <span><strong>ID:</strong> {{ newKey()?.keyId }}</span>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="I've saved the key" icon="pi pi-check" (click)="closeNewKey()"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styleUrls: ['./api-keys.component.scss'],
})
export class ApiKeysComponent implements OnInit {
  private readonly apiKeyService = inject(ApiKeyService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmSvc = inject(ConfirmationService);
  private readonly messageSvc = inject(MessageService);

  keys = signal<ApiKey[]>([]);
  loading = signal(false);
  creating = signal(false);
  createError = signal<string | null>(null);
  newKey = signal<CreateApiKeyResponse | null>(null);

  showCreate = false;
  showNewKey = false;

  createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.loadKeys();
  }

  loadKeys(): void {
    this.loading.set(true);
    this.apiKeyService.listApiKeys().subscribe({
      next: keys => { this.keys.set(keys); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  createKey(): void {
    if (this.createForm.invalid) return;
    this.creating.set(true);
    this.createError.set(null);
    this.apiKeyService.createApiKey(this.createForm.value.name ?? '').subscribe({
      next: res => {
        this.creating.set(false);
        this.showCreate = false;
        this.newKey.set(res);
        this.showNewKey = true;
        this.createForm.reset();
        this.loadKeys();
      },
      error: (err: Error) => {
        this.createError.set(err.message);
        this.creating.set(false);
      },
    });
  }

  confirmRevoke(key: ApiKey): void {
    this.confirmSvc.confirm({
      message: `Revoke key <strong>${key.name}</strong>? Any pipeline using it will stop working immediately.`,
      header: 'Revoke API Key',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.revokeKey(key.keyId),
    });
  }

  private revokeKey(keyId: string): void {
    this.apiKeyService.revokeApiKey(keyId).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Key revoked' });
        this.loadKeys();
      },
      error: () => this.messageSvc.add({ severity: 'error', summary: 'Revoke failed' }),
    });
  }

  copyKey(): void {
    const key = this.newKey()?.rawKey;
    if (key) {
      navigator.clipboard.writeText(key);
      this.messageSvc.add({ severity: 'success', summary: 'Copied to clipboard' });
    }
  }

  closeNewKey(): void {
    this.showNewKey = false;
    this.newKey.set(null);
  }
}
