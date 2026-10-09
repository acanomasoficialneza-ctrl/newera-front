import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-screen bg-newera-bg-dark text-newera-text-main flex items-center justify-center p-6 relative overflow-hidden">
      
      <!-- Toast Notification -->
      <div *ngIf="toastMessage" class="fixed bottom-4 left-4 right-4 md:left-auto md:w-auto z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div class="glass-panel border px-4 py-3 flex items-center gap-3 shadow-lg"
             [ngClass]="{
               'bg-newera-profit/10 border-newera-profit/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]': toastType === 'success',
               'bg-orange-500/10 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]': toastType === 'warning',
               'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]': toastType === 'error'
             }">
          <svg *ngIf="toastType === 'success'" class="w-5 h-5 text-newera-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg *ngIf="toastType === 'warning'" class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg *ngIf="toastType === 'error'" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-semibold text-white">{{ toastMessage }}</span>
        </div>
      </div>

      <!-- Subtle Background Glow -->
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-premium opacity-40 pointer-events-none z-0"></div>

      <!-- OPCIÓN 2: FLUJO DE DATOS (LINES) PARA MÓVILES -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0B0E14] block md:hidden">
        <div class="absolute inset-0 opacity-40" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(37,99,235,0.4) 40px, rgba(37,99,235,0.4) 42px); animation: slide-right 20s linear infinite;"></div>
        <div class="absolute inset-0 opacity-30" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(16,185,129,0.3) 15px, rgba(16,185,129,0.3) 16px); animation: slide-left 15s linear infinite;"></div>
        <div class="absolute top-[10%] left-[50%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2"></div>
      </div>

      <!-- OPCIÓN 4: PARTÍCULAS ESPACIALES (STARS) PARA ESCRITORIO -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0B0E14] hidden md:block">
        <!-- Capa 1: Partículas azules densas y lentas -->
        <div class="absolute inset-0 opacity-50" style="background-image: radial-gradient(#2563EB 1px, transparent 1px); background-size: 35px 35px; animation: slide-up 35s linear infinite;"></div>
        <!-- Capa 2: Estrellas blancas medianas -->
        <div class="absolute inset-0 opacity-70" style="background-image: radial-gradient(#ffffff 1.5px, transparent 1.5px); background-size: 80px 80px; animation: slide-up 20s linear infinite; margin-top: 20px; margin-left: 10px;"></div>
        <!-- Capa 3: Partículas verdes (profit) rápidas y brillantes -->
        <div class="absolute inset-0 opacity-90" style="background-image: radial-gradient(#10B981 2px, transparent 2px); background-size: 140px 140px; animation: slide-up 12s linear infinite; margin-top: 40px; margin-left: -20px;"></div>
        
        <!-- Aura de fondo cibernética -->
        <div class="absolute top-[10%] left-[50%] w-[300px] md:w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] -translate-x-1/2"></div>
      </div>

      <!-- CSS para las animaciones -->
      <style>
        @keyframes slide-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100px); }
        }
        @keyframes ping-slow {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes slide-right {
          0% { background-position: 0 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes slide-left {
          0% { background-position: 0 0; }
          100% { background-position: -1000px 0; }
        }
        @keyframes aurora-move {
          0% { transform: translateX(-10%) scale(1); }
          100% { transform: translateX(10%) scale(1.1); }
        }
        /* Fix autofill styles for dark mode */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #0f172a inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white !important;
          border-radius: 0 !important;
        }
      </style>

      <div class="glass-panel w-full max-w-md p-10 relative z-10 rounded-3xl">
        
        <div class="mb-10 text-center flex flex-col items-center">
          <div class="flex items-center justify-center">
             <img src="/logos/logo-vertical.png" alt="NOVA CAPITAL" class="w-64 h-auto object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="relative">
            <input type="email" id="email" [(ngModel)]="email" name="email" required
                   [ngClass]="loginErrors['email'] ? 'text-red-100 border-red-500 focus:border-red-500' : 'text-white border-white/20 focus:border-newera-primary'"
                   class="block px-2.5 pb-2.5 pt-5 w-full text-sm bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer" placeholder=" " />
            <label for="email" 
                   [ngClass]="loginErrors['email'] ? 'text-red-500 peer-focus:text-red-500' : 'text-newera-text-muted peer-focus:text-newera-primary'"
                   class="absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
              Correo Electrónico
            </label>
          </div>

          <div class="relative">
            <input [type]="showPassword ? 'text' : 'password'" id="password" [(ngModel)]="password" name="password" required
                   [ngClass]="loginErrors['password'] || loginErrors['credentials'] ? 'text-red-100 border-red-500 focus:border-red-500' : 'text-white border-white/20 focus:border-newera-primary'"
                   class="block px-2.5 pb-2.5 pt-5 w-full text-sm bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer pr-10" placeholder=" " />
            <label for="password" 
                   [ngClass]="loginErrors['password'] || loginErrors['credentials'] ? 'text-red-500 peer-focus:text-red-500' : 'text-newera-text-muted peer-focus:text-newera-primary'"
                   class="absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
              Contraseña
            </label>
            <button type="button" (click)="showPassword = !showPassword" tabindex="-1" class="absolute right-2 top-5 text-white/50 hover:text-white transition-colors">
              <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg *ngIf="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>



          <button type="submit" [disabled]="isLoading" class="btn-premium w-full mt-8 flex justify-center uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading ? 'Conectando...' : 'Iniciar Sesión' }}
          </button>
        </form>
      </div>
    </main>
  `
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  loginErrors: any = {};
  toastMessage: string | null = null;
  toastType: 'success' | 'warning' | 'error' = 'success';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private loadingService: LoadingService) {}

  showToast(msg: string, type: 'success' | 'warning' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  onSubmit() {
    this.loginErrors = {};
    let hasError = false;

    if (!this.email) {
      this.showToast('Por favor, ingresa tu correo electrónico.', 'warning');
      this.loginErrors['email'] = true;
      hasError = true;
    }
    if (!this.password) {
      if (!hasError) this.showToast('Por favor, ingresa tu contraseña.', 'warning');
      this.loginErrors['password'] = true;
      hasError = true;
    }

    if (hasError) return;

      this.isLoading = true; // Used to disable the button
      this.loadingService.show('radar', 'Autenticando...'); // Global Spinner

      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.isLoading = false;
          
          const role = response.rol;
          
          // Redirección basada en rol verdadero
          if (role === 'DIRECTOR') {
            this.router.navigate(['/app/admin/global']);
          } else if (role === 'EJECUTIVO' || role === 'GERENTE' || role === 'ADMIN') {
            this.router.navigate(['/app/admin/crm']);
          } else {
            this.router.navigate(['/app/dashboard']);
          }
        },
        error: (err) => {
          this.loadingService.hide();
          this.isLoading = false;
          
          if (err.status === 401) {
            this.showToast('Credenciales incorrectas o usuario no encontrado.', 'error');
            this.loginErrors['email'] = true;
            this.loginErrors['credentials'] = true;
          } else if (err.status === 403) {
            this.showToast('Acceso denegado. Tu cuenta se encuentra INHABILITADA o BLOQUEADA.', 'error');
            this.loginErrors['email'] = true;
          } else if (err.status === 0) {
             this.showToast('No se pudo conectar con el servidor (Gateway no disponible).', 'error');
          } else {
            this.showToast('Ocurrió un error inesperado (' + err.status + ').', 'error');
          }
        }
      });
  }
}
