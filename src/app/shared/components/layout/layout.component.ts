import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { DsIconComponent } from '../../design-system/ds-icon/ds-icon.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    BadgeModule,
    RippleModule,
    ToastModule,
    DsIconComponent,
  ],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <div class="app-shell">
      <!-- Sidebar -->
      <nav class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">⎈</span>
            @if (!sidebarCollapsed()) {
              <span class="logo-text">PodIQ</span>
            }
          </div>
          <button
            class="collapse-btn"
            pButton
            [icon]="sidebarCollapsed() ? 'pi pi-angle-right' : 'pi pi-angle-left'"
            [text]="true"
            [rounded]="true"
            size="small"
            (click)="toggleSidebar()"
          ></button>
        </div>

        <ul class="nav-list">
          @for (item of navItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                [pTooltip]="sidebarCollapsed() ? item.label : ''"
                tooltipPosition="right"
                pRipple
              >
                <i [class]="item.icon"></i>
                @if (!sidebarCollapsed()) {
                  <span>{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>

        <div class="sidebar-footer">
          <a
            routerLink="/settings/api-keys"
            routerLinkActive="active"
            [pTooltip]="sidebarCollapsed() ? 'Settings' : ''"
            tooltipPosition="right"
            pRipple
          >
            <i class="pi pi-cog"></i>
            @if (!sidebarCollapsed()) { <span>Settings</span> }
          </a>
          <button
            class="logout-btn"
            [pTooltip]="sidebarCollapsed() ? 'Logout' : ''"
            tooltipPosition="right"
            pRipple
            (click)="logout()"
          >
            <i class="pi pi-sign-out"></i>
            @if (!sidebarCollapsed()) { <span>Logout</span> }
          </button>
        </div>
      </nav>

      <!-- Main -->
      <div class="main-area">
        <header class="topbar">
          <div class="topbar-left">
            <span class="breadcrumb">{{ pageTitle }}</span>
          </div>
          <div class="topbar-right">
            <!-- Toggle dark / light mode -->
            <button
              class="theme-toggle"
              pRipple
              [pTooltip]="theme.isDark() ? 'Mode clair' : 'Mode sombre'"
              tooltipPosition="bottom"
              (click)="theme.toggle()"
              [attr.aria-label]="theme.isDark() ? 'Passer en mode clair' : 'Passer en mode sombre'"
            >
              @if (theme.isDark()) {
                <ds-icon name="sun" [size]="18" />
              } @else {
                <ds-icon name="moon" [size]="18" />
              }
            </button>

            <div class="user-chip">
              <p-avatar
                [label]="userInitial"
                shape="circle"
                styleClass="avatar-sm"
              ></p-avatar>
              @if (!sidebarCollapsed()) {
                <span class="user-email">{{ userEmail }}</span>
              }
            </div>
          </div>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  sidebarCollapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Analyze Incident', icon: 'pi pi-bolt', route: '/incidents/analyze' },
    { label: 'History', icon: 'pi pi-history', route: '/incidents/history' },
    { label: 'Scan Manifest', icon: 'pi pi-shield', route: '/manifests/scan' },
  ];

  get userEmail(): string {
    return this.auth.getCurrentUser()?.email ?? '';
  }

  get userInitial(): string {
    return (this.userEmail[0] ?? 'U').toUpperCase();
  }

  get pageTitle(): string {
    return 'PodIQ';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
