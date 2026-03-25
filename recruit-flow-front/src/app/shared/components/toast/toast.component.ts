import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type">
          <span>{{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'i' }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button (click)="dismiss(toast.id)">×</button>
        </div>
      }
    </div>`,
  styles: [`
    .toast-container{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:8px;z-index:9999}
    .toast{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:8px;font-size:13.5px;min-width:280px;border:1px solid transparent;animation:slideIn 200ms ease;box-shadow:0 8px 24px #00000060}
    @keyframes slideIn{from{transform:translateX(20px);opacity:0}}
    .toast-success{background:#14532d;border-color:#16a34a;color:#4ade80}
    .toast-error{background:#450a0a;border-color:#dc2626;color:#f87171}
    .toast-info{background:#1e3a5f;border-color:#3b82f6;color:#93c5fd}
    .toast-msg{flex:1;color:#e8eaf0}
    button{background:none;border:none;color:#6b7280;cursor:pointer;font-size:18px}
  `]
})
export class ToastComponent {
  private svc = inject(ToastService);
  readonly toasts = this.svc.toasts;
  dismiss(id: number) { this.svc.remove(id); }
}
