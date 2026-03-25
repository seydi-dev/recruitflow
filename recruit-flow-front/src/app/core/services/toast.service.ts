import { Injectable, signal } from '@angular/core';
export interface Toast { id: number; type: 'success'|'error'|'info'; message: string; }
@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private counter = 0;
  success(m: string) { this.add('success', m); }
  error(m: string)   { this.add('error', m); }
  info(m: string)    { this.add('info', m); }
  remove(id: number) { this._toasts.update(t => t.filter(x => x.id !== id)); }
  private add(type: Toast['type'], message: string) {
    const id = ++this.counter;
    this._toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.remove(id), 4000);
  }
}
