import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../services/incident.service';
import { HistoryItem } from '../models/incident.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    MessageModule,
    SkeletonModule,
    TooltipModule,
    DialogModule,
  ],
  template: `
    <div class="history-page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Incident History</h2>
          <p class="page-subtitle">Browse past analyses by pod and namespace</p>
        </div>
        <p-button label="New Analysis" icon="pi pi-plus" routerLink="/incidents/analyze"></p-button>
      </div>

      <!-- Search Form -->
      <p-card styleClass="search-card">
        <form [formGroup]="form" (ngSubmit)="search()">
          <div class="search-grid">
            <div class="field">
              <p-floatlabel>
                <input pInputText id="pod" formControlName="podName" style="width:100%" />
                <label for="pod">Pod Name</label>
              </p-floatlabel>
            </div>
            <div class="field">
              <p-floatlabel>
                <input pInputText id="ns" formControlName="namespace" style="width:100%" />
                <label for="ns">Namespace</label>
              </p-floatlabel>
            </div>
            <p-button
              type="submit"
              label="Search"
              icon="pi pi-search"
              [loading]="loading()"
              [disabled]="form.invalid"
            ></p-button>
          </div>
        </form>
      </p-card>

      <!-- Error -->
      @if (error()) {
        <p-message severity="error" [text]="error()!" styleClass="mt-3"></p-message>
      }

      <!-- Results Table -->
      @if (items().length > 0 || loading()) {
        <p-card styleClass="table-card">
          @if (loading()) {
            <div class="skeleton-rows">
              @for (i of [1,2,3]; track i) {
                <p-skeleton height="48px" styleClass="mb-2"></p-skeleton>
              }
            </div>
          } @else {
            <p-table
              [value]="items()"
              [paginator]="items().length > 10"
              [rows]="10"
              styleClass="p-datatable-sm"
              responsiveLayout="scroll"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Date</th>
                  <th>Error Type</th>
                  <th>Root Cause</th>
                  <th>Confidence</th>
                  <th>Recurring</th>
                  <th></th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item>
                <tr>
                  <td class="date-cell">{{ item.createdAt | date:'MMM d, HH:mm' }}</td>
                  <td>
                    <p-tag [value]="item.errorType" severity="danger"></p-tag>
                  </td>
                  <td class="cause-cell">{{ item.rootCause }}</td>
                  <td>
                    <p-tag
                      [value]="item.confidence"
                      [severity]="confidenceSeverity(item.confidence)"
                    ></p-tag>
                  </td>
                  <td>
                    @if (item.isRecurring) {
                      <p-tag
                        [value]="'×' + item.recurrenceCount"
                        severity="warn"
                        icon="pi pi-refresh"
                      ></p-tag>
                    } @else {
                      <span class="text-muted">–</span>
                    }
                  </td>
                  <td>
                    <p-button
                      icon="pi pi-eye"
                      [text]="true"
                      size="small"
                      pTooltip="View details"
                      (click)="viewDetails(item)"
                    ></p-button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="empty-message">No history found for this pod.</td>
                </tr>
              </ng-template>
            </p-table>
          }
        </p-card>
      }

      @if (!loading() && searched() && items().length === 0 && !error()) {
        <div class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <p>No incidents found for <strong>{{ form.value.podName }}</strong> in namespace <strong>{{ form.value.namespace }}</strong></p>
          <p-button label="Analyze this pod" icon="pi pi-bolt" routerLink="/incidents/analyze"></p-button>
        </div>
      }
    </div>

    <!-- Detail Dialog -->
    <p-dialog
      [(visible)]="detailVisible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      header="Incident Details"
      styleClass="detail-dialog"
    >
      @if (selectedItem()) {
        <div class="detail-content">
          <div class="detail-row">
            <span class="detail-label">Pod</span>
            <code>{{ selectedItem()!.podName }}</code>
          </div>
          <div class="detail-row">
            <span class="detail-label">Namespace</span>
            <code>{{ selectedItem()!.namespace }}</code>
          </div>
          <div class="detail-row">
            <span class="detail-label">Error Type</span>
            <p-tag [value]="selectedItem()!.errorType" severity="danger"></p-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">Root Cause</span>
            <span>{{ selectedItem()!.rootCause }}</span>
          </div>
          <div class="detail-block">
            <span class="detail-label">Solution</span>
            <pre class="detail-solution">{{ selectedItem()!.solution }}</pre>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span>{{ selectedItem()!.createdAt | date:'medium' }}</span>
          </div>
        </div>
      }
    </p-dialog>
  `,
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
  private readonly incidents = inject(IncidentService);
  private readonly fb = inject(FormBuilder);

  items = signal<HistoryItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searched = signal(false);
  detailVisible = false;
  selectedItem = signal<HistoryItem | null>(null);

  form = this.fb.group({
    podName: ['', Validators.required],
    namespace: ['default', Validators.required],
  });

  search(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const podName = this.form.value.podName ?? '';
    const namespace = this.form.value.namespace ?? '';
    this.incidents.getHistory(podName, namespace, 50).subscribe({
      next: items => {
        this.items.set(items);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  viewDetails(item: HistoryItem): void {
    this.selectedItem.set(item);
    this.detailVisible = true;
  }

  confidenceSeverity(c: string): 'success' | 'warn' | 'danger' {
    if (c === 'high') return 'success';
    if (c === 'medium') return 'warn';
    return 'danger';
  }
}
