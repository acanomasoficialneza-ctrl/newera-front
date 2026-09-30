import { Component, computed, OnInit, signal, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingSocketService } from '../../../core/services/trading-socket.service';
import { ApuestaService } from '../../../core/services/apuesta.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApuestaCliente } from '../../../core/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-positions-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex flex-col p-4 overflow-hidden">
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-wide">Posiciones Abiertas</h2>
          <p class="text-xs text-white/50">Resumen de tus operaciones de trading activas.</p>
        </div>
      </div>
      
      <div class="flex-1 overflow-auto custom-scrollbar">
        <!-- Vista Desktop (Tabla) -->
        <table class="w-full text-left text-sm hidden md:table">
          <thead class="text-[10px] text-white/40 uppercase tracking-widest bg-white/5">
            <tr>
              <th class="px-4 py-4 rounded-tl-lg whitespace-nowrap">ID Orden</th>
              <th class="px-4 py-4 whitespace-nowrap">Fecha Apertura</th>
              <th class="px-4 py-4 whitespace-nowrap">Activo</th>
              <th class="px-4 py-4 whitespace-nowrap">Tipo</th>
              <th class="px-4 py-4 whitespace-nowrap text-right">Inversión</th>
              <th class="px-4 py-4 whitespace-nowrap text-right">P&L Actual</th>
              <th class="px-4 py-4 whitespace-nowrap text-center rounded-tr-lg">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pos of displayedPositions()" class="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <!-- ID ORDEN -->
              <td class="px-4 py-4 font-mono text-[11px] text-white/50">ORD-{{ pos.idApuestaCliente || '0000' }}</td>
              
              <!-- FECHA APERTURA -->
              <td class="px-4 py-4 text-[11px] text-white/70">{{ pos.fechaCreacion | date:'dd MMM yyyy, HH:mm' }}</td>
              
              <!-- ACTIVO -->
              <td class="px-4 py-4 font-bold text-white text-xs">{{ pos.compra }}</td>
              
              <!-- TIPO -->
              <td class="px-4 py-4">
                <span class="px-2 py-1 rounded text-[10px] font-bold tracking-wider border uppercase"
                      [ngClass]="pos.tipoCompra === 'COMPRA' || pos.tipoCompra === 'COMPRAR' ? 'bg-newera-profit/10 text-newera-profit border-newera-profit/20' : 'bg-newera-loss/10 text-newera-loss border-newera-loss/20'">
                  {{ pos.tipoCompra }}
                </span>
              </td>
              
              <!-- INVERSION -->
              <td class="px-4 py-4 font-mono text-xs text-right text-white/80">
                <span>$</span>{{ pos.montoApuesta | number:'1.2-2' }}
              </td>

              <!-- P&L FINAL -->
              <td class="px-4 py-4 font-mono text-xs font-bold text-right"
                  [class.text-newera-profit]="pos.gananciaPerdida >= 0"
                  [class.text-newera-loss]="pos.gananciaPerdida < 0">
                  {{ pos.gananciaPerdida >= 0 ? '+$' : '-$' }}{{ (pos.gananciaPerdida >= 0 ? pos.gananciaPerdida : (pos.gananciaPerdida * -1)) | number:'1.2-2' }}
              </td>
              
              <!-- ESTADO / ACCIÓN -->
              <td class="px-4 py-4 text-center flex justify-center">
                <!-- Botón de Cerrar (Normal) -->
                <button (click)="requestConfirm(pos)" 
                        class="text-[10px] font-bold tracking-wider uppercase border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  CERRAR
                </button>
              </td>
            </tr>
            <tr *ngIf="displayedPositions().length === 0">
              <td colspan="7" class="text-center py-12 text-white/40 text-sm">No hay posiciones activas</td>
            </tr>
          </tbody>
        </table>

        <!-- Vista Móvil (Tarjetas) -->
        <div class="md:hidden flex flex-col gap-4 pb-20 pt-2">
          <div *ngFor="let pos of displayedPositions()" class="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-white font-bold text-sm block mb-1">{{ pos.compra }} <span class="text-white/40 text-[10px] ml-1">ORD-{{ pos.idApuestaCliente }}</span></span>
                <span class="text-[10px] text-white/50">{{ pos.fechaCreacion | date:'dd MMM yyyy, HH:mm' }}</span>
              </div>
              <span class="px-2 py-1 rounded text-[9px] font-bold tracking-wider border uppercase"
                    [ngClass]="pos.tipoCompra === 'COMPRA' || pos.tipoCompra === 'COMPRAR' ? 'bg-newera-profit/10 text-newera-profit border-newera-profit/20' : 'bg-newera-loss/10 text-newera-loss border-newera-loss/20'">
                {{ pos.tipoCompra }}
              </span>
            </div>

            <div class="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
              <div>
                <span class="text-[9px] text-white/40 uppercase tracking-widest block mb-1">Inversión</span>
                <span class="font-mono text-white text-xs"><span>$</span>{{ pos.montoApuesta | number:'1.2-2' }}</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] text-white/40 uppercase tracking-widest block mb-1">P&L Actual</span>
                <span class="font-mono font-bold text-sm" [ngClass]="pos.gananciaPerdida >= 0 ? 'text-newera-profit' : 'text-newera-loss'">
                  {{ pos.gananciaPerdida >= 0 ? '+$' : '-$' }}{{ (pos.gananciaPerdida >= 0 ? pos.gananciaPerdida : (pos.gananciaPerdida * -1)) | number:'1.2-2' }}
                </span>
              </div>
            </div>

            <div class="border-t border-white/5 pt-3 mt-1 flex justify-center">
              <button (click)="requestConfirm(pos)" 
                      class="text-[10px] font-bold tracking-wider uppercase border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500 hover:text-white px-8 py-2 rounded-full transition-all w-full flex justify-center items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> CERRAR ORDEN
              </button>
            </div>
          </div>
          
          <div *ngIf="displayedPositions().length === 0" class="text-center py-8 text-white/40 text-sm border border-white/5 rounded-xl bg-black/20">
            No hay posiciones activas
          </div>
        </div>

      </div>
      
      <!-- MODAL EMERGENTE DE CONFIRMACIÓN ESTÁNDAR -->
      <div *ngIf="isConfirmOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-[#111111]/90 border border-white/10 p-6 rounded-2xl w-full max-w-sm flex flex-col items-center">
          <h3 class="text-white font-bold text-lg mb-2">Cerrar Posición</h3>
          <p class="text-white/50 text-xs mb-6 text-center">¿Estás seguro de que deseas cerrar la orden de <span class="font-bold text-white">{{ positionToClose()?.compra }}</span>?</p>
          
          <div class="w-full flex gap-3">
            <button (click)="cancelConfirm()" class="flex-1 py-3 rounded-xl border border-white/10 text-white/70 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button (click)="confirmClose()" class="flex-1 py-3 rounded-xl bg-newera-loss text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              Sí, Cerrar
            </button>
          </div>
        </div>
      </div>
      <!-- FIN MODAL -->

      <!-- TOAST NOTIFICACIÓN -->
      <div *ngIf="toastMessage" class="fixed top-20 right-4 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-3 rounded-xl z-50 animate-in slide-in-from-top-2 flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <svg class="w-5 h-5 text-newera-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm font-bold tracking-wide">{{ toastMessage }}</span>
      </div>

    </div>
  `
})
export class PositionsTableComponent implements OnInit, OnDestroy {
  
  // Posiciones abiertas cargadas por petición normal
  posicionesAbiertas = signal<ApuestaCliente[]>([]);
  positionToClose = signal<ApuestaCliente | null>(null);
  
  isConfirmOpen = false;
  toastMessage: string | null = null;
  
  private updateSub?: Subscription;

  // Lista ordenada a mostrar en la tabla
  displayedPositions = computed(() => {
    const abiertas = [...this.posicionesAbiertas()];

    // Ordenar por fecha descendente
    return abiertas.sort((a, b) => {
      const d1 = new Date(a.fechaCreacion || 0).getTime();
      const d2 = new Date(b.fechaCreacion || 0).getTime();
      return d2 - d1;
    });
  });



  constructor(
    private socketService: TradingSocketService,
    private apuestaService: ApuestaService,
    private authService: AuthService
  ) {
    // Escuchar actualizaciones en vivo desde el socket
    effect(() => {
      const state = this.socketService.positionsState();
      if (state && state.length > 0) {
        // Optimización Visor: Cruce de IDs para actualizar SOLO el PnL
        this.posicionesAbiertas.update(actuales => {
          return actuales.map(pos => {
            const update = state.find(s => s.id === pos.idApuestaCliente);
            if (update) {
              return { ...pos, gananciaPerdida: update.pnl };
            }
            return pos;
          });
        });
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.cargarPosiciones();
    // Suscribirse al evento para recargar si se abre una posición desde el panel
    this.updateSub = this.apuestaService.posicionesActualizadas.subscribe(() => {
      this.cargarPosiciones();
    });
    
    // Conectar al socket de posiciones (FASE 3)
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.socketService.connectPositions(userId);
    }
  }

  ngOnDestroy() {
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
    this.socketService.disconnectPositions();
  }

  cargarPosiciones() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.apuestaService.getApuestasByUsuario(userId, 'ABIERTO').subscribe({
        next: (data) => this.posicionesAbiertas.set(data),
        error: (err) => console.error('Error cargando posiciones', err)
      });
    }
  }

  requestConfirm(pos: ApuestaCliente) {
    this.positionToClose.set(pos);
    this.isConfirmOpen = true;
  }

  cancelConfirm() {
    this.isConfirmOpen = false;
    this.positionToClose.set(null);
  }

  confirmClose() {
    const pos = this.positionToClose();
    if (pos && pos.idApuestaCliente) {
      this.cerrar(pos.idApuestaCliente);
    }
  }

  cerrar(id: number) {
    this.isConfirmOpen = false;
    this.positionToClose.set(null);
    this.apuestaService.cerrarPosicion(id).subscribe({
      next: () => {
        this.showToast('Posición cerrada correctamente');
        this.cargarPosiciones();
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al cerrar posición');
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
