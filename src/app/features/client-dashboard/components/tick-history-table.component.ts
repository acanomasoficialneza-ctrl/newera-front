import { Component, effect, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MarketDataService } from '../../../core/services/market-data.service';

interface TickData {
  time: Date;
  price: number;
  bid: number; // Precio de Venta
  ask: number; // Precio de Compra
  isUp: boolean;
}

@Component({
  selector: 'app-tick-history-table',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  template: `
    <div class="w-full h-full flex flex-col p-4 overflow-hidden relative">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-sm font-semibold uppercase tracking-widest text-newera-text-muted flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-newera-profit opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-newera-profit"></span>
          </span>
          Mercado en Vivo: <span class="text-white font-bold">{{ selectedAsset() }}</span>
        </h3>
      </div>
      
      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-sm">
          <thead class="text-[10px] text-newera-text-muted uppercase bg-white/5 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th class="px-4 py-3 rounded-tl-lg whitespace-nowrap">Hora</th>
              <th class="px-4 py-3 whitespace-nowrap">Precio Actual</th>
              <th class="px-4 py-3 whitespace-nowrap text-newera-loss text-right">Vender (Bid)</th>
              <th class="px-4 py-3 rounded-tr-lg whitespace-nowrap text-newera-profit text-right">Comprar (Ask)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tick of ticks(); let i = index" 
                class="border-b border-white/5 transition-all duration-300"
                [ngClass]="{'bg-white/10': i === 0, 'hover:bg-white/5': true}">
              
              <td class="px-4 py-3 font-mono text-xs text-white/70">
                {{ tick.time | date:'HH:mm:ss' }}
              </td>
              
              <td class="px-4 py-3 font-mono font-bold text-sm"
                  [class.text-newera-profit]="tick.isUp"
                  [class.text-newera-loss]="!tick.isUp">
                  {{ tick.price | number:'1.2-2' }}
                  <span class="text-[10px] ml-1">{{ tick.isUp ? '▲' : '▼' }}</span>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-right text-newera-loss font-bold">
                {{ tick.bid | number:'1.2-6' }}
              </td>
              
              <td class="px-4 py-3 font-mono text-xs text-right text-newera-profit font-bold">
                {{ tick.ask | number:'1.2-6' }}
              </td>
              
            </tr>
            <tr *ngIf="ticks().length === 0">
              <td colspan="4" class="text-center py-8 text-newera-text-muted text-xs">
                Esperando datos del mercado para {{ selectedAsset() }}...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Fondo difuminado abajo para efecto visual -->
      <div class="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#111111] to-transparent pointer-events-none"></div>
    </div>
  `
})
export class TickHistoryTableComponent {
  
  selectedAsset = computed(() => this.marketDataService.selectedAsset());
  ticks = signal<TickData[]>([]);
  
  private currentAsset = '';

  constructor(private marketDataService: MarketDataService) {
    effect(() => {
      const prices = this.marketDataService.marketPrices();
      const currentSelected = this.selectedAsset();

      // Si cambia el activo, limpiar el historial
      if (this.currentAsset !== currentSelected) {
        this.ticks.set([]);
        this.currentAsset = currentSelected;
      }

      if (prices && prices.length > 0) {
        const targetPrice = prices.find(p => p.simbolo === currentSelected);
        if (targetPrice) {
          const price = targetPrice.precioActual;
          const isUp = targetPrice.isUp;
          const bid = targetPrice.precioVenta || price;
          const ask = targetPrice.precioCompra || price;

          const newTick: TickData = {
            time: new Date(targetPrice.timestamp),
            price,
            bid,
            ask,
            isUp
          };

          this.ticks.update(currentTicks => {
            // Evitar duplicados si es el mismo timestamp exacto
            if (currentTicks.length > 0 && currentTicks[0].time.getTime() === newTick.time.getTime()) {
                return currentTicks;
            }
            const newArray = [newTick, ...currentTicks];
            if (newArray.length > 30) {
              newArray.pop();
            }
            return newArray;
          });
        }
      }
    }, { allowSignalWrites: true });
  }
}
