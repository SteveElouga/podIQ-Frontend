import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, SkeletonModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h2 class="page-title">Dashboard</h2>
          <p class="page-subtitle">Welcome back, {{ userEmail }}</p>
        </div>
        <p-button
          label="Analyze Incident"
          icon="pi pi-bolt"
          routerLink="/incidents/analyze"
        ></p-button>
      </div>

      <!-- KPI Cards -->
      <div class="stat-grid">
        @for (card of statCards; track card.label) {
          <div class="stat-card" [style.--accent]="card.color">
            <div class="stat-icon">
              <i [class]="card.icon"></i>
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="section-title">Quick Actions</div>
      <div class="quick-actions">
        @for (action of quickActions; track action.label) {
          <a class="action-card" [routerLink]="action.route">
            <i [class]="action.icon + ' action-icon'"></i>
            <div>
              <div class="action-label">{{ action.label }}</div>
              <div class="action-desc">{{ action.desc }}</div>
            </div>
            <i class="pi pi-arrow-right action-arrow"></i>
          </a>
        }
      </div>

      <!-- What's New -->
      <div class="section-title">Platform Features</div>
      <div class="features-grid">
        @for (feat of features; track feat.title) {
          <p-card styleClass="feature-card">
            <div class="feature-content">
              <span class="feature-badge">{{ feat.badge }}</span>
              <h4 class="feature-title">{{ feat.title }}</h4>
              <p class="feature-desc">{{ feat.desc }}</p>
            </div>
          </p-card>
        }
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private auth = inject(AuthService);

  get userEmail(): string {
    return this.auth.getCurrentUser()?.email ?? 'user';
  }

  statCards: StatCard[] = [
    { label: 'Total Analyses', value: '–', icon: 'pi pi-chart-bar', color: '#6366f1', route: '/incidents/history' },
    { label: 'Recurring Incidents', value: '–', icon: 'pi pi-refresh', color: '#f59e0b' },
    { label: 'Manifests Scanned', value: '–', icon: 'pi pi-shield', color: '#10b981', route: '/manifests/scan' },
    { label: 'Blocked Deployments', value: '–', icon: 'pi pi-ban', color: '#ef4444' },
  ];

  quickActions = [
    { label: 'Analyze a pod incident', desc: 'Get AI diagnosis for a failing pod', icon: 'pi pi-bolt', route: '/incidents/analyze' },
    { label: 'Scan a manifest', desc: 'Pre-deploy YAML risk analysis', icon: 'pi pi-shield', route: '/manifests/scan' },
    { label: 'View incident history', desc: 'Browse past analyses and patterns', icon: 'pi pi-history', route: '/incidents/history' },
    { label: 'Manage API keys', desc: 'Configure CI/CD pipeline access', icon: 'pi pi-key', route: '/settings/api-keys' },
  ];

  features = [
    {
      badge: 'Memory',
      title: 'Incident Memory',
      desc: 'PodIQ remembers past incidents and detects recurring patterns so you don\'t repeat the same fix twice.',
    },
    {
      badge: 'Pre-Deploy',
      title: 'YAML Risk Scanner',
      desc: 'Analyze a Kubernetes manifest before kubectl apply and get a risk report with actionable fixes.',
    },
    {
      badge: 'Correlation',
      title: 'Cross-Service Correlation',
      desc: 'Detect when a crash in service A is caused by a failure in service B using temporal analysis.',
    },
    {
      badge: 'CI/CD',
      title: 'Pipeline Gate',
      desc: 'Block dangerous deployments natively in GitHub Actions or GitLab CI using the REST API.',
    },
  ];
}
