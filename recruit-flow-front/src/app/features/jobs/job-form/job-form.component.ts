import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './job-form.component.html',
  styleUrl: './job-form.component.scss'
})
export class JobFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private http    = inject(HttpClient);
  private toast   = inject(ToastService);
  private destroy = inject(DestroyRef);

  jobId  = signal<string|null>(null);
  isEdit = signal(false);
  saving = signal(false);

  form = this.fb.group({
    title:       ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.required],
    department:  ['', Validators.required],
    location:    ['', Validators.required],
    status:      ['Draft', Validators.required],
    salaryMin:   [null as number|null],
    salaryMax:   [null as number|null],
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jobId.set(id); this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}/jobs/${id}`)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe(j => this.form.patchValue(j));
    }
  }

  submit() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const dto = this.form.getRawValue();
    const op$ = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}/jobs/${this.jobId()}`, dto)
      : this.http.post<any>(`${environment.apiUrl}/jobs`, dto);
    op$.pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => { this.toast.success(this.isEdit() ? 'Offre mise à jour' : 'Offre créée'); this.router.navigate(['/jobs']); },
      error: () => { this.toast.error('Erreur'); this.saving.set(false); }
    });
  }
}
