import {
  Component, OnInit, inject, signal, computed,
  DestroyRef, ElementRef, viewChild, afterNextRender
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  interviewsThisWeek: number;
  offersExtended: number;
  applicationsByStatus: Record<string, number>;
  topJobs: { jobTitle: string; count: number }[];
}

interface RecentApp {
  id: string;
  candidateName: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
}

const STATUS_COLORS: Record<string,string> = {
  Pending:'#378ADD', Reviewing:'#7F77DD',
  Interview:'#EF9F27', Offer:'#1D9E75', Rejected:'#E24B4A'
};

const STATUS_LABELS: Record<string,string> = {
  Pending:'Nouveau', Reviewing:'Screening',
  Interview:'Entretien', Offer:'Offre', Rejected:'Refusé'
};

const BADGE_CLASSES: Record<string,string> = {
  Pending:'s-new', Reviewing:'s-screen',
  Interview:'s-phone', Offer:'s-hired', Rejected:'s-rejected'
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private http    = inject(HttpClient);
  private auth    = inject(AuthService);
  private destroy = inject(DestroyRef);

  stats      = signal<Stats|null>(null);
  loading    = signal(false);
  chartReady = signal(false);
  today      = new Date();
  readonly isRecruiter = this.auth.isRecruiter;

  // Candidatures récentes récupérées séparément
  recentApps = signal<RecentApp[]>([]);

  readonly statCards = computed(() => {
    const s = this.stats(); if (!s) return [];
    return [
      { label: 'Offres actives',        value: s.activeJobs,         delta: `+${s.totalJobs} au total`,    deltaUp: true  },
      { label: 'Candidatures',          value: s.totalApplications,  delta: `+${s.pendingApplications} en attente`, deltaUp: true  },
      { label: 'Entretiens cette sem.', value: s.interviewsThisWeek, delta: 'Planifiés',                   deltaUp: true  },
      { label: 'Taux de conversion',
        value: s.totalApplications > 0 ? Math.round(s.offersExtended / s.totalApplications * 100) + '%' : '0%',
        delta: `${s.offersExtended} offres émises`, deltaUp: s.offersExtended > 0 }
    ];
  });

  readonly chartData = computed(() => {
    const s = this.stats(); if (!s) return [];
    const total = Object.values(s.applicationsByStatus).reduce((a,b) => a+b, 0) || 1;
    return Object.entries(s.applicationsByStatus).map(([status, count]) => ({
      status, count,
      label: STATUS_LABELS[status] ?? status,
      color: STATUS_COLORS[status] ?? '#9ca3af',
      pct: Math.round(count / total * 100)
    }));
  });

  private donutCanvas = viewChild<ElementRef<HTMLCanvasElement>>('donutCanvas');
  private chart?: Chart;

  ngOnInit() {
    this.loading.set(true);
    this.http.get<Stats>(`${environment.apiUrl}/dashboard`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: s => {
          this.stats.set(s);
          this.loading.set(false);
          this.chartReady.set(true);
          setTimeout(() => this.buildChart(), 100);
        },
        error: () => this.loading.set(false)
      });

    // Charger candidatures récentes
    this.http.get<any>(`${environment.apiUrl}/applications?page=1&pageSize=5`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: r => {
          const list = Array.isArray(r) ? r : (r.items ?? []);
          this.recentApps.set(list.map((a: any) => ({
            id: a.id,
            candidateName: a.candidateName ?? a.candidateFullName ?? 'Candidat',
            jobTitle: a.jobTitle ?? '',
            status: a.status,
            appliedAt: a.appliedAt
          })));
        }
      });
  }

  private buildChart() {
    const canvas = this.donutCanvas()?.nativeElement;
    if (!canvas) { setTimeout(() => this.buildChart(), 100); return; }
    const data = this.chartData();
    if (!data.length) return;
    this.chart?.destroy();
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: data.map(d => d.color),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        animation: { duration: 600 }
      }
    });
  }

  statusLabel(s: string) { return STATUS_LABELS[s] ?? s; }
  badgeClass(s: string)  { return BADGE_CLASSES[s] ?? 's-new'; }
}
