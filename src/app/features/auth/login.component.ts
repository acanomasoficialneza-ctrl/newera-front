import { Component, OnInit } from '@angular/core';
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
      
      <!-- Toast Notification -->
      <div *ngIf="toastMessage" class="fixed bottom-4 left-4 right-4 md:left-auto md:w-auto z-[120] animate-in slide-in-from-bottom-5 fade-in duration-300">
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

      <!-- LÍNEAS PARA MÓVILES -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0B0E14] block md:hidden">
        <div class="absolute inset-0 opacity-40" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(37,99,235,0.4) 40px, rgba(37,99,235,0.4) 42px); animation: slide-right 20s linear infinite;"></div>
        <div class="absolute inset-0 opacity-30" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(16,185,129,0.3) 15px, rgba(16,185,129,0.3) 16px); animation: slide-left 15s linear infinite;"></div>
        <div class="absolute top-[10%] left-[50%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2"></div>
      </div>

      <!-- PARTÍCULAS PARA ESCRITORIO -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0B0E14] hidden md:block">
        <div class="absolute inset-0 opacity-50" style="background-image: radial-gradient(#2563EB 1px, transparent 1px); background-size: 35px 35px; animation: slide-up 35s linear infinite;"></div>
        <div class="absolute inset-0 opacity-70" style="background-image: radial-gradient(#ffffff 1.5px, transparent 1.5px); background-size: 80px 80px; animation: slide-up 20s linear infinite; margin-top: 20px; margin-left: 10px;"></div>
        <div class="absolute inset-0 opacity-90" style="background-image: radial-gradient(#10B981 2px, transparent 2px); background-size: 140px 140px; animation: slide-up 12s linear infinite; margin-top: 40px; margin-left: -20px;"></div>
        <div class="absolute top-[10%] left-[50%] w-[300px] md:w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] -translate-x-1/2"></div>
      </div>

      <!-- CSS para animaciones -->
      <style>
        @keyframes slide-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100px); }
        }
        @keyframes slide-right {
          0% { background-position: 0 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes slide-left {
          0% { background-position: 0 0; }
          100% { background-position: -1000px 0; }
        }
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

      <!-- Tarjeta de Login Principal -->
      <div class="glass-panel w-full max-w-md p-8 md:p-10 relative z-10 rounded-3xl">
        
        <div class="mb-8 text-center flex flex-col items-center">
          <div class="flex items-center justify-center">
             <img src="assets/novacapital/logos/logo-vertical.png" alt="NOVA CAPITAL" class="w-60 h-auto object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
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

          <button type="submit" [disabled]="isLoading" class="btn-premium w-full mt-6 flex justify-center uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isLoading ? 'Conectando...' : 'Iniciar Sesión' }}
          </button>

          <!-- Botón de Registro para Clientes Nuevos -->
          <div class="pt-6 border-t border-white/10 text-center">
            <p class="text-xs text-white/50 mb-3">¿Aún no tienes una cuenta de trading?</p>
            <button type="button" (click)="openRegisterModal()" class="w-full py-2.5 px-4 rounded-xl border border-newera-primary/40 bg-newera-primary/10 text-newera-primary hover:bg-newera-primary hover:text-white font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Crear Cuenta / Registrarse
            </button>
          </div>
        </form>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL DE ALTA DE NUEVO CLIENTE (MISMO FORMULARIO DE CRM)  -->
      <!-- ======================================================== -->
      <div *ngIf="isRegisterModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="closeRegisterModal()"></div>
        <div class="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] relative z-10 p-5 md:p-7 flex flex-col gap-6 animate-in zoom-in-95 duration-200 border border-white/10 shadow-2xl custom-scrollbar rounded-2xl">
          
          <div class="flex justify-between items-center border-b border-white/10 pb-4 shrink-0">
            <div>
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-newera-primary animate-pulse"></span>
                Registro de Nuevo Cliente
              </h2>
              <p class="text-xs text-white/50 mt-0.5">Crea tu cuenta de operaciones en Nova Capital</p>
            </div>
            <button (click)="closeRegisterModal()" class="text-white/50 hover:text-white transition-colors p-1">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Correo Electrónico -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Correo Electrónico <span class="text-red-500">*</span></label>
              <input type="email" [(ngModel)]="registerClient.correo" name="reg_correo" (blur)="onRegisterCorreoBlur()"
                     [ngClass]="{
                       'bg-red-500/5 border-red-500 focus:border-red-500 text-red-100': registerErrors['correo'] || registerCorreoStatus === 'invalid',
                       'bg-green-500/5 border-green-500 focus:border-green-500 text-green-100': registerCorreoStatus === 'valid',
                       'bg-white/5 border-white/10 focus:border-newera-primary text-white': !registerErrors['correo'] && registerCorreoStatus !== 'invalid' && registerCorreoStatus !== 'valid'
                     }"
                     class="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors" placeholder="usuario@ejemplo.com">
              <p *ngIf="registerCorreoStatus === 'invalid'" class="text-[9px] text-red-400 mt-0.5">Este correo ya está registrado.</p>
            </div>

            <!-- Contraseña -->
            <div class="space-y-1 relative">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Contraseña <span class="text-red-500">*</span></label>
              <div class="relative">
                <input [type]="showRegisterPassword ? 'text' : 'password'" [(ngModel)]="registerClient.pass" name="reg_pass" 
                       [ngClass]="registerErrors['pass'] ? 'bg-red-500/5 border-red-500 focus:border-red-500 text-red-100' : 'bg-white/5 border-white/10 focus:border-newera-primary text-white'" 
                       class="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors pr-10" placeholder="Mínimo 6 caracteres">
                <button type="button" (click)="showRegisterPassword = !showRegisterPassword" class="absolute right-2.5 top-2.5 text-white/50 hover:text-white">
                  <svg *ngIf="!showRegisterPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <svg *ngIf="showRegisterPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                </button>
              </div>
            </div>

            <!-- Nombre Completo -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Nombre Completo <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="registerClient.nombreCompleto" name="reg_nombreCompleto" 
                     [ngClass]="registerErrors['nombreCompleto'] ? 'bg-red-500/5 border-red-500 focus:border-red-500 text-red-100' : 'bg-white/5 border-white/10 focus:border-newera-primary text-white'" 
                     class="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors" placeholder="Ej. Juan Pérez González">
            </div>

            <!-- Nombre de Pila (Nick) -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Nombre de Pila (Nick)</label>
              <input type="text" [(ngModel)]="registerClient.nombrePila" name="reg_nombrePila" class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-newera-primary transition-colors" placeholder="Ej. Juan">
            </div>

            <!-- Teléfono -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Teléfono <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="registerClient.telefono" name="reg_telefono" (blur)="onRegisterTelefonoBlur()"
                     [ngClass]="{
                       'bg-red-500/5 border-red-500 focus:border-red-500 text-red-100': registerErrors['telefono'] || registerTelefonoStatus === 'invalid',
                       'bg-green-500/5 border-green-500 focus:border-green-500 text-green-100': registerTelefonoStatus === 'valid',
                       'bg-white/5 border-white/10 focus:border-newera-primary text-white': !registerErrors['telefono'] && registerTelefonoStatus !== 'invalid' && registerTelefonoStatus !== 'valid'
                     }"
                     class="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors" placeholder="10 dígitos">
              <p *ngIf="registerTelefonoStatus === 'invalid'" class="text-[9px] text-red-400 mt-0.5">Este teléfono ya está registrado.</p>
            </div>

            <!-- Estado de Residencia -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Estado de Residencia</label>
              <select [(ngModel)]="registerClient.estadoResidencia" name="reg_estadoResidencia" class="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-newera-primary transition-colors">
                <option class="bg-[#111] text-white" value="">Selecciona un estado...</option>
                <option class="bg-[#111] text-white" *ngFor="let state of statesOfMexico" [value]="state">{{ state }}</option>
              </select>
            </div>

            <!-- Fecha Nacimiento -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Fecha Nacimiento <span class="text-red-500">*</span></label>
              <input type="date" [(ngModel)]="registerClient.fechaNacimiento" name="reg_fechaNacimiento" 
                     [ngClass]="registerErrors['fechaNacimiento'] ? 'bg-red-500/5 border-red-500 focus:border-red-500 text-red-100' : 'bg-white/5 border-white/10 focus:border-newera-primary text-white'" 
                     class="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors [color-scheme:dark]">
              <p class="text-[9px] text-white/40 italic mt-0.5">* Debes ser mayor de 18 años para operar.</p>
            </div>

            <!-- Profesión -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Profesión</label>
              <input type="text" [(ngModel)]="registerClient.profesion" name="reg_profesion" class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-newera-primary transition-colors" placeholder="Ej. Ingeniero, Comerciante...">
            </div>

            <!-- Experiencia Trading -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Experiencia Trading <span class="text-red-500">*</span></label>
              <select [(ngModel)]="registerClient.experienciaTrading" name="reg_experienciaTrading" 
                      [ngClass]="registerErrors['experienciaTrading'] ? 'bg-red-500/5 border-red-500 focus:border-red-500 text-red-100' : 'bg-[#111] border-white/10 focus:border-newera-primary text-white'" 
                      class="w-full border rounded px-3 py-2 text-sm focus:outline-none transition-colors">
                <option class="bg-[#111] text-white" value="">Seleccionar nivel...</option>
                <option class="bg-[#111] text-white" value="PRINCIPIANTE">Principiante (Menos de 1 año)</option>
                <option class="bg-[#111] text-white" value="INTERMEDIO">Intermedio (1 a 3 años)</option>
                <option class="bg-[#111] text-white" value="AVANZADO">Avanzado (Más de 3 años)</option>
              </select>
            </div>

            <!-- Hobbie -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Hobbie / Interés</label>
              <input type="text" [(ngModel)]="registerClient.hobbie" name="reg_hobbie" class="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-newera-primary transition-colors" placeholder="Ej. Deportes, Lectura...">
            </div>

            <!-- CHECKBOX DE TÉRMINOS, CONFIDENCIALIDAD Y PRIVACIDAD -->
            <div class="col-span-1 md:col-span-2 pt-3 border-t border-white/10 mt-1">
              <label class="flex items-start gap-3 cursor-pointer select-none group">
                <input type="checkbox" [(ngModel)]="aceptoTerminos" name="reg_aceptoTerminos" 
                       class="mt-1 w-4 h-4 rounded border-white/30 text-newera-primary focus:ring-0 focus:outline-none cursor-pointer bg-white/5">
                <div class="text-xs text-white/80 leading-relaxed">
                  He leído, comprendo y acepto los 
                  <button type="button" (click)="openLegalModal('TERMINOS_CONDICIONES', $event)" class="text-newera-primary hover:underline font-bold inline">Términos y Condiciones</button>, 
                  la <button type="button" (click)="openLegalModal('CONFIDENCIALIDAD', $event)" class="text-newera-primary hover:underline font-bold inline">Cláusula de Confidencialidad</button> y 
                  la <button type="button" (click)="openLegalModal('AVISO_PRIVACIDAD', $event)" class="text-newera-primary hover:underline font-bold inline">Política de Privacidad</button> 
                  de Nova Capital.
                </div>
              </label>
              <p *ngIf="registerErrors['aceptoTerminos']" class="text-[10px] text-red-400 mt-1 pl-7 font-semibold">
                * Es obligatorio aceptar los términos y la política de privacidad para crear tu cuenta.
              </p>
            </div>
          </form>

          <div class="pt-4 border-t border-white/10 flex justify-end gap-3 shrink-0">
            <button type="button" (click)="closeRegisterModal()" class="px-4 py-2 text-white/70 hover:text-white transition-colors text-sm font-semibold">
              Cancelar
            </button>
            <button type="button" (click)="submitRegister()" [disabled]="isSubmittingRegister" class="bg-newera-primary text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)] text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              {{ isSubmittingRegister ? 'Registrando...' : 'Completar Registro' }}
            </button>
          </div>

        </div>
      </div>

      <!-- ======================================================== -->
      <!-- SUB-MODAL DE LECTURA DE TÉRMINOS Y PRIVACIDAD (DINÁMICO) -->
      <!-- ======================================================== -->
      <div *ngIf="isLegalModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-md" (click)="closeLegalModal()"></div>
        <div class="glass-panel w-full max-w-2xl max-h-[85vh] overflow-hidden bg-[#121212] relative z-10 flex flex-col border border-white/15 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
          
          <!-- Header Legal -->
          <div class="p-5 border-b border-white/10 flex justify-between items-center bg-black/30">
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-newera-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Marco Legal y Regulatorio
              </h3>
              <p class="text-[11px] text-white/50">Nova Capital Financial Services v1.0</p>
            </div>
            <button type="button" (click)="closeLegalModal()" class="text-white/50 hover:text-white p-1 transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Pestañas de Navegación -->
          <div class="flex border-b border-white/10 bg-black/40 px-4 pt-2 gap-2 overflow-x-auto">
            <button type="button" (click)="selectedLegalTab = 'TERMINOS_CONDICIONES'" 
                    [ngClass]="selectedLegalTab === 'TERMINOS_CONDICIONES' ? 'border-newera-primary text-white bg-white/5' : 'border-transparent text-white/50 hover:text-white'"
                    class="px-4 py-2 text-xs font-bold border-b-2 transition-all uppercase tracking-wider whitespace-nowrap rounded-t-lg">
              Términos de Uso
            </button>
            <button type="button" (click)="selectedLegalTab = 'CONFIDENCIALIDAD'" 
                    [ngClass]="selectedLegalTab === 'CONFIDENCIALIDAD' ? 'border-newera-primary text-white bg-white/5' : 'border-transparent text-white/50 hover:text-white'"
                    class="px-4 py-2 text-xs font-bold border-b-2 transition-all uppercase tracking-wider whitespace-nowrap rounded-t-lg">
              Confidencialidad
            </button>
            <button type="button" (click)="selectedLegalTab = 'AVISO_PRIVACIDAD'" 
                    [ngClass]="selectedLegalTab === 'AVISO_PRIVACIDAD' ? 'border-newera-primary text-white bg-white/5' : 'border-transparent text-white/50 hover:text-white'"
                    class="px-4 py-2 text-xs font-bold border-b-2 transition-all uppercase tracking-wider whitespace-nowrap rounded-t-lg">
              Privacidad
            </button>
          </div>

          <!-- Contenido del Documento Legal -->
          <div class="p-5 flex-1 overflow-y-auto custom-scrollbar bg-black/20 text-xs text-white/80 leading-relaxed font-sans whitespace-pre-line">
            {{ getLegalContent(selectedLegalTab) }}
          </div>

          <!-- Footer Legal -->
          <div class="p-4 border-t border-white/10 bg-black/40 flex justify-end">
            <button type="button" (click)="acceptAndCloseLegalModal()" class="btn-premium px-6 py-2 text-xs font-bold uppercase tracking-widest">
              Entendido y Aceptar
            </button>
          </div>

        </div>
      </div>

    </main>
  `
})
export class LoginComponent implements OnInit {
  // Login State
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  loginErrors: any = {};
  toastMessage: string | null = null;
  toastType: 'success' | 'warning' | 'error' = 'success';
  isLoading: boolean = false;

  // Register Modal State
  isRegisterModalOpen: boolean = false;
  isSubmittingRegister: boolean = false;
  showRegisterPassword: boolean = false;
  aceptoTerminos: boolean = false;
  registerErrors: any = {};
  registerCorreoStatus: 'valid' | 'invalid' | 'loading' | null = null;
  registerTelefonoStatus: 'valid' | 'invalid' | 'loading' | null = null;

  registerClient: any = {
    correo: '',
    pass: '',
    nombreCompleto: '',
    nombrePila: '',
    telefono: '',
    estadoResidencia: '',
    fechaNacimiento: '',
    profesion: '',
    experienciaTrading: '',
    hobbie: ''
  };

  // Legal Modal State
  isLegalModalOpen: boolean = false;
  selectedLegalTab: string = 'TERMINOS_CONDICIONES';
  documentosLegales: any[] = [];

  statesOfMexico = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 
    'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 
    'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 
    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 
    'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ];

  // Fallback content in case DB is being contacted
  fallbackLegalTexts: Record<string, string> = {
    TERMINOS_CONDICIONES: `1. OBJETO Y ACEPTACIÓN: Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma tecnológica Nova Capital. Al registrarse y operar, el usuario declara haber leído, comprendido y aceptado en su totalidad las cláusulas aquí estipuladas.

