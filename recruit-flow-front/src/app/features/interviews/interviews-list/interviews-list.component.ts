import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface Interview {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  status: string;
  candidateName?: string;
  candidateFullName?: string;
  jobTitle?: string;
  meetingUrl?: string;
  applicationId: string;
}

interface CalDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  interviews: Interview[];
}

type Rec = 'StrongYes'|'Yes'|'Maybe'|'No'|'StrongNo';
const REC_MAP: Record<string,number> = { StrongYes:0, Yes:1, Maybe:2, No:3, StrongNo:4 };

@Component({
  selector: 'app-interviews-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './interviews-list.component.html',
  styleUrl: './interviews-list.component.scss'
})
export class InterviewsListComponent implements OnInit {
  private http    = inject(HttpClient);
  private auth    = inject(AuthService);
  private toast   = inject(ToastService);
  private fb      = inject(FormBuilder);
  private destroy = inject(DestroyRef);

  interviews   = signal<Interview[]>([]);
  applications = signal<any[]>([]);
  loading      = signal(false);
  saving       = signal(false);
  readonly isRecruiter = this.auth.isRecruiter;

  // Calendrier
  currentDate  = signal(new Date());
  selectedDay  = signal<Date>(new Date());

  readonly calDays = computed(() => this.buildCalendar(this.currentDate()));

  readonly selectedDayInterviews = computed(() => {
    const sel = this.selectedDay();
    return this.interviews().filter(iv => {
      const d = new Date(iv.scheduledAt);
      return d.getFullYear() === sel.getFullYear() &&
        d.getMonth()    === sel.getMonth() &&
        d.getDate()     === sel.getDate();
    }).sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  });

  readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('fr-CA', { month: 'long', year: 'numeric' })
      .format(this.currentDate())
  );

  readonly upcomingCount = computed(() =>
    this.interviews().filter(i => i.status === 'Scheduled').length
  );

  // Drawer planification
  showForm = signal(false);
  saving2  = signal(false);

  // Drawer évaluation
  showEval     = signal(false);
  evalTarget   = signal<Interview|null>(null);
  techScore    = signal(5);
  commScore    = signal(5);
  cultScore    = signal(5);
  selectedRec  = signal<Rec>('Maybe');
  comments     = signal('');
  hoveredTech  = signal(0);
  hoveredComm  = signal(0);
  hoveredCult  = signal(0);
  readonly globalScore = computed(() =>
    +((this.techScore() + this.commScore() + this.cultScore()) / 3).toFixed(1)
  );
  readonly RECS = [
    { value: 'StrongYes' as Rec, label: 'Fortement oui', color: '#085041', bg: '#E1F5EE' },
    { value: 'Yes'       as Rec, label: 'Oui',           color: '#085041', bg: '#E1F5EE' },
    { value: 'Maybe'     as Rec, label: 'Peut-être',     color: '#633806', bg: '#FAEEDA' },
    { value: 'No'        as Rec, label: 'Non',           color: '#791F1F', bg: '#FCEBEB' },
    { value: 'StrongNo'  as Rec, label: 'Fortement non', color: '#791F1F', bg: '#FCEBEB' },
  ];

  private futureDateValidator = (ctrl: AbstractControl): ValidationErrors | null =>
    !ctrl.value || new Date(ctrl.value) > new Date() ? null : { pastDate: true };

  form = this.fb.group({
    applicationId:   ['', Validators.required],
    scheduledAt:     ['', [Validators.required, this.futureDateValidator]],
    durationMinutes: [60, [Validators.required, Validators.min(15)]],
    type:            ['Video', Validators.required],
    meetingUrl:      [''],
    notes:           [''],
  });

  get f() { return this.form.controls; }
  get showUrl() { return ['Video','Phone'].includes(this.f['type'].value ?? ''); }

  readonly DAY_NAMES = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  ngOnInit() {
    this.load();
    this.http.get<any>(`${environment.apiUrl}/applications?page=1&pageSize=100`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({ next: r => this.applications.set(Array.isArray(r) ? r : (r.items ?? [])) });
  }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/interviews?page=1&pageSize=100`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: r => { this.interviews.set(Array.isArray(r) ? r : (r.items ?? [])); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  // ── Calendrier ───────────────────────────────────────────────
  buildCalendar(date: Date): CalDay[] {
    const year  = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    // Lundi = 0
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: CalDay[] = [];

    // Jours du mois précédent
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, day: d.getDate(), isCurrentMonth: false, isToday: false, interviews: [] });
    }

    // Jours du mois courant
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date2 = new Date(year, month, d);
      const isToday = date2.toDateString() === today.toDateString();
      const ivs = this.interviews().filter(iv => {
        const ivd = new Date(iv.scheduledAt);
        return ivd.getFullYear() === year && ivd.getMonth() === month && ivd.getDate() === d;
      });
      days.push({ date: date2, day: d, isCurrentMonth: true, isToday, interviews: ivs });
    }

    // Jours du mois suivant
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date2 = new Date(year, month + 1, d);
      days.push({ date: date2, day: d, isCurrentMonth: false, isToday: false, interviews: [] });
    }

    return days;
  }

  prevMonth() {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth() {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  goToToday() {
    this.currentDate.set(new Date());
    this.selectedDay.set(new Date());
  }

  selectDay(day: CalDay) {
    this.selectedDay.set(day.date);
  }

  isSelectedDay(day: CalDay): boolean {
    const sel = this.selectedDay();
    return day.date.toDateString() === sel.toDateString();
  }

  // ── Planification ────────────────────────────────────────────
  openForm() {
    this.form.reset({ durationMinutes: 60, type: 'Video' });
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  submitForm() {
    if (this.form.invalid || this.saving2()) return;
    this.saving2.set(true);
    const dto = {
      ...this.form.getRawValue(),
      scheduledAt: new Date(this.form.value.scheduledAt!).toISOString(),
      interviewerId: this.auth.currentUser()!.id
    };
    this.http.post(`${environment.apiUrl}/interviews`, dto)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.toast.success('Entretien planifié');
          this.closeForm();
          this.saving2.set(false);
          this.load();
        },
        error: () => { this.toast.error('Erreur'); this.saving2.set(false); }
      });
  }

  // ── Évaluation ───────────────────────────────────────────────
  openEval(iv: Interview) {
    this.evalTarget.set(iv);
    this.techScore.set(5); this.commScore.set(5); this.cultScore.set(5);
    this.selectedRec.set('Maybe'); this.comments.set('');
    this.showEval.set(true);
  }

  closeEval() { this.showEval.set(false); this.evalTarget.set(null); }

  submitEval() {
    if (this.saving()) return;
    this.saving.set(true);
    const dto = {
      interviewId: this.evalTarget()!.id,
      technicalScore: this.techScore(),
      communicationScore: this.commScore(),
      culturalFitScore: this.cultScore(),
      recommendation: REC_MAP[this.selectedRec()],
      comments: this.comments()
    };
    this.http.post(`${environment.apiUrl}/evaluations`, dto)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.toast.success('Évaluation enregistrée');
          this.closeEval();
          this.saving.set(false);
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

  scoreColor(n: number): string {
    if (n >= 8) return '#085041';
    if (n >= 5) return '#633806';
    return '#791F1F';
  }

  stars() { return [1,2,3,4,5]; }

  // ── Helpers ──────────────────────────────────────────────────
  getName(iv: Interview): string {
    return iv.candidateName ?? iv.candidateFullName ?? 'Candidat';
  }

  formatTime(iso: string): string {
    return new Intl.DateTimeFormat('fr-CA', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  }

  formatEndTime(iso: string, minutes: number): string {
    const end = new Date(new Date(iso).getTime() + minutes * 60000);
    return new Intl.DateTimeFormat('fr-CA', { hour: '2-digit', minute: '2-digit' }).format(end);
  }

  typeLabel(t: string): string {
    return ({ Phone:'Téléphonique', Video:'Vidéo', OnSite:'Présentiel' } as any)[t] ?? t;
  }

  typeBadgeClass(t: string): string {
    return ({ Phone:'ev-phone', Video:'ev-video', OnSite:'ev-final' } as any)[t] ?? 'ev-tech';
  }

  typeColor(t: string): string {
    return ({ Phone:'#EF9F27', Video:'#7F77DD', OnSite:'#1D9E75' } as any)[t] ?? '#378ADD';
  }

  statusLabel(s: string): string {
    return ({ Scheduled:'Planifié', Completed:'Complété', Cancelled:'Annulé', NoShow:'Absent' } as any)[s] ?? s;
  }

  selectedDayLabel(): string {
    return new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long' })
      .format(this.selectedDay());
  }

  getAppName(app: any): string {
    return app.candidateName ?? app.candidateFullName ?? 'Candidat';
  }
}
