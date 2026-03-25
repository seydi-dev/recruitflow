import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>RecruitFlow</h1>
        <h2>Créer un compte</h2>

        @if (error()) {
          <div class="error-banner">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="field">
              <label>Prénom</label>
              <input type="text" [(ngModel)]="firstName" name="firstName" required />
            </div>
            <div class="field">
              <label>Nom</label>
              <input type="text" [(ngModel)]="lastName" name="lastName" required />
            </div>
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="field">
            <label>Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" required />
          </div>
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Création...' : 'Créer le compte' }}
          </button>
        </form>

        <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .auth-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); width: 100%; max-width: 420px; }
    h1 { color: #2563eb; margin: 0 0 0.5rem; }
    h2 { margin: 0 0 1.5rem; color: #374151; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-weight: 500; color: #374151; }
    input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; margin-top: 0.5rem; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-banner { background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
    p { text-align: center; margin-top: 1rem; }
    a { color: #2563eb; }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (!this.firstName || !this.lastName || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.register({ firstName: this.firstName, lastName: this.lastName, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Erreur lors de la création du compte');
        this.loading.set(false);
      }
    });
  }
}