2. REQUISITOS DE CAPACIDAD Y MAYORÍA DE EDAD: El servicio está disponible únicamente para personas físicas mayores de dieciocho (18) años con plena capacidad jurídica para contraer obligaciones legales y financieras vinculantes. La falsedad u omisión de datos demográficos o de identidad conllevará la cancelación inmediata de la cuenta.

3. ADVERTENCIA DE ALTO RIESGO FINANCIERO: El comercio de activos financieros, divisas, índices, materias primas y criptomonedas implica un nivel elevado de volatilidad y riesgo de pérdida parcial o total del capital invertido. El usuario reconoce expresamente que las fluctuaciones de mercado son independientes de Nova Capital y asume la responsabilidad exclusiva de sus decisiones de inversión.

4. APALANCAMIENTO Y GESTIÓN DE MARGEN: Las órdenes ejecutadas mediante margen requieren el mantenimiento de fondos libres suficientes. Si el margen libre cae por debajo de los umbrales mínimos establecidos por la plataforma, Nova Capital se reserva el derecho de liquidar o cerrar posiciones abiertas para evitar saldos negativos imprevistos.

5. POLÍTICA DE DEPÓSITOS Y RETIROS: Todas las transacciones de fondeo y retiro se procesan a través de los canales y métodos de pago autorizados en la plataforma, sujetas a la verificación previa del perfil (KYC) y a las normativas de prevención de operaciones ilícitas.`,

    CONFIDENCIALIDAD: `1. CUSTODIA EXCLUSIVA DE ACCESOS: El usuario es el único depositario y responsable absoluto de la custodia, secrecía y confidencialidad de su correo electrónico, contraseña y factores de autenticación. Nova Capital no se hace responsable por accesos no autorizados derivados de negligencia, extravío o cesión de credenciales por parte del titular.

