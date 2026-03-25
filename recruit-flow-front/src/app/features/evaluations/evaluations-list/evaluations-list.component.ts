import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface Evaluation {
  id: string;
  technicalScore: number;
  communicationScore: number;
  culturalFitScore: number;
  recommendation: string;
  comments?: string;
  createdAt: string;
  candidateName?: string;
  jobTitle?: string;
  interviewId: string;
  interviewedAt?: string;
}

interface Interview {
  id: string;
  candidateName?: string;
  candidateFullName?: string;
  jobTitle?: string;
  scheduledAt: string;
  status: string;
  type: string;
}

type Rec = 'StrongYes'|'Yes'|'Maybe'|'No'|'StrongNo';
const REC_MAP: Record<string,number> = { StrongYes:0, Yes:1, Maybe:2, No:3, StrongNo:4 };

const CRITERIA = [
  { key: 'technical',      label: 'Maîtrise technique',     section: 'tech' },
  { key: 'communication',  label: 'Communication & clarté', section: 'soft' },
  { key: 'cultural',       label: 'Culture fit',            section: 'soft' },
];

@Component({
  selector: 'app-evaluations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluations-list.component.html',
  styleUrl: './evaluations-list.component.scss'
})
export class EvaluationsListComponent implements OnInit {
  private http    = inject(HttpClient);
  private auth    = inject(AuthService);
  private toast   = inject(ToastService);
  private destroy = inject(DestroyRef);

  evaluations  = signal<Evaluation[]>([]);
  interviews   = signal<Interview[]>([]);
  loading      = signal(false);
  saving       = signal(false);

  readonly isRecruiter = this.auth.isRecruiter;

  // Entretiens complétés sans évaluation
  readonly pendingInterviews = computed(() => {
    const evalIds = new Set(this.evaluations().map(e => e.interviewId));
    return this.interviews().filter(
      iv => iv.status === 'Completed' && !evalIds.has(iv.id)
    );
  });

  // Drawer
  showForm    = signal(false);
  editingEval = signal<Evaluation|null>(null);
  targetIv    = signal<Interview|null>(null);

  // Scores
  techScore   = signal(5);
  commScore   = signal(5);
  cultScore   = signal(5);
  selectedRec = signal<Rec>('Maybe');
  comments    = signal('');

  // Hover étoiles
  hoveredTech = signal(0);
  hoveredComm = signal(0);
  hoveredCult = signal(0);

  readonly globalScore = computed(() =>
    +((this.techScore() + this.commScore() + this.cultScore()) / 3).toFixed(1)
  );

  readonly RECS = [
    { value: 'StrongYes' as Rec, label: 'Passer à l\'étape finale', color: '#085041', bg: '#E1F5EE' },
    { value: 'Yes'       as Rec, label: 'Recommander',              color: '#085041', bg: '#E1F5EE' },
    { value: 'Maybe'     as Rec, label: 'Mettre en attente',        color: '#633806', bg: '#FAEEDA' },
    { value: 'No'        as Rec, label: 'Rejeter',                  color: '#791F1F', bg: '#FCEBEB' },
    { value: 'StrongNo'  as Rec, label: 'Rejeter fermement',        color: '#791F1F', bg: '#FCEBEB' },
  ];

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/evaluations?page=1&pageSize=100`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: r => { this.evaluations.set(Array.isArray(r) ? r : (r.items ?? [])); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    this.http.get<any>(`${environment.apiUrl}/interviews?page=1&pageSize=100`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({ next: r => this.interviews.set(Array.isArray(r) ? r : (r.items ?? [])) });
  }

  openCreate(iv: Interview) {
    this.targetIv.set(iv); this.editingEval.set(null);
    this.techScore.set(5); this.commScore.set(5); this.cultScore.set(5);
    this.selectedRec.set('Maybe'); this.comments.set('');
    this.showForm.set(true);
  }

  openEdit(ev: Evaluation) {
    this.editingEval.set(ev); this.targetIv.set(null);
    this.techScore.set(ev.technicalScore);
    this.commScore.set(ev.communicationScore);
    this.cultScore.set(ev.culturalFitScore);
    this.selectedRec.set(ev.recommendation as Rec);
    this.comments.set(ev.comments ?? '');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.editingEval.set(null); this.targetIv.set(null); }

  submit() {
    if (this.saving()) return;
    this.saving.set(true);
    const base = {
      technicalScore: this.techScore(),
      communicationScore: this.commScore(),
      culturalFitScore: this.cultScore(),
      recommendation: REC_MAP[this.selectedRec()],
      comments: this.comments()
    };
    const op$ = this.editingEval()
      ? this.http.put(`${environment.apiUrl}/evaluations/${this.editingEval()!.id}`, base)
      : this.http.post(`${environment.apiUrl}/evaluations`, { ...base, interviewId: this.targetIv()!.id });

    op$.pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => {
        this.toast.success(this.editingEval() ? 'Évaluation mise à jour' : 'Évaluation enregistrée');
        this.closeForm(); this.saving.set(false); this.loadAll();
      },
      error: () => { this.toast.error('Erreur'); this.saving.set(false); }
    });
  }

  setScore(field: 'tech'|'comm'|'cult', val: number) {
    if (field === 'tech') this.techScore.set(val * 2);
    if (field === 'comm') this.commScore.set(val * 2);
    if (field === 'cult') this.cultScore.set(val * 2);
  }

  starFilled(score: number, star: number, hovered: number): boolean {
    const active = hovered > 0 ? hovered : Math.ceil(score / 2);
    return star <= active;
  }

  avg(ev: Evaluation): number {
    return +((ev.technicalScore + ev.communicationScore + ev.culturalFitScore) / 3).toFixed(1);
  }

  barWidth(score: number): string { return `${score * 10}%`; }

  recMeta(value: string) {
    return this.RECS.find(r => r.value === value) ?? this.RECS[2];
  }

  getName(iv: Interview): string {
    return iv.candidateName ?? iv.candidateFullName ?? 'Candidat';
  }

  stars() { return [1,2,3,4,5]; }

  scoreColor(n: number): string {
    if (n >= 7) return '#185FA5';
    if (n >= 5) return '#633806';
    return '#791F1F';
  }

  barColor(n: number): string {
    if (n >= 7) return '#185FA5';
    if (n >= 5) return '#EF9F27';
    return '#E24B4A';
  }
}
