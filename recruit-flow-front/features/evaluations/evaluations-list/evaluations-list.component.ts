import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Evaluation { id:string; technicalScore:number; communicationScore:number; culturalFitScore:number; recommendation:string; comments?:string; createdAt:string; candidateName?:string; jobTitle?:string; }

@Component({ selector:'app-evaluations-list', standalone:true, imports:[CommonModule], templateUrl:'./evaluations-list.component.html', styleUrl:'./evaluations-list.component.scss' })
export class EvaluationsListComponent implements OnInit {
  private http    = inject(HttpClient);
  private destroy = inject(DestroyRef);
  evaluations = signal<Evaluation[]>([]);
  loading     = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.http.get<Evaluation[]>(`${environment.apiUrl}/evaluations`).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({ next: list => { this.evaluations.set(list); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  avg(e:Evaluation){ return +((e.technicalScore+e.communicationScore+e.culturalFitScore)/3).toFixed(1); }
  scoreColor(n:number){ return n>=7.5?'#4ade80':n>=5?'#fbbf24':'#f87171'; }
  barW(n:number){ return `${n*10}%`; }
}