2. PROHIBICIÓN DE CESIÓN DE CUENTA: La cuenta creada en Nova Capital es personal e intransferible. Queda expresamente prohibido ceder, prestar, arrendar o delegar la operativa o acceso a la cuenta a terceras partes sin autorización expresa y por escrito de la plataforma.

3. CONFIDENCIALIDAD DE COMUNICACIONES: Cualquier información, cotización preferente, reporte técnico, estado de cuenta o comunicación operativa intercambiada entre el cliente y su mesa de control o ejecutivo asignado tendrá carácter confidencial y no podrá ser divulgada ni reproducida sin consentimiento previo.

4. DEBER DE NOTIFICACIÓN INMEDIATA: El usuario se compromete a notificar a Nova Capital de forma inmediata ante cualquier sospecha de brecha de seguridad, uso no autorizado de su cuenta o vulneración de sus credenciales para proceder al bloqueo preventivo de sus activos.`,

    AVISO_PRIVACIDAD: `1. RESPONSABLE DEL TRATAMIENTO: Nova Capital es responsable del resguardo y tratamiento legítimo, confidencial e informado de los datos personales proporcionados por sus usuarios, garantizando la privacidad de los mismos.

2. DATOS RECABADOS: Para la apertura y correcta operatividad de la cuenta se recaban datos de identificación (nombre completo, nombre de pila, fecha de nacimiento, estado de residencia), datos de contacto (correo electrónico, teléfono), información de experiencia operativa (profesión, experiencia bursátil) y documentación oficial para cotejo KYC (identificación oficial INE/Pasaporte).

