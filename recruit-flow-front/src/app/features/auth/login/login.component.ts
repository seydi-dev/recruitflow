import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-left">
        <div class="brand">
          <div class="brand-mark">RF</div>
          <span class="brand-name">RecruitFlow</span>
        </div>
        <div class="hero">
          <h1 class="hero-title">Gérez votre pipeline<br/>de recrutement</h1>
          <p class="hero-sub">Une plateforme complète pour suivre vos candidats, planifier vos entretiens et prendre les meilleures décisions.</p>
          <div class="stats">
            <div class="stat"><span class="stat-num">2</span><span class="stat-label">Offres actives</span></div>
            <div class="stat"><span class="stat-num">2</span><span class="stat-label">Candidatures</span></div>
            <div class="stat"><span class="stat-num">1</span><span class="stat-label">Entretiens</span></div>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-card">
          <div class="card-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace recrutement</p>
          </div>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label>Adresse e-mail</label>
              <div class="input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
                <input type="email" name="email" [(ngModel)]="email" placeholder="vous@exemple.com" required autocomplete="email"/>
              </div>
            </div>
            <div class="form-group">
              <label>Mot de passe</label>
              <div class="input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" name="password" [(ngModel)]="password" placeholder="••••••••" required autocomplete="current-password"/>
              </div>
            </div>
            @if (error()) {
              <div class="error-msg">{{ error() }}</div>
            }
            <button type="submit" class="submit-btn" [disabled]="loading() || loginForm.invalid">
              @if (!loading()) { <span>Se connecter</span> }
              @if (loading()) {
                <span class="loading-dots"><span></span><span></span><span></span></span>
              }
            </button>
            <div class="demo-accounts">
              <p class="demo-label">Comptes de démonstration</p>
              <div class="demo-btns">
                <button type="button" class="demo-btn" (click)="fillDemo('admin')">Admin</button>
                <button type="button" class="demo-btn" (click)="fillDemo('recruiter')">Recruteur</button>
                <button type="button" class="demo-btn" (click)="fillDemo('candidate')">Candidat</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host{--bg:#0d0f14;--surface:#13161e;--border:#ffffff12;--accent:#3b82f6;--text:#e8eaf0;--muted:#6b7280}
    .login-page{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;background:var(--bg)}
    .login-left{display:flex;flex-direction:column;justify-content:space-between;padding:40px 48px;background:linear-gradient(135deg,#0d0f14 0%,#131a2e 100%);border-right:1px solid var(--border);position:relative;overflow:hidden}
    .login-left::before{content:'';position:absolute;top:-100px;left:-100px;width:400px;height:400px;background:radial-gradient(circle,#3b82f620 0%,transparent 70%);pointer-events:none}
    .brand{display:flex;align-items:center;gap:12px}
    .brand-mark{width:40px;height:40px;background:var(--accent);border-radius:10px;display:grid;place-items:center;font-size:14px;font-weight:800;color:#fff}
    .brand-name{font-size:20px;font-weight:700;color:var(--text)}
    .hero{flex:1;display:flex;flex-direction:column;justify-content:center;gap:20px}
    .hero-title{font-size:40px;font-weight:800;line-height:1.2;color:var(--text)}
    .hero-sub{font-size:15px;color:var(--muted);line-height:1.6;max-width:380px}
    .stats{display:flex;gap:32px;padding-top:16px;border-top:1px solid var(--border)}
    .stat{display:flex;flex-direction:column;gap:4px}
    .stat-num{font-size:28px;font-weight:800;color:var(--accent);font-family:monospace}
    .stat-label{font-size:12px;color:var(--muted);font-weight:500}
    .login-right{display:flex;align-items:center;justify-content:center;padding:40px 24px}
    .login-card{width:100%;max-width:420px;display:flex;flex-direction:column;gap:32px}
    .card-header h2{font-size:26px;font-weight:800;color:var(--text);margin-bottom:6px}
    .card-header p{font-size:14px;color:var(--muted)}
    form{display:flex;flex-direction:column;gap:20px}
    .form-group{display:flex;flex-direction:column;gap:8px}
    .form-group label{font-size:13px;font-weight:600;color:var(--muted)}
    .input-wrap{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:0 16px;color:var(--muted);transition:border-color 160ms,box-shadow 160ms}
    .input-wrap:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px #3b82f615}
    .input-wrap input{flex:1;background:transparent;border:none;outline:none;color:var(--text);font-size:14px;padding:14px 0;font-family:inherit}
    .input-wrap input::placeholder{color:#374151}
    .error-msg{padding:10px 14px;background:#450a0a;border:1px solid #dc2626;border-radius:8px;font-size:13px;color:#f87171}
    .submit-btn{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;transition:all 160ms;display:flex;align-items:center;justify-content:center;margin-top:4px}
    .submit-btn:hover:not(:disabled){background:#2563eb;transform:translateY(-1px);box-shadow:0 4px 16px #3b82f640}
    .submit-btn:disabled{opacity:.5;cursor:default}
    .loading-dots{display:flex;gap:4px;align-items:center}
    .loading-dots span{width:6px;height:6px;border-radius:50%;background:#fff;animation:dot 1.2s ease infinite}
    .loading-dots span:nth-child(2){animation-delay:.2s}
    .loading-dots span:nth-child(3){animation-delay:.4s}
    @keyframes dot{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
    .demo-accounts{padding-top:16px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:10px}
    .demo-label{font-size:12px;color:var(--muted);text-align:center;font-weight:500}
    .demo-btns{display:flex;gap:8px}
    .demo-btn{flex:1;padding:8px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:12.5px;font-weight:600;cursor:pointer;transition:all 140ms}
    .demo-btn:hover{border-color:var(--accent);color:var(--accent);background:#1e3a5f}
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);

  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Email ou mot de passe incorrect');
        this.loading.set(false);
      }
    });
  }

  fillDemo(role: 'admin' | 'recruiter' | 'candidate') {
    const accounts = {
      admin:     { email: 'admin@recruitflow.dev',      password: 'Admin123!' },
      recruiter: { email: 'recruiter@recruitflow.dev',  password: 'Recruiter123!' },
      candidate: { email: 'candidate1@recruitflow.dev', password: 'Candidate123!' },
    };
    this.email    = accounts[role].email;
    this.password = accounts[role].password;
  }
}
