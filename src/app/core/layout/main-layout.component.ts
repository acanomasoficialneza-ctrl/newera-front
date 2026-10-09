import { Component, OnInit, HostListener, computed, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CurrentUser } from '../services/auth.service';
import { NotificationService, AlertaCampanita } from '../services/notification.service';
import { AdminCrmService } from '../services/admin-crm.service';
import { TradingSocketService } from '../services/trading-socket.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-screen w-screen bg-newera-bg-dark text-newera-text-main flex overflow-hidden">
      
      <!-- Sidebar Dinámico (Oculto en Móvil, Visible en Desktop) -->
      <aside class="hidden md:flex bg-[#111111] border-r border-white/5 flex-col transition-all duration-300 z-20 shrink-0"
             [ngClass]="isSidebarCollapsed() ? 'w-20' : 'w-64'">
        
        <!-- Logo -->
        <div class="h-16 flex items-center justify-center border-b border-white/5 shrink-0"
             [ngClass]="isSidebarCollapsed() ? 'px-0' : 'px-6 lg:justify-start'">
          <div class="flex items-center justify-center shrink-0">
            <img src="assets/novacapital/logos/favicon.png" alt="NOVA" class="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]">
          </div>
          <h1 class="ml-3 text-xl font-bold tracking-widest text-white uppercase whitespace-nowrap overflow-hidden transition-all duration-300"
              [ngClass]="isSidebarCollapsed() ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100'">
            NOVA CAPITAL
          </h1>
        </div>

        <!-- Menu Items -->
        <nav class="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          
          <a *ngFor="let item of currentMenu()" 
             [routerLink]="item.path"
             routerLinkActive="bg-white/10 text-newera-primary border-l-2 border-newera-primary"
             class="flex items-center px-3 py-3 rounded-lg text-newera-text-muted hover:bg-white/5 hover:text-white transition-colors group cursor-pointer border-l-2 border-transparent"
             [ngClass]="isSidebarCollapsed() ? 'justify-center' : 'gap-4'">
             
            <!-- Icon SVG -->
            <svg class="w-6 h-6 shrink-0 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
            </svg>
            
            <span class="font-medium tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300"
                  [ngClass]="isSidebarCollapsed() ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'">
              {{ item.label }}
            </span>
          </a>

        </nav>

        <!-- User Profile Bottom -->
        <div class="p-4 border-t border-white/5 flex items-center gap-3 overflow-hidden"
             [ngClass]="isSidebarCollapsed() ? 'justify-center' : 'justify-start'">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-newera-primary to-purple-600 p-0.5 shrink-0">
            <div class="w-full h-full bg-black rounded-full flex items-center justify-center">
              <span class="text-xs font-bold">{{ currentUser()?.name?.charAt(0) }}</span>
            </div>
          </div>
          <div class="min-w-0 transition-all duration-300"
               [ngClass]="isSidebarCollapsed() ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'">
            <p class="text-sm font-bold text-white truncate">{{ currentUser()?.name }}</p>
            <p class="text-[10px] text-newera-text-muted uppercase tracking-widest">{{ currentUser()?.role }}</p>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <!-- Padding bottom extra en móvil para que el contenido no quede debajo de la Bottom Bar -->
      <main class="flex-1 flex flex-col min-w-0 relative pb-16 md:pb-0">
        
        <!-- Top Global Header -->
        <header class="h-16 border-b border-white/5 bg-[#0B0E14] flex items-center justify-between px-6 shrink-0 z-10">
          
          <div class="flex items-center gap-4">
            <!-- Logo Móvil -->
            <div class="md:hidden flex items-center justify-center shrink-0">
              <img src="assets/novacapital/logos/favicon.png" alt="NOVA" class="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]">
            </div>

            <!-- Sidebar Toggle Button (Desktop) -->
            <button (click)="toggleSidebar()" class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-newera-text-muted hover:text-white hover:bg-white/5 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-4 ml-auto relative">
            <!-- Indicador de conexión SSE -->
            <div *ngIf="currentUser()?.role === 'CLIENTE'" 
                 class="flex items-center justify-center w-6 h-6 rounded-full"
                 [ngClass]="isConnected() ? 'bg-green-500/10' : 'bg-red-500/10'"
                 [title]="isConnected() ? 'Conectado al balance en vivo' : 'Desconectado'">
              <div class="w-2.5 h-2.5 rounded-full"
                   [ngClass]="isConnected() ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'">
              </div>
            </div>

            <!-- Balances del Cliente (Visible en Desktop y Móvil) via SSE -->
            <div *ngIf="currentUser()?.role === 'CLIENTE'" 
                 class="flex flex-row items-center bg-[#111111]/80 backdrop-blur-md rounded-xl border py-1 md:py-1.5 px-1.5 md:px-4 mx-1 md:mr-2 shadow-inner transition-colors duration-300 min-w-0 flex-shrink"
                 [ngClass]="isConnected() ? 'border-white/5' : 'border-red-500/50 opacity-70'">
                 
              <div class="flex flex-col items-center md:items-end px-1.5 md:px-3 border-r border-white/10 min-w-0">
                <span class="text-[7.5px] md:text-[10px] font-bold text-newera-text-muted uppercase tracking-wider whitespace-nowrap">Balance</span>
                <span class="text-[9.5px] md:text-sm font-bold text-white font-mono truncate w-full text-center md:text-right">{{ balance()?.dineroTotal || clientStats?.balance | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
              
              <div class="flex flex-col items-center md:items-end px-1.5 md:px-3 border-r border-white/10 min-w-0">
                <span class="text-[7.5px] md:text-[10px] font-bold text-newera-text-muted uppercase tracking-wider whitespace-nowrap">M. Libre</span>
                <span class="text-[9.5px] md:text-sm font-bold text-newera-primary font-mono truncate w-full text-center md:text-right">{{ balance()?.margenLibre || clientStats?.margenLibre | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
              
              <div class="flex flex-col items-center md:items-end pl-1.5 md:pl-3 min-w-0">
                <span class="text-[7.5px] md:text-[10px] font-bold text-newera-text-muted uppercase tracking-wider whitespace-nowrap">Margen</span>
                <span class="text-[9.5px] md:text-sm font-bold text-newera-loss font-mono truncate w-full text-center md:text-right">{{ balance()?.margen || clientStats?.margenUtilizado | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>
            </div>

            <!-- Notification Bell (Glow) -->
            <button (click)="toggleNotifications()" class="relative p-2 text-newera-text-muted hover:text-white transition-colors group">
              <span *ngIf="unreadCount() > 0" class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-newera-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.8)] border border-[#0B0E14]"></span>
              <svg class="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <!-- Notifications Dropdown -->
            <div *ngIf="showNotifications" class="absolute top-full mt-2 right-2 sm:right-12 w-[92vw] sm:w-80 max-h-96 max-w-sm glass-panel bg-[#111111]/95 border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h3 class="font-bold text-white text-sm">Notificaciones</h3>
                <span class="text-[10px] bg-newera-primary/20 text-newera-primary px-2 py-0.5 rounded-full">{{ unreadCount() }} nuevas</span>
              </div>
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div *ngIf="notifications().length === 0" class="p-6 text-center text-newera-text-muted text-xs">
                  No tienes notificaciones
                </div>
                <div *ngFor="let notif of notifications()" 
                     (click)="markAsRead(notif)"
                     class="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors relative"
                     [ngClass]="{'bg-newera-primary/5': !notif.leido}">
                  <div *ngIf="!notif.leido" class="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-newera-primary shadow-[0_0_5px_rgba(37,99,235,0.8)]"></div>
                  <div class="pl-3 flex items-start gap-2">
                    <div class="mt-0.5 shrink-0">
                      <!-- Alerta (Socket) -->
                      <svg *ngIf="notif.tipo === 'ALERTA'" class="w-4 h-4 text-newera-loss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <!-- Warning (Nuevo Cliente) -->
                      <svg *ngIf="notif.tipo === 'WARNING'" class="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <!-- Normal / INFO -->
                      <svg *ngIf="!notif.tipo || notif.tipo === 'INFO'" class="w-4 h-4 text-newera-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs font-bold" [ngClass]="notif.leido ? 'text-white/70' : 'text-white'">{{ notif.titulo }}</p>
                      <p class="text-[10px] text-newera-text-muted mt-1 leading-tight">{{ notif.mensaje }}</p>
                      <p class="text-[9px] text-white/30 mt-2 font-mono">{{ notif.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button (click)="confirmLogout()" class="flex items-center justify-center p-2 rounded-lg text-newera-loss hover:bg-newera-loss/10 transition-colors group" title="Cerrar Sesión">
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <!-- Route Content -->
        <div class="flex-1 overflow-hidden relative">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- PWA Bottom Navigation Bar (Solo Móvil) -->
      <nav class="md:hidden fixed bottom-0 w-full h-16 bg-[#0B0E14] border-t border-white/10 flex items-center justify-around px-2 z-40 pb-safe">
        <a *ngFor="let item of currentMenu()" 
           [routerLink]="item.path"
           routerLinkActive="text-newera-primary"
           [routerLinkActiveOptions]="{exact: false}"
           class="flex items-center justify-center w-full h-full text-newera-text-muted hover:text-white transition-colors"
           [title]="item.label">
          
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
          </svg>
        </a>
      </nav>

      <!-- Command Palette Overlay -->
      <div *ngIf="showCommandPalette" class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="toggleCommandPalette()"></div>
        <div class="glass-panel w-full max-w-xl bg-[#18181B]/90 relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="flex items-center px-4 py-3 border-b border-white/10">
            <svg class="w-5 h-5 text-newera-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" class="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-newera-text-muted text-lg" placeholder="¿A dónde quieres ir?..." autofocus>
            <kbd class="text-xs font-mono bg-black px-2 py-1 rounded border border-white/20 text-newera-text-muted ml-2">ESC</kbd>
          </div>
          <div class="p-2 max-h-[400px] overflow-y-auto">
            <p class="px-3 py-2 text-xs font-semibold text-newera-text-muted uppercase tracking-wider">Sugerencias</p>
            <a *ngFor="let item of currentMenu()" (click)="toggleCommandPalette()" [routerLink]="item.path" class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-newera-primary/10 hover:text-newera-primary cursor-pointer transition-colors text-white">
              <svg class="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" /></svg>
              <span>{{ item.label }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Logout Confirmation Modal -->
      <div *ngIf="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="cancelLogout()"></div>
        <div class="glass-panel w-full max-w-sm bg-[#111111] relative z-10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/10 rounded-2xl">
          <div class="p-6 text-center">
            <div class="w-16 h-16 rounded-full bg-newera-loss/10 border border-newera-loss/20 mx-auto flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-newera-loss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">¿Cerrar Sesión?</h3>
            <p class="text-sm text-newera-text-muted mb-6">Estás a punto de salir de la plataforma. ¿Deseas continuar?</p>
            <div class="flex gap-3">
              <button (click)="cancelLogout()" class="flex-1 px-4 py-2.5 rounded-lg font-bold text-white/70 bg-white/5 hover:bg-white/10 hover:text-white transition-colors border border-white/10">Cancelar</button>
              <button (click)="logout()" class="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-newera-loss hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">Sí, Salir</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser = this.authService.currentUser;
  balance = computed(() => this.tradingSocketService.balanceState());
  isConnected = computed(() => this.tradingSocketService.isBalanceConnected());
  clientStats: any = { balance: 0, margenLibre: 0, margenUtilizado: 0 };
  showCommandPalette = false;
  showLogoutModal = false;
  isSidebarCollapsed = signal(false); // Por defecto abierto en Desktop

  showNotifications = false;
  notifications = signal<AlertaCampanita[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.leido).length);
  private pollingInterval: any;

  // Iconos SVG paths (Heroicons)
  private icons = {
    chart: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
    history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    profile: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    admin: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  };

  private menus = {
    'CLIENTE': [
      { label: 'Terminal Trading', path: '/app/dashboard', icon: this.icons.chart },
      { label: 'Historial Posiciones', path: '/app/positions', icon: this.icons.chart },
      { label: 'Historial Caja', path: '/app/history', icon: this.icons.history },
      { label: 'Mi Perfil (KYC)', path: '/app/profile', icon: this.icons.profile }
    ],
    'EJECUTIVO': [
      { label: 'CRM Clientes', path: '/app/admin/crm', icon: this.icons.users }
    ],
    'GERENTE': [
      { label: 'CRM Clientes', path: '/app/admin/crm', icon: this.icons.users }
    ],
    'ADMIN': [
      { label: 'CRM Clientes', path: '/app/admin/crm', icon: this.icons.users }
    ],
    'DIRECTOR': [
      { label: 'Visión Global', path: '/app/admin/global', icon: this.icons.chart },
      { label: 'Aprobaciones Caja', path: '/app/admin/caja', icon: this.icons.admin },
      { label: 'Todos los Traders', path: '/app/admin/crm', icon: this.icons.users },
      { label: 'Gestión de Ejecutivos', path: '/app/admin/staff', icon: this.icons.briefcase },
      { label: 'Auditoría (Bitácora)', path: '/app/admin/audit', icon: this.icons.history }
    ]
  };

  currentMenu = computed(() => {
    const role = this.currentUser()?.role;
    return role ? this.menus[role] : [];
  });

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private notificationService: NotificationService, 
    private adminCrmService: AdminCrmService,
    private tradingSocketService: TradingSocketService
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    } else {
      this.loadNotifications();
      if (this.currentUser()?.role === 'CLIENTE') {
        this.loadClientStats();
        // Conectar SSE de Balance en tiempo real
        const idUser = this.currentUser()?.id;
        if (idUser) {
          this.tradingSocketService.connectBalance(idUser);
        }
      }
    }
  }

  loadClientStats() {
    const user = this.currentUser();
    if (user && user.id) {
      this.adminCrmService.getClienteById(user.id).subscribe({
        next: (data) => {
          this.clientStats = {
            balance: data.balance || 0,
            margenLibre: data.margenLibre || 0,
            margenUtilizado: data.margenUtilizado || 0
          };
        },
        error: (err) => console.error('Error fetching client stats in layout', err)
      });
    }
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    // Siempre desconectamos el socket al destruir el layout por seguridad, 
    // sin importar el rol actual (que podría ya ser null si se llamó logout antes).
    this.tradingSocketService.disconnectBalance();
  }

  private notificationSubscription: any;

  loadNotifications() {
    const user = this.currentUser();
    if (user && user.id) {
      this.notificationSubscription = this.notificationService.getNotificaciones(user.id).subscribe({
        next: (data) => this.notifications.set(data),
        error: (err) => console.error("Error cargando notificaciones", err)
      });
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notif: AlertaCampanita) {
    if (!notif.leido) {
      this.notificationService.marcarComoLeida(notif.idAlerta).subscribe({
        next: () => {
          this.notifications.update(list => list.map(n => n.idAlerta === notif.idAlerta ? { ...n, leido: true } : n));
        }
      });
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleCommandPalette();
    }
    if (event.key === 'Escape' && this.showCommandPalette) {
      this.toggleCommandPalette();
    }
  }

  toggleCommandPalette() {
    this.showCommandPalette = !this.showCommandPalette;
  }

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  confirmLogout() {
    this.showLogoutModal = true;
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  logout() {
    this.showLogoutModal = false;
    
    // Limpiamos los ciclos manualmente antes de que se destruya para mayor seguridad
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    this.tradingSocketService.disconnectBalance();

    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
