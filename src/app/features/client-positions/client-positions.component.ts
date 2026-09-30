import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingSocketService } from '../../core/services/trading-socket.service';
import { ApuestaService } from '../../core/services/apuesta.service';
import { ApuestaCliente } from '../../core/models/models';
import { LoadingService } from '../../core/services/loading.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-positions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex flex-col pt-[80px] p-4 md:p-6 lg:p-8 overflow-hidden bg-black text-white relative">
      
      <!-- Background Elements -->
      <div class="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-newera-primary/20 rounded-full blur-[120px]"></div>
      </div>

      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 z-10">
        <div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight mb-2">Historial de Posiciones</h1>
          <p class="text-newera-text-muted text-sm max-w-xl">
            Resumen de tus operaciones de trading pasadas y activas.
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-panel p-4 flex flex-col md:flex-row gap-4 mb-6 z-10 w-fit">
        <div class="flex items-center gap-1 bg-black/40 border border-white/5 rounded-xl p-1.5 w-fit">
          <button (click)="setFilter('ABIERTAS')" 
                  class="px-5 py-2 text-xs font-bold rounded-lg transition-all"
                  [ngClass]="filter() === 'ABIERTAS' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'">
            ABIERTAS
          </button>
          <button (click)="setFilter('CERRADAS')" 
                  class="px-5 py-2 text-xs font-bold rounded-lg transition-all"
                  [ngClass]="filter() === 'CERRADAS' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'">
            CERRADAS
          </button>
        </div>
      </div>

      <!-- Table Section (Trading) -->
      <div class="glass-panel flex-1 overflow-hidden flex flex-col z-10">
        <div class="overflow-x-auto custom-scrollbar flex-1">
          <!-- Vista Desktop (Tabla) -->
          <table class="w-full text-left text-sm whitespace-nowrap hidden md:table">
            <thead class="text-[10px] text-white/40 uppercase tracking-widest bg-black/40 sticky top-0 backdrop-blur-md border-b border-white/10 z-10">
              <tr>
                <th class="px-6 py-4 font-semibold hidden lg:table-cell">ID Orden</th>
                <th class="px-6 py-4 font-semibold">Fecha Apertura</th>
                <th class="px-6 py-4 font-semibold">Activo</th>
                <th class="px-6 py-4 font-semibold hidden md:table-cell">Tipo</th>
                <th class="px-6 py-4 font-semibold text-right">Inversión</th>
                <th class="px-6 py-4 font-semibold text-right">P&L Final</th>
                <th class="px-6 py-4 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let pos of displayedPositions()" class="hover:bg-white/5 transition-colors group">
                <!-- ID ORDEN -->
                <td class="px-6 py-4 font-mono text-xs text-white/50 group-hover:text-newera-primary transition-colors hidden lg:table-cell">
                  ORD-{{ pos.idApuestaCliente || '0000' }}
                </td>
                
                <!-- FECHA APERTURA -->
                <td class="px-6 py-4 text-white">
                  {{ pos.fechaCreacion | date:'dd MMM yyyy, HH:mm' }}
                </td>
                
                <!-- ACTIVO -->
                <td class="px-6 py-4 font-bold text-white">
                  {{ pos.compra }}
                </td>
                
                <!-- TIPO -->
                <td class="px-6 py-4 hidden md:table-cell">
                  <span class="px-2 py-1 rounded text-xs font-bold border"
                        [ngClass]="{
                          'bg-newera-profit/10 text-newera-profit border-newera-profit/20': pos.tipoCompra === 'COMPRA',
                          'bg-newera-loss/10 text-newera-loss border-newera-loss/20': pos.tipoCompra === 'VENTA'
                        }">
                    {{ pos.tipoCompra }}
                  </span>
                </td>
                
                <!-- INVERSION -->
                <td class="px-6 py-4 font-mono text-right text-newera-text-muted">
                    <span>$</span>{{ pos.montoApuesta | number:'1.2-2' }}
                </td>
                
                <!-- P&L FINAL -->
                <td class="px-6 py-4 font-mono font-bold text-right"
                    [ngClass]="pos.gananciaPerdida >= 0 ? 'text-newera-profit' : 'text-newera-loss'">
                    {{ pos.gananciaPerdida >= 0 ? '+$' : '-$' }}{{ (pos.gananciaPerdida >= 0 ? pos.gananciaPerdida : (pos.gananciaPerdida * -1)) | number:'1.2-2' }}
                </td>
                
                <!-- ESTADO -->
                <td class="px-6 py-4 text-center flex justify-center">
                  <button *ngIf="pos.estatusCompra !== 'CERRADO'" (click)="requestCerrar(pos.idApuestaCliente!)" 
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-newera-primary/10 text-newera-primary border-newera-primary/30 hover:bg-newera-primary hover:text-white transition-colors group/btn">
                    <span class="w-1.5 h-1.5 rounded-full bg-newera-primary animate-pulse shadow-[0_0_5px_#2563eb] group-hover/btn:bg-white group-hover/btn:shadow-white"></span>
                    CERRAR
                  </button>
                  <div *ngIf="pos.estatusCompra === 'CERRADO'" 
                       class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-white/5 text-white/50 border-white/10">
                    CERRADA
                  </div>
                </td>
              </tr>
              <tr *ngIf="displayedPositions().length === 0">
                <td colspan="7" class="text-center py-12 text-white/40 text-sm">No hay posiciones para mostrar</td>
              </tr>
            </tbody>
          </table>

          <!-- Vista Móvil (Tarjetas) -->
          <div class="md:hidden flex flex-col gap-4 p-4 pb-20">
            <div *ngFor="let pos of displayedPositions()" class="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 shadow-lg relative overflow-hidden group">
              <!-- Top Row -->
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-sm text-white">{{ pos.compra }}</span>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-bold border"
                          [ngClass]="pos.tipoCompra === 'COMPRA' ? 'bg-newera-profit/10 text-newera-profit border-newera-profit/20' : 'bg-newera-loss/10 text-newera-loss border-newera-loss/20'">
                      {{ pos.tipoCompra }}
                    </span>
                  </div>
                  <span class="text-[10px] text-newera-text-muted">{{ pos.fechaCreacion | date:'dd MMM yyyy, HH:mm' }}</span>
                </div>
                <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                     [ngClass]="pos.estatusCompra !== 'CERRADO' ? 'bg-newera-primary/10 text-newera-primary border-newera-primary/30' : 'bg-white/5 text-white/50 border-white/10'">
                  <span *ngIf="pos.estatusCompra !== 'CERRADO'" class="w-1.5 h-1.5 rounded-full bg-newera-primary animate-pulse shadow-[0_0_5px_#2563eb]"></span>
                  {{ pos.estatusCompra !== 'CERRADO' ? 'ABIERTA' : 'CERRADA' }}
                </div>
              </div>
              
              <!-- Bottom Row -->
              <div class="flex justify-between items-end border-t border-white/5 pt-3">
                <div class="flex flex-col">
                  <span class="text-[9px] text-newera-text-muted uppercase tracking-wider mb-0.5">Inversión</span>
                  <span class="text-newera-text-muted font-mono text-sm"><span>$</span>{{ pos.montoApuesta | number:'1.2-2' }}</span>
                  <span class="text-white/30 font-mono text-[9px] mt-0.5">ORD-{{ pos.idApuestaCliente }}</span>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[9px] text-newera-text-muted uppercase tracking-wider mb-0.5">P&L Final</span>
                  <span class="font-mono font-bold text-lg"
                        [ngClass]="pos.gananciaPerdida >= 0 ? 'text-newera-profit' : 'text-newera-loss'">
                    {{ pos.gananciaPerdida >= 0 ? '+$' : '-$' }}{{ (pos.gananciaPerdida >= 0 ? pos.gananciaPerdida : (pos.gananciaPerdida * -1)) | number:'1.2-2' }}
                  </span>
                </div>
              </div>

              <!-- Action Row Mobile -->
              <div *ngIf="pos.estatusCompra !== 'CERRADO'" class="border-t border-white/5 pt-3 flex justify-center">
                <button (click)="requestCerrar(pos.idApuestaCliente!)" class="w-full inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-newera-primary/10 text-newera-primary border-newera-primary/30 hover:bg-newera-primary hover:text-white transition-colors group/btn">
                  <span class="w-1.5 h-1.5 rounded-full bg-newera-primary animate-pulse shadow-[0_0_5px_#2563eb] group-hover/btn:bg-white group-hover/btn:shadow-white"></span>
                  CERRAR ORDEN
                </button>
              </div>
            </div>
            
            <div *ngIf="displayedPositions().length === 0" class="text-center py-8 text-white/40 text-sm border border-white/5 rounded-xl bg-black/20">
              No hay posiciones para mostrar
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación -->
      <div *ngIf="isConfirmOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-md" (click)="cancelConfirm()"></div>
        <div class="glass-panel w-full max-w-sm bg-[#111] relative z-10 p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200 border border-newera-primary/30 shadow-[0_0_30px_rgba(37,99,235,0.15)] text-center">
          
          <div class="w-12 h-12 rounded-full bg-newera-primary/10 flex items-center justify-center mx-auto mb-2 border border-newera-primary/30">
            <svg class="w-6 h-6 text-newera-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div>
            <h3 class="text-lg font-bold text-white mb-1">Confirmar Acción</h3>
            <p class="text-sm text-white/60">¿Estás seguro de que deseas cerrar esta orden?</p>
          </div>

          <div class="flex gap-3 pt-2">
            <button (click)="cancelConfirm()" class="flex-1 py-2.5 rounded border border-white/20 text-white/70 text-sm font-bold hover:bg-white/5 transition-colors uppercase tracking-widest">
              No, Cancelar
            </button>
            <button (click)="confirmCerrar()" class="flex-1 py-2.5 rounded bg-newera-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              Sí, Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="toastMessage" class="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div class="glass-panel bg-newera-profit/10 border border-newera-profit/30 px-4 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <svg class="w-5 h-5 text-newera-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-semibold text-white">{{ toastMessage }}</span>
        </div>
      </div>

    </div>
  `
})
export class ClientPositionsComponent implements OnInit {
  
  filter = signal<'ABIERTAS' | 'CERRADAS'>('ABIERTAS');
  posicionesAbiertas = signal<ApuestaCliente[]>([]);
  posicionesCerradas = signal<ApuestaCliente[]>([]);
  toastMessage: string | null = null;
  
  isConfirmOpen = false;
  selectedPosId: number | null = null;
  
  displayedPositions = computed(() => {
    const f = this.filter();
    const abiertas = this.posicionesAbiertas();
    const cerradas = this.posicionesCerradas();

    let all: ApuestaCliente[] = [];

    if (f === 'ABIERTAS') {
      all = [...abiertas];
    } else if (f === 'CERRADAS') {
      all = [...cerradas];
    }

    // Ordenar por fecha descendente
    return all.sort((a, b) => {
      const d1 = new Date(a.fechaCreacion || 0).getTime();
      const d2 = new Date(b.fechaCreacion || 0).getTime();
      return d2 - d1;
    });
  });

  constructor(
    private socketService: TradingSocketService,
    private apuestaService: ApuestaService,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarAbiertas();
  }

  cargarAbiertas() {
    const user = this.authService.currentUser();
    console.log('cargarAbiertas, user is:', user);
    if (!user) return;
    this.apuestaService.getApuestasByUsuario(user.id, 'ABIERTO').subscribe({
      next: (data) => {
        console.log('Posiciones ABIERTAS cargadas:', data);
        this.posicionesAbiertas.set(data || []);
      },
      error: (err) => console.error('Error fetching abiertas', err)
    });
  }

  setFilter(f: 'ABIERTAS' | 'CERRADAS') {
    this.filter.set(f);
    if (f === 'ABIERTAS') {
      this.cargarAbiertas();
    } else if (f === 'CERRADAS') {
      this.cargarCerradas();
    }
  }

  cargarCerradas() {
    const user = this.authService.currentUser();
    console.log('cargarCerradas, user is:', user);
    if (!user) return;
    this.apuestaService.getApuestasByUsuario(user.id, 'CERRADO').subscribe({
      next: (data) => {
        console.log('Posiciones CERRADAS cargadas:', data);
        this.posicionesCerradas.set(data || []);
      },
      error: (err) => console.error('Error fetching cerradas', err)
    });
  }

  requestCerrar(id: number) {
    this.selectedPosId = id;
    this.isConfirmOpen = true;
  }

  cancelConfirm() {
    this.isConfirmOpen = false;
    this.selectedPosId = null;
  }

  confirmCerrar() {
    if (this.selectedPosId !== null) {
      this.cerrar(this.selectedPosId);
    }
  }

  cerrar(id: number) {
    this.isConfirmOpen = false;
    this.selectedPosId = null;
    
    const pos = this.posicionesAbiertas().find(p => p.idApuestaCliente === id);
    const pnl = pos?.gananciaPerdida || 0;
    
    this.loadingService.show('candles', `Cerrando Posición ORD-${id}...`);

    this.apuestaService.cerrarPosicion(id, pnl).subscribe({
      next: () => {
        setTimeout(() => {
          this.loadingService.hide();
          this.showToast(`Posición ORD-${id} cerrada con éxito`);
          this.cargarAbiertas();
          this.cargarCerradas();
        }, 1500); // Simulando el tiempo de espera
      },
      error: (err: any) => {
        this.loadingService.hide();
        console.error("Error al cerrar posición", err);
      }
    });
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}
