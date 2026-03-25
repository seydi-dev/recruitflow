import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jobs-page">
      <div class="page-header">
        <h1>Offres d'emploi</h1>
      </div>

      @if (loading()) {
        <p>Chargement...</p>
      } @else {
        <div class="jobs-list">
          @for (job of jobs(); track job.id) {
            <div class="job-card">
              <div class="job-header">
                <h3>{{ job.title }}</h3>
                <span class="badge" [class]="'badge-' + job.status.toLowerCase()">{{ job.status }}</span>
              </div>
              <p class="job-meta">{{ job.department }} · {{ job.location }}</p>
              @if (job.salaryMin && job.salaryMax) {
                <p class="salary">{{ job.salaryMin | number }}$ – {{ job.salaryMax | number }}$</p>
              }
              <p class="app-count">{{ job.applicationCount }} candidature(s)</p>
            </div>
          } @empty {
            <p>Aucune offre trouvée.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .jobs-page { padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h1 { margin: 0; color: #111827; }
    .jobs-list { display: grid; gap: 1rem; }
    .job-card { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .job-header { display: flex; justify-content: space-between; align-items: flex-start; }
    h3 { margin: 0; color: #111827; }
    .job-meta { color: #6b7280; margin: 0.5rem 0 0; }
    .salary { color: #059669; font-weight: 500; margin: 0.25rem 0 0; }
    .app-count { color: #6b7280; font-size: 0.875rem; margin: 0.5rem 0 0; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .badge-published { background: #d1fae5; color: #065f46; }
    .badge-draft { background: #f3f4f6; color: #374151; }
    .badge-closed { background: #fee2e2; color: #991b1b; }
  `]
})
export class JobsComponent implements OnInit {
  private jobService = inject(JobService);
  jobs = signal<Job[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.jobService.getPublished().subscribe({
      next: data => { this.jobs.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
