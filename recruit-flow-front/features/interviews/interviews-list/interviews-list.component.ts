import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Interview { id:string; scheduledAt:string; durationMinutes:number; type:string; status:string; candidateName?:string; jobTitle?:string; meetingUrl?:string; }

@Component({ selector:'app-interviews-list', standalone:true, imports:[CommonModule], templateUrl:'./interviews-list.component.html', styleUrl:'./interviews-list.component.scss' })
export class InterviewsListComponent implements OnInit {
  private http    = inject(HttpClient);
  private destroy = inject(DestroyRef);
  interviews = signal<Interview[]>([]);
  loading    = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.http.get<Interview[]>(`${environment.apiUrl}/interviews`).pipe(takeUntilDestroyed(this.destroy))
      .subscribe({ next: list => { this.interviews.set(list); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  formatTime(iso:string){ return new Intl.DateTimeFormat('fr-CA',{hour:'2-digit',minute:'2-digit'}).format(new Date(iso)); }
  typeIcon(t:string){ return ({Phone:'📞',Video:'🎥',OnSite:'🏢'} as any)[t]??'📅'; }
  statusLabel(s:string){ return ({Scheduled:'Planifié',Completed:'Complété',Cancelled:'Annulé',NoShow:'Absent'} as any)[s]??s; }
}
