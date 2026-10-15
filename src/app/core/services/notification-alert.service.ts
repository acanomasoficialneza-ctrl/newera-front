import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface AlertNotificationPayload {
  title: string;
  message: string;
  type?: NotificationType;
  playSound?: boolean;
  systemNotification?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationAlertService {
  // Master switches persisted in localStorage
  masterEnabled = signal<boolean>(this.getStorageBool('nova_notif_master', true));
  soundEnabled = signal<boolean>(this.getStorageBool('nova_notif_sound', true));
  systemNotifEnabled = signal<boolean>(this.getStorageBool('nova_notif_system', true));

  // Notification permission signal ('default' | 'granted' | 'denied' | 'unsupported')
  permissionStatus = signal<string>(this.checkPermission());

  // Global toast stream for in-app floating popups
  public toastStream$ = new Subject<{ title: string; message: string; type: NotificationType }>();

  // Web Audio Context for synthesized sound cues
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.initAudioContext();
  }

  private getStorageBool(key: string, defaultValue: boolean): boolean {
    const val = localStorage.getItem(key);
    return val !== null ? val === 'true' : defaultValue;
  }

  private setStorageBool(key: string, val: boolean) {
    localStorage.setItem(key, String(val));
  }

  private checkPermission(): string {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  }

  private initAudioContext() {
    if (typeof window === 'undefined') return;

    // Resumir contexto en la primera interacción de usuario
    const unlockAudio = () => {
      try {
        if (!this.audioCtx) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            this.audioCtx = new AudioContextClass();
          }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
      } catch (e) {
        console.warn('AudioContext init error:', e);
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch (e) {
        console.warn('Error creating AudioContext:', e);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // ==========================================
  // SINTETIZADOR DE TONOS WEB AUDIO API (NOVA CAPITAL SOUND SYSTEM)
  // ==========================================
  public playTone(type: NotificationType = 'info') {
    if (!this.masterEnabled() || !this.soundEnabled()) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'success') {
        // Tono Fill de Trading Institucional: Acorde de Cristal Celo/Marimba (La5 + Mi6 + La6)
        this.playHarmonicChime(ctx, 880.00, now, 0.30, 0.16);         // Fundamental cálida
        this.playHarmonicChime(ctx, 1318.51, now + 0.04, 0.36, 0.18); // Quinta brillante (Mi6)
        this.playHarmonicChime(ctx, 1760.00, now + 0.05, 0.28, 0.08); // Brillo armónico superior
      } else if (type === 'warning') {
        // Alerta de Margen: Toque dual de marimba suave (Re5 -> Fa#5)
        this.playSoftMallet(ctx, 587.33, now, 0.14, 0.16);
        this.playSoftMallet(ctx, 739.99, now + 0.07, 0.22, 0.18);
      } else if (type === 'error') {
        // Rechazo / Saldo: Confirmación amortiguada de baja frecuencia
        this.playSoftMallet(ctx, 293.66, now, 0.12, 0.16);
        this.playSoftMallet(ctx, 220.00, now + 0.08, 0.22, 0.14);
      } else {
        // Info / Notificación General: Ping cristalino sutil (Do6)
        this.playHarmonicChime(ctx, 1046.50, now, 0.22, 0.15);
      }
    } catch (e) {
      console.warn('Error sintetizando tono de audio:', e);
    }
  }

  private playHarmonicChime(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Filtro pasa-bajas para eliminar asperezas digitales y darle calidez acústica
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3800, startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Envolvente de sonido con ataque limpio (5ms) y caída exponencial de campana
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.04);
  }

  private playSoftMallet(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.04);
  }

  // ==========================================
  // WEB NOTIFICATIONS API (NAVEGADOR / SISTEMA)
  // ==========================================
  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.permissionStatus.set('unsupported');
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      this.permissionStatus.set(perm);
      return perm === 'granted';
    } catch (e) {
      console.warn('Error solicitando permiso de notificación:', e);
      return false;
    }
  }

  public showSystemNotification(title: string, body: string, type: NotificationType = 'info') {
    if (!this.masterEnabled() || !this.systemNotifEnabled()) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const notif = new Notification(title, {
        body: body,
        icon: 'assets/novacapital/logos/favicon.png',
        badge: 'assets/novacapital/logos/favicon.png',
        tag: 'nova-trade-alert-' + Date.now(),
        silent: true // Manejamos el sonido nosotros con Web Audio para máxima fidelidad
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('Error disparando notificación nativa del sistema:', e);
    }
  }

  // ==========================================
  // MÉTODO PRINCIPAL COMBINADO
  // ==========================================
  public notify(payload: AlertNotificationPayload) {
    // Si el Kill Switch está apagado, salimos inmediatamente
    if (!this.masterEnabled()) return;

    const type = payload.type || 'info';
    const playSound = payload.playSound !== false;
    const showSystem = payload.systemNotification !== false;

    // 1. Emitir Toast en la aplicación
    this.toastStream$.next({
      title: payload.title,
      message: payload.message,
      type: type
    });

    // 2. Reproducir Sonido de trading
    if (playSound && this.soundEnabled()) {
      this.playTone(type);
    }

    // 3. Notificación nativa de Escritorio / Celular (Windows, Mac, Android)
    if (showSystem && this.systemNotifEnabled()) {
      this.showSystemNotification(payload.title, payload.message, type);
    }
  }

  // ==========================================
  // SWITCHES DE CONTROL (KILL SWITCH Y MUTE)
  // ==========================================
  public toggleMaster(): boolean {
    const newVal = !this.masterEnabled();
    this.masterEnabled.set(newVal);
    this.setStorageBool('nova_notif_master', newVal);
    return newVal;
  }

  public toggleSound(): boolean {
    const newVal = !this.soundEnabled();
    this.soundEnabled.set(newVal);
    this.setStorageBool('nova_notif_sound', newVal);
    if (newVal) {
      this.playTone('info'); // Feedback sonoro al activar
    }
    return newVal;
  }

  public toggleSystemNotif(): boolean {
    const newVal = !this.systemNotifEnabled();
    this.systemNotifEnabled.set(newVal);
    this.setStorageBool('nova_notif_system', newVal);
    return newVal;
  }

  // Método interactivo para pruebas instantáneas
  public testNotification(type: NotificationType = 'success') {
    // Si los permisos no están dados y se pide probar, solicitarlos
    if (this.permissionStatus() === 'default') {
      this.requestPermission().then(() => {
        this.runTest(type);
      });
    } else {
      this.runTest(type);
    }
  }

  private runTest(type: NotificationType) {
    const titles: Record<NotificationType, string> = {
      success: '¡Orden de Compra Ejecutada!',
      warning: 'Margen de Cuenta en Riesgo',
      info: 'Nuevo Mensaje de Nova Capital',
      error: 'Operación Rechazada por Saldo'
    };
    const messages: Record<NotificationType, string> = {
      success: 'Se compraron 2.50 unidades de BTC/USD a $68,450.00.',
      warning: 'Tu margen libre ha disminuido al 18% del valor de apertura.',
      info: 'Depósito por $500.00 USD procesado exitosamente.',
      error: 'Fondos insuficientes para abrir la orden solicitada.'
    };

    this.notify({
      title: titles[type],
      message: messages[type],
      type: type,
      playSound: true,
      systemNotification: true
    });
  }
}
