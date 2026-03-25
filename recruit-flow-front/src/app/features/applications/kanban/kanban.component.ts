import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

type AppStatus = 'Pending'|'Reviewing'|'Interview'|'Offer'|'Rejected';

interface App {
  id: string;
  status: AppStatus;
  candidateName?: string;
  candidateFullName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  appliedAt: string;
}

const COLS: { status: AppStatus; label: string; colorBg: string; colorText: string }[] = [
  { status: 'Pending',   label: 'Nouveau',       colorBg: '#E6F1FB', colorText: '#0C447C' },
  { status: 'Reviewing', label: 'Screening',      colorBg: '#EEEDFE', colorText: '#3C3489' },
  { status: 'Interview', label: 'Entretien',      colorBg: '#FAEEDA', colorText: '#633806' },
  { status: 'Offer',     label: 'Offre',          colorBg: '#E1F5EE', colorText: '#085041' },
  { status: 'Rejected',  label: 'Refusé',         colorBg: '#FCEBEB', colorText: '#791F1F' },
];

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent implements OnInit {
  private http    = inject(HttpClient);
  private toast   = inject(ToastService);
  private router  = inject(Router);
  private destroy = inject(DestroyRef);

  apps        = signal<App[]>([]);
  loading     = signal(false);
  draggedApp  = signal<App|null>(null);
  dragOverCol = signal<AppStatus|null>(null);

  readonly cols      = COLS;
  readonly totalApps = computed(() => this.apps().length);

  colApps(status: AppStatus) {
    return computed(() => this.apps().filter(a => a.status === status));
  }

  colCount(status: AppStatus) {
    return this.apps().filter(a => a.status === status).length;
  }

  getName(app: App): string {
    return app.candidateName ?? app.candidateFullName ?? 'Candidat';
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/applications?page=1&pageSize=100`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: r => {
          const list = Array.isArray(r) ? r : (r.items ?? []);
          this.apps.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onDragStart(e: DragEvent, a: App) {
    this.draggedApp.set(a);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', a.id);
    }
  }

  onDragEnd() {
    this.draggedApp.set(null);
    this.dragOverCol.set(null);
    document.querySelectorAll('.kb-col').forEach(el => el.classList.remove('drag-over'));

  }

  onDragOver(e: DragEvent, s: AppStatus) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    this.dragOverCol.set(s);
  }

  onDragLeave(e: DragEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom) {
      this.dragOverCol.set(null);
    }
  }

  onDrop(e: DragEvent, target: AppStatus) {
    e.preventDefault();
    e.stopPropagation();
    const a = this.draggedApp();
    this.draggedApp.set(null);    // ← reset immédiat
    this.dragOverCol.set(null);
    if (!a || a.status === target) return;
    const snap = this.apps();
    this.apps.update(list => list.map(x => x.id === a.id ? { ...x, status: target } : x));

    this.http.patch(`${environment.apiUrl}/applications/${a.id}/status`, { status: target })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => this.toast.success(`Déplacé vers ${this.labelOf(target)}`),
        error: () => { this.apps.set(snap); this.toast.error('Erreur'); }
      });
  }

  goToInterviews(e: Event) {
    e.stopPropagation();
    this.router.navigate(['/interviews']);
  }

  labelOf(s: AppStatus)   { return COLS.find(c => c.status === s)?.label ?? s; }
  colorBgOf(s: AppStatus) { return COLS.find(c => c.status === s)?.colorBg ?? '#E6F1FB'; }
  colorTxtOf(s: AppStatus){ return COLS.find(c => c.status === s)?.colorText ?? '#0C447C'; }
  isDragging()            { return this.draggedApp() !== null; }
  isOver(s: AppStatus)    { return this.dragOverCol() === s; }
  isDragged(a: App)       { return this.draggedApp()?.id === a.id; }

  initials(name?: string) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(iso: string) {
    return new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short' }).format(new Date(iso));
  }
}