3. FINALIDAD DEL TRATAMIENTO: La recopilación de información tiene como finalidades principales: (a) Verificar y autenticar fehacientemente la identidad del titular; (b) Dar cumplimiento a los protocolos de prevención de lavado de dinero (AML) y financiamiento ilícito; (c) Gestionar las transacciones de caja, depósitos y retiros; y (d) Brindar soporte operativo personalizado.

4. MEDIDAS DE SEGURIDAD Y CIFRADO: Toda la información personal y las contraseñas se almacenan bajo rigurosos protocolos de cifrado de grado bancario (algoritmos BCrypt y AES). Nova Capital no comercializa, transfiere ni cede datos a terceros no vinculados con la prestación del servicio.

5. DERECHOS ARCO: El titular de los datos tiene en todo momento el derecho de acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales mediante solicitud formal dirigida a la mesa de control de Nova Capital.`
  };

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.cargarDocumentosLegales();
  }

  cargarDocumentosLegales() {
    this.authService.getDocumentosLegales().subscribe({
      next: (docs) => {
        if (docs && docs.length > 0) {
          this.documentosLegales = docs;
        }
      },
      error: () => {
        // En caso de fallo o modo offline, fallbackLegalTexts responderá
      }
    });
  }

  getLegalContent(codigo: string): string {
    const doc = this.documentosLegales.find(d => d.codigo === codigo);
    if (doc && doc.contenido) {
      return doc.contenido;
    }
    return this.fallbackLegalTexts[codigo] || 'Cargando documento...';
  }

  showToast(msg: string, type: 'success' | 'warning' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  // ============================================
  // LOGIN SUBMIT
  // ============================================
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

    this.isLoading = true;
    this.loadingService.show('radar', 'Autenticando...');

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loadingService.hide();
        this.isLoading = false;
        
        const role = response.rol;
        
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

  // ============================================
  // REGISTRO DE NUEVO CLIENTE (MODAL)
  // ============================================
  openRegisterModal() {
    this.registerClient = {
      correo: '',
      pass: '',
      nombreCompleto: '',
      nombrePila: '',
      telefono: '',
      estadoResidencia: '',
      fechaNacimiento: '',
      profesion: '',
      experienciaTrading: '',
      hobbie: ''
    };
    this.registerErrors = {};
    this.registerCorreoStatus = null;
    this.registerTelefonoStatus = null;
    this.aceptoTerminos = false;
    this.showRegisterPassword = false;
    this.isRegisterModalOpen = true;

    // Refrescar documentos legales si no estaban cargados
    if (this.documentosLegales.length === 0) {
      this.cargarDocumentosLegales();
    }
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }

  openLegalModal(tab: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedLegalTab = tab;
    this.isLegalModalOpen = true;
  }

  closeLegalModal() {
    this.isLegalModalOpen = false;
  }

  acceptAndCloseLegalModal() {
    this.aceptoTerminos = true;
    this.registerErrors['aceptoTerminos'] = false;
    this.isLegalModalOpen = false;
  }

  onRegisterCorreoBlur() {
    if (!this.registerClient.correo || !this.registerClient.correo.includes('@')) {
      this.registerCorreoStatus = null;
      return;
    }
    this.registerCorreoStatus = 'loading';
    this.authService.checkCorreo(this.registerClient.correo).subscribe({
      next: (res) => {
        this.registerCorreoStatus = res.exists ? 'invalid' : 'valid';
        if (res.exists) {
          this.showToast('El correo ingresado ya está registrado.', 'error');
        }
      },
      error: () => {
        this.registerCorreoStatus = null;
      }
    });
  }

  onRegisterTelefonoBlur() {
    if (!this.registerClient.telefono || this.registerClient.telefono.trim().length < 8) {
      this.registerTelefonoStatus = null;
      return;
    }
    this.registerTelefonoStatus = 'loading';
    this.authService.checkTelefono(this.registerClient.telefono).subscribe({
      next: (res) => {
        this.registerTelefonoStatus = res.exists ? 'invalid' : 'valid';
        if (res.exists) {
          this.showToast('El teléfono ingresado ya está registrado.', 'error');
        }
      },
      error: () => {
        this.registerTelefonoStatus = null;
      }
    });
  }

  submitRegister() {
    this.registerErrors = {};
    let hasError = false;

    if (!this.registerClient.correo || !this.registerClient.correo.includes('@') || this.registerCorreoStatus === 'invalid') {
      if (!hasError && this.registerCorreoStatus === 'invalid') this.showToast('El correo ya está registrado.', 'error');
      else if (!hasError) this.showToast('Ingresa un correo electrónico válido.', 'warning');
      this.registerErrors['correo'] = true;
      hasError = true;
    }

    if (!this.registerClient.pass || this.registerClient.pass.trim().length < 6) {
      if (!hasError) this.showToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
      this.registerErrors['pass'] = true;
      hasError = true;
    }

    if (!this.registerClient.nombreCompleto || this.registerClient.nombreCompleto.trim().length < 3) {
      if (!hasError) this.showToast('Ingresa tu nombre completo (mínimo 3 caracteres).', 'warning');
      this.registerErrors['nombreCompleto'] = true;
      hasError = true;
    }

    if (!this.registerClient.telefono || this.registerClient.telefono.trim().length < 10 || this.registerTelefonoStatus === 'invalid') {
      if (!hasError && this.registerTelefonoStatus === 'invalid') this.showToast('El teléfono ya está registrado.', 'error');
      else if (!hasError) this.showToast('Ingresa un teléfono válido de 10 dígitos.', 'warning');
      this.registerErrors['telefono'] = true;
      hasError = true;
    }

    if (!this.registerClient.fechaNacimiento) {
      if (!hasError) this.showToast('La fecha de nacimiento es obligatoria.', 'warning');
      this.registerErrors['fechaNacimiento'] = true;
      hasError = true;
    } else {
      const birthDate = new Date(this.registerClient.fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        if (!hasError) this.showToast('Debes ser mayor de 18 años para operar en Nova Capital.', 'error');
        this.registerErrors['fechaNacimiento'] = true;
        hasError = true;
      }
    }

    if (!this.registerClient.experienciaTrading || this.registerClient.experienciaTrading.trim() === '') {
      if (!hasError) this.showToast('Selecciona tu nivel de experiencia en trading.', 'warning');
      this.registerErrors['experienciaTrading'] = true;
      hasError = true;
    }

    if (!this.aceptoTerminos) {
      if (!hasError) this.showToast('Debes aceptar los Términos, Confidencialidad y Privacidad.', 'warning');
      this.registerErrors['aceptoTerminos'] = true;
      hasError = true;
    }

    if (hasError) return;

    this.isSubmittingRegister = true;
    this.loadingService.show('radar', 'Creando tu cuenta de trading...');

    const payload = {
      correo: this.registerClient.correo,
      pass: this.registerClient.pass,
      nombreCompleto: this.registerClient.nombreCompleto,
      nombrePila: this.registerClient.nombrePila,
      telefono: this.registerClient.telefono,
      estadoResidencia: this.registerClient.estadoResidencia,
      fechaNacimiento: this.registerClient.fechaNacimiento,
      profesion: this.registerClient.profesion,
      experienciaTrading: this.registerClient.experienciaTrading,
      hobbie: this.registerClient.hobbie
    };

    this.authService.registrarClientePublico(payload).subscribe({
      next: () => {
        this.loadingService.hide();
        this.isSubmittingRegister = false;
        this.isRegisterModalOpen = false;
        
        // Colocar el correo registrado en el campo de login
        this.email = this.registerClient.correo;
        this.password = '';
        this.showToast('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.', 'success');
      },
      error: (err) => {
        this.loadingService.hide();
        this.isSubmittingRegister = false;
        console.error('Error al registrar cliente:', err);
        const errorMsg = err.error?.message || err.error || 'Error al procesar el registro.';
        this.showToast(typeof errorMsg === 'string' ? errorMsg : 'Error al registrar tu cuenta.', 'error');
      }
    });
  }
}
