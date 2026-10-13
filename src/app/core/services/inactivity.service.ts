import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { EodMarketSocketService } from './eod-market-socket.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  // 5 minutos de inactividad
  private readonly INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
  private timeoutId: any = null;
  private isListening = false;
  private boundResetTimer: () => void;

  constructor(
    private authService: AuthService,
    private eodSocketService: EodMarketSocketService,
    private router: Router,
    private zone: NgZone
  ) {
    this.boundResetTimer = () => this.resetTimer();
  }

  public startTracking(): void {
    if (this.isListening) return;
    this.isListening = true;

    // Escuchar eventos de interacción del usuario
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    this.zone.runOutsideAngular(() => {
      events.forEach(event => {
        window.addEventListener(event, this.boundResetTimer, { passive: true });
      });
    });

    this.resetTimer();
    console.log('⏳ [InactivityService] Monitoreo de inactividad iniciado (5 min)');
  }

  public stopTracking(): void {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.removeEventListener(event, this.boundResetTimer);
    });

    console.log('⏹️ [InactivityService] Monitoreo de inactividad detenido');
  }

  private resetTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.zone.run(() => {
        this.handleTimeout();
      });
    }, this.INACTIVITY_LIMIT_MS);
  }

  private handleTimeout(): void {
    console.warn('⚠️ [InactivityService] Tiempo de inactividad alcanzado. Cerrando sesión...');
    this.stopTracking();
    this.eodSocketService.disconnectAll();
    this.authService.logout();
    this.router.navigate(['/auth/login'], { queryParams: { reason: 'inactivity' } });
  }
}
