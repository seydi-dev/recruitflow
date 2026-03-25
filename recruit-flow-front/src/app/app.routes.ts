import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth — sans shell
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent)
      }
    ]
  },

  // App — avec shell (sidebar + layout)
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/jobs/jobs-list/jobs-list.component')
          .then(m => m.JobsListComponent)
      },
      {
        path: 'jobs/new',
        loadComponent: () => import('./features/jobs/job-form/job-form.component')
          .then(m => m.JobFormComponent)
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () => import('./features/jobs/job-form/job-form.component')
          .then(m => m.JobFormComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/applications/kanban/kanban.component')
          .then(m => m.KanbanComponent)
      },
      {
        path: 'interviews',
        loadComponent: () => import('./features/interviews/interviews-list/interviews-list.component')
          .then(m => m.InterviewsListComponent)
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./features/evaluations/evaluations-list/evaluations-list.component')
          .then(m => m.EvaluationsListComponent)
      },
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];
