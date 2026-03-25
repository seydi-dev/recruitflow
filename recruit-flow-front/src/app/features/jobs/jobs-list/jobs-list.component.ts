import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  salaryMin?: number;
  salaryMax?: number;
  postedAt: string;
  applicationCount?: number;
}

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './jobs-list.component.html',
  styleUrl: './jobs-list.component.scss'
})
export class JobsListComponent implements OnInit {
  private http    = inject(HttpClient);
  private auth    = inject(AuthService);
  private toast   = inject(ToastService);
  private destroy = inject(DestroyRef);

  jobs     = signal<Job[]>([]);
  total    = signal(0);
  loading  = signal(false);
  search   = signal('');
  status   = signal('');
  page     = signal(1);
  pageSize = 6;

  readonly isEmpty     = computed(() => !this.loading() && this.jobs().length === 0);
  readonly totalPages  = computed(() => Math.ceil(this.total() / this.pageSize));
  readonly isRecruiter = this.auth.isRecruiter;
  jobToDelete = signal<Job|null>(null);

  readonly DEPT_ICONS: Record<string,string> = {
    'Technologies': '💻', 'Ingénierie': '💻', 'Infrastructure': '🛠',
    'Produit': '📦', 'Data': '📊', 'Design': '🎨', 'default': '💼'
  };

  ngOnInit() { this.load(); }

  load() {
    let params = new HttpParams().set('page', this.page()).set('pageSize', this.pageSize);
    if (this.search()) params = params.set('search', this.search());
    if (this.status()) params = params.set('status', this.status());
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/jobs`, { params })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: r => { this.jobs.set(r.items ?? r); this.total.set(r.totalCount ?? r.length); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  onSearch(v: string) { this.search.set(v); this.page.set(1); this.load(); }
  onStatus(v: string) { this.status.set(v); this.page.set(1); this.load(); }
  goToPage(p: number) { if (p<1||p>this.totalPages()) return; this.page.set(p); this.load(); }
  confirmDelete(j: Job) { this.jobToDelete.set(j); }
  cancelDelete()        { this.jobToDelete.set(null); }

  executeDelete() {
    const j = this.jobToDelete(); if (!j) return;
    this.http.delete(`${environment.apiUrl}/jobs/${j.id}`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => { this.toast.success('Offre supprimée'); this.jobToDelete.set(null); this.load(); },
        error: () => this.toast.error('Erreur suppression')
      });
  }

  changeStatus(j: Job, status: string) {
    this.http.patch(`${environment.apiUrl}/jobs/${j.id}/status`, { status })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => { this.toast.success('Statut mis à jour'); this.load(); },
        error: () => this.toast.error('Erreur')
      });
  }

  deptIcon(dept: string): string {
    for (const key of Object.keys(this.DEPT_ICONS)) {
      if (dept.includes(key)) return this.DEPT_ICONS[key];
    }
    return this.DEPT_ICONS['default'];
  }

  deptColor(dept: string): string {
    const map: Record<string,string> = {
      'Technologies': '#E6F1FB', 'Ingénierie': '#E6F1FB',
      'Infrastructure': '#E1F5EE', 'Produit': '#EEEDFE',
      'Data': '#FAEEDA', 'Design': '#F1EFE8'
    };
    for (const key of Object.keys(map)) {
      if (dept.includes(key)) return map[key];
    }
    return '#F1EFE8';
  }

  progressPct(count: number, target = 25): number {
    return Math.min(100, Math.round(count / target * 100));
  }

  progressColor(status: string): string {
    return { Published: '#185FA5', Draft: '#888780', Closed: '#E24B4A' }[status] ?? '#185FA5';
  }

  statusLabel(s: string) { return ({ Draft:'Brouillon', Published:'Ouvert', Closed:'Fermé' } as any)[s] ?? s; }
  statusClass(s: string) { return ({ Draft:'st-draft', Published:'st-open', Closed:'st-closed' } as any)[s] ?? ''; }
  formatSalary(min?: number, max?: number) {
    if (!min && !max) return null;
    const f = (n: number) => `${(n/1000).toFixed(0)}k`;
    if (min && max) return `${f(min)} – ${f(max)} $`;
    return min ? `${f(min)}+ $` : `≤${f(max!)} $`;
  }
  trackById(_: number, j: Job) { return j.id; }
}
