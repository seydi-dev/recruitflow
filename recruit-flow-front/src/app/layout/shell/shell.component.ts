import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private auth = inject(AuthService);
  collapsed    = signal(false);
  user         = this.auth.currentUser;
  userName     = computed(() => { const u = this.user(); return u ? `${u.firstName} ${u.lastName}` : ''; });
  userInitials = computed(() => { const u = this.user(); return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '?'; });
  userRole     = computed(() => this.user()?.role ?? '');

  navSections = [
    { label: 'GÉNÉRAL', items: [
        { path: '/dashboard',    label: 'Dashboard',    icon: this.icon('dashboard') },
        { path: '/jobs',         label: 'Offres',       icon: this.icon('jobs') },
      ]},
    { label: 'RECRUTEMENT', items: [
        { path: '/applications', label: 'Candidatures', icon: this.icon('applications') },
        { path: '/interviews',   label: 'Entretiens',   icon: this.icon('interviews') },
        { path: '/evaluations',  label: 'Évaluations',  icon: this.icon('evaluations') },
      ]}
  ];

  toggleSidebar() { this.collapsed.update(v => !v); }
  logout()        { this.auth.logout(); }

  private icon(name: string): string {
    const icons: Record<string,string> = {
      dashboard:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      jobs:         `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
      applications: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
      interviews:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      evaluations:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    };
    return icons[name] ?? '';
  }
}
