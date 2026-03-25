import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../core/services/application.service';
import { Application } from '../../core/models/application.model';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="applications-page">
      <h1>Candidatures</h1>

      @if (loading()) {
        <p>Chargement...</p>
      } @else {
        <div class="apps-list">
          @for (app of applications(); track app.id) {
            <div class="app-card">
              <div class="app-header">
                <div>
                  <h3>{{ app.candidateFullName }}</h3>
                  <p class="job-title">{{ app.jobTitle }}</p>
                </div>
                <span class="badge" [class]="'badge-' + app.status.toLowerCase()">{{ app.status }}</span>
              </div>
              <p class="meta">{{ app.candidateEmail }} · {{ app.appliedAt | date:'dd/MM/yyyy' }}</p>
            </div>
          } @empty {
            <p>Aucune candidature.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .applications-page { padding: 2rem; }
    h1 { margin-bottom: 1.5rem; color: #111827; }
    .apps-list { display: grid; gap: 1rem; }
    .app-card { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .app-header { display: flex; justify-content: space-between; align-items: flex-start; }
    h3 { margin: 0; color: #111827; }
    .job-title { color: #2563eb; margin: 0.25rem 0 0; font-size: 0.875rem; }
    .meta { color: #6b7280; font-size: 0.875rem; margin: 0.5rem 0 0; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; white-space: nowrap; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-reviewing { background: #dbeafe; color: #1e40af; }
    .badge-interview { background: #ede9fe; color: #5b21b6; }
    .badge-offer { background: #d1fae5; color: #065f46; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .badge-withdrawn { background: #f3f4f6; color: #374151; }
  `]
})
export class ApplicationsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  applications = signal<Application[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.applicationService.getAll({ pageSize: 20 }).subscribe({
      next: data => { this.applications.set(data.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
