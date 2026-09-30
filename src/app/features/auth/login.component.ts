import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-screen bg-newera-bg-dark text-newera-text-main flex items-center justify-center p-6 relative overflow-hidden">
      
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
      </style>

      <div class="glass-panel w-full max-w-md p-10 relative z-10 rounded-3xl">
        
        <div class="mb-10 text-center flex flex-col items-center">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-newera-primary to-blue-900 shadow-[0_0_30px_rgba(37,99,235,0.3)] mb-6 flex items-center justify-center">
             <span class="text-white font-bold text-3xl">N</span>
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-white mb-2">Acceso NewEra</h1>
          <p class="text-newera-text-muted text-sm">Plataforma Institucional</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="relative">
            <input type="email" id="email" [(ngModel)]="email" name="email" required
                   class="block px-2.5 pb-2.5 pt-5 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-newera-primary peer" placeholder=" " />
            <label for="email" 
                   class="absolute text-sm text-newera-text-muted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-newera-primary">
              Correo Electrónico
            </label>
            <p class="text-[10px] text-white/30 mt-1">Usa admin&#64;..., cliente&#64;..., director&#64;...</p>
          </div>

          <div class="relative">
            <input type="password" id="password" [(ngModel)]="password" name="password" required
                   class="block px-2.5 pb-2.5 pt-5 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-newera-primary peer" placeholder=" " />
            <label for="password" 
                   class="absolute text-sm text-newera-text-muted duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-newera-primary">
              Contraseña
            </label>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="p-3 mb-4 text-sm font-semibold text-newera-loss bg-newera-loss/10 border border-newera-loss/30 rounded-lg flex items-center gap-2">
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {{ errorMessage }}
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
  password: string = '12345678'; // Contraseña por defecto actualizada
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private loadingService: LoadingService) {}

  onSubmit() {
    this.errorMessage = '';
    
    if (this.email && this.password) {
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
          
          // Manejar error de autenticación devuelto por el Backend
          if (err.status === 401) {
            this.errorMessage = 'Credenciales incorrectas o usuario no encontrado.';
          } else if (err.status === 403) {
            this.errorMessage = 'Acceso denegado. Tu cuenta se encuentra INHABILITADA o BLOQUEADA.';
          } else if (err.status === 0) {
             this.errorMessage = 'No se pudo conectar con el servidor (Gateway no disponible).';
          } else {
            this.errorMessage = 'Ocurrió un error inesperado (' + err.status + ').';
          }
        }
      });
    } else {
      this.errorMessage = 'Por favor, ingresa tu correo y contraseña.';
    }
  }
}
