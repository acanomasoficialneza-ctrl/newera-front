import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketDataService, PriceData } from '../../../core/services/market-data.service';
import { ApuestaService } from '../../../core/services/apuesta.service';
import { TradingSocketService } from '../../../core/services/trading-socket.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-order-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-newera-card relative overflow-hidden rounded-2xl">
      <!-- Gradient superior -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-newera-primary/50 to-newera-secondary/50"></div>

      <!-- Toast de Éxito -->
      <div *ngIf="mensajeExito" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div class="glass-panel bg-newera-profit/10 border-newera-profit/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] px-4 py-3 flex items-center gap-3 rounded-xl border backdrop-blur-md">
          <svg class="w-5 h-5 text-newera-profit shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-bold text-white">{{ mensajeExito }}</span>
        </div>
      </div>
      
      <!-- Header del Panel -->
      <div class="p-5 border-b border-white/5 relative z-10 flex justify-between items-center">
        <div>
          <h2 class="text-white font-bold text-lg tracking-wide uppercase">{{ selectedAsset() || 'SELECCIONA ACTIVO' }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span class="w-1.5 h-1.5 rounded-full" [ngClass]="isConnected() ? 'bg-newera-profit animate-pulse' : 'bg-newera-loss'"></span>
            <p class="text-[10px] text-white/50 tracking-wider font-mono">
              {{ isConnected() ? 'LIVE DATA' : 'OFFLINE' }}
            </p>
          </div>
        </div>
        <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] text-newera-primary">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </div>
      </div>

      <!-- Contenido scrolleable -->
      <div class="flex-1 p-5 overflow-y-auto space-y-6 flex flex-col relative z-10"
           [ngClass]="{'opacity-50 pointer-events-none blur-[1px]': !isConnected()}">
        
        <!-- Botones Compra / Venta -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button (click)="setOperacion('COMPRAR')"
                  class="relative overflow-hidden py-3 rounded-xl text-xs tracking-widest font-bold uppercase transition-all duration-300 group flex flex-col items-center justify-center gap-1"
                  [ngClass]="operacion() === 'COMPRAR' ? 'bg-newera-profit text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-white/50 hover:bg-white/10'">
            <span class="relative z-10 font-bold">COMPRAR (ASK)</span>
            <span class="relative z-10 text-[10px] font-mono opacity-80" *ngIf="currentAsk() > 0">$ {{ currentAsk() | number:'1.2-6' }}</span>
            <div *ngIf="operacion() === 'COMPRAR'" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
          </button>
          <button (click)="setOperacion('VENTA')"
                  class="relative overflow-hidden py-3 rounded-xl text-xs tracking-widest font-bold uppercase transition-all duration-300 group flex flex-col items-center justify-center gap-1"
                  [ngClass]="operacion() === 'VENTA' ? 'bg-newera-loss text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-white/50 hover:bg-white/10'">
            <span class="relative z-10 font-bold">VENDER (BID)</span>
            <span class="relative z-10 text-[10px] font-mono opacity-80" *ngIf="currentBid() > 0">$ {{ currentBid() | number:'1.2-6' }}</span>
            <div *ngIf="operacion() === 'VENTA'" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Precio Actual Destacado -->
          <div class="bg-black/30 border border-white/5 rounded-xl p-4 flex justify-between items-center relative overflow-hidden group hover:border-white/10 transition-colors">
            <div class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <p class="text-[10px] uppercase tracking-widest font-bold mb-1 text-white/40">Precio Actual</p>
              <p class="text-xl font-mono font-bold text-white tracking-tight flex items-center gap-1">
                <span class="text-white/30 text-sm">$</span>{{ currentPrice() | number:'1.2-6' }}
              </p>
            </div>
          </div>

          <!-- Selector de Unidades Mejorado -->
          <div>
            <p class="text-[10px] uppercase tracking-widest font-bold mb-2 text-white/60">Cantidad de Unidades</p>
            <div class="flex gap-2">
              <button (click)="cambiarUnidades(-1)" class="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white active:scale-95 touch-manipulation">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
              </button>
              <div class="flex-1 relative">
                <input type="number" inputmode="numeric" pattern="[0-9]*" [(ngModel)]="unidades" (ngModelChange)="recalcular()"
                       class="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-2 md:px-4 text-center font-mono text-lg font-bold text-white focus:outline-none focus:border-newera-primary/50 transition-colors touch-manipulation [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
              </div>
              <button (click)="cambiarUnidades(1)" class="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white active:scale-95 touch-manipulation">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>

          <!-- Margen Requerido (Calculado) -->
          <div class="bg-gradient-to-r from-white/5 to-transparent border rounded-xl p-4 flex justify-between items-center transition-colors"
               [ngClass]="hasInsufficientMargin ? 'border-newera-loss/50' : 'border-white/10'">
            <div>
              <p class="text-[10px] uppercase tracking-widest font-bold mb-1 transition-colors"
                 [ngClass]="hasInsufficientMargin ? 'text-newera-loss' : 'text-white/40'">Margen Requerido</p>
              <p class="text-sm font-mono font-bold transition-colors"
                 [ngClass]="hasInsufficientMargin ? 'text-newera-loss' : 'text-white'">
                <span [ngClass]="hasInsufficientMargin ? 'text-newera-loss/50' : 'text-white/30'">$</span>{{ margen | number:'1.2-2' }}
              </p>
              <p *ngIf="hasInsufficientMargin" class="text-[9px] text-newera-loss mt-1 font-bold animate-pulse">MARGEN LIBRE INSUFICIENTE</p>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                 [ngClass]="hasInsufficientMargin ? 'bg-newera-loss/10 text-newera-loss' : 'bg-white/5 text-white/30'">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path *ngIf="!hasInsufficientMargin" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <path *ngIf="hasInsufficientMargin" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>

        </div>

        <!-- Confirmación -->
        <label class="flex items-center gap-3 mt-auto pt-4 cursor-pointer group">
          <div class="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 group-hover:border-white/50 transition-colors"
               [ngClass]="{'bg-newera-primary border-newera-primary': confirmado, 'bg-black/50': !confirmado}">
            <svg *ngIf="confirmado" class="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            <input type="checkbox" [(ngModel)]="confirmado" class="absolute opacity-0 w-full h-full cursor-pointer">
          </div>
          <span class="text-xs text-white/70 group-hover:text-white transition-colors select-none font-medium">Confirmo la operación</span>
        </label>

      </div>

      <!-- Footer Buttons -->
      <div class="p-5 border-t border-white/5 bg-black/40">
        <button (click)="ejecutarOrden()" [disabled]="!confirmado || isProcessing || !isConnected() || hasInsufficientMargin || currentPrice() <= 0"
                class="w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                [ngClass]="operacion() === 'COMPRAR' ? 'bg-newera-profit text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-newera-loss text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'">
          <span *ngIf="isProcessing" class="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin"></span>
          {{ isProcessing ? 'Procesando...' : (!isConnected() ? 'Desconectado' : (operacion() === 'COMPRAR' ? 'Confirmar Compra' : 'Confirmar Venta')) }}
        </button>
      </div>
      
      <div *ngIf="mensajeError" class="mx-5 mb-5 p-3 bg-newera-loss/10 border border-newera-loss/30 rounded-xl text-newera-loss text-xs text-center font-bold animate-pulse">
        {{ mensajeError }}
      </div>

      <!-- Overlay de desconexión -->
      <div *ngIf="!isConnected()" class="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl p-6 text-center animate-in fade-in">
        <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <h3 class="text-white font-bold text-lg mb-2">Conexión Perdida</h3>
        <p class="text-newera-text-muted text-xs leading-relaxed">No podemos validar tu margen libre. El panel de trading está bloqueado por seguridad hasta recuperar conexión.</p>
      </div>
    </div>
  `
})
export class OrderPanelComponent {
  
  selectedAsset = computed(() => this.marketDataService.selectedAsset());
  operacion = signal<string>('COMPRAR');
  
  // Precio a la compra (ASK)
  currentAsk = computed(() => {
    const prices = this.marketDataService.marketPrices();
    const target = prices.find((p: PriceData) => p.simbolo === this.selectedAsset());
    return target ? (target.precioCompra || target.precioActual) : 0;
  });

  // Precio a la venta (BID)
  currentBid = computed(() => {
    const prices = this.marketDataService.marketPrices();
    const target = prices.find((p: PriceData) => p.simbolo === this.selectedAsset());
    return target ? (target.precioVenta || target.precioActual) : 0;
  });

  // El precio actual se basa en la operacin seleccionada
  currentPrice = computed(() => {
    return this.operacion() === 'COMPRAR' ? this.currentAsk() : this.currentBid();
  });
  
  noCliente = computed(() => this.authService.currentUser()?.id || 0);
  
  // Balance real desde el SSE del cliente
  balanceActual = computed(() => {
    const balance = this.tradingSocketService.balanceState();
    return balance ? balance.margenLibre : 0;
  });

  monto: number = 0; 
  unidades: number = 0;
  margen: number = 0;
  confirmado: boolean = false;
  
  isProcessing: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  
  isConnected = computed(() => this.tradingSocketService.isBalanceConnected());

  get hasInsufficientMargin(): boolean {
    return this.margen > this.balanceActual();
  }

  constructor(
    private marketDataService: MarketDataService,
    private apuestaService: ApuestaService,
    private tradingSocketService: TradingSocketService,
    private authService: AuthService
  ) {
    effect(() => {
      // Suscripcin reactiva
      const price = this.currentPrice();
      // Mantenemos el monto input sincronizado con el balance real 
      this.monto = this.balanceActual();
      this.recalcular(); 
    });
  }

  setOperacion(op: string) {
    this.operacion.set(op);
    this.recalcular();
  }

  cambiarUnidades(delta: number) {
    this.unidades += delta;
    if (this.unidades < 0) this.unidades = 0;
    this.recalcular();
  }

  recalcular() {
    this.margen = this.unidades * this.currentPrice();
  }

  ejecutarOrden() {
    if (this.unidades <= 0) {
      this.mensajeError = "Debes ingresar unidades vǭlidas";
      return;
    }
    
    this.isProcessing = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const targetAsset = this.marketDataService.marketPrices().find((p: PriceData) => p.simbolo === this.selectedAsset());
    const categoriaStr = targetAsset ? targetAsset.categoria : 'CRIPTO';

    const payload = {
      tipoCompra: this.operacion(),
      compra: this.selectedAsset(),
      categoria: categoriaStr,
      valorUnidad: this.currentPrice(),
      montoApuesta: this.margen, // El monto real arriesgado es el margen requerido
      unidades: this.unidades, 
      margen: this.margen,
      usuario: {
        idUsuario: this.noCliente()
      }
    };

    this.apuestaService.abrirPosicion(payload).subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        this.confirmado = false;
        this.unidades = 0;
        this.recalcular();
        
        this.mensajeExito = `¡Orden de ${this.operacion()} abierta exitosamente!`;
        setTimeout(() => this.mensajeExito = '', 4000);
        
        // Notificar que se actualicen las posiciones abiertas en la tabla
        this.apuestaService.posicionesActualizadas.next();
      },
      error: (err: any) => {
        this.isProcessing = false;
        this.mensajeError = err.error?.message || "Error al abrir posición";
      }
    });
  }
}
