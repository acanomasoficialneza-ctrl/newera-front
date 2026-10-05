import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketDataService, PriceData } from '../../../core/services/market-data.service';

@Component({
  selector: 'app-sidebar-activos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel w-full lg:w-72 h-[350px] lg:h-full flex flex-col">
      <div class="p-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <h3 class="text-xs font-bold uppercase tracking-widest text-newera-text-muted flex items-center gap-2">
          <svg class="w-4 h-4 text-newera-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Mercados en Vivo
        </h3>
      </div>
      <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
        
        <!-- Accordion por Categoría -->
        <div *ngFor="let category of categories" class="mb-2">
          <!-- Accordion Header -->
          <button (click)="toggleCategory(category)" 
                  class="w-full flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:bg-white/5 transition-colors">
            <span class="font-bold text-sm text-white/90">{{ category }}</span>
            <svg class="w-4 h-4 text-white/50 transition-transform duration-300" 
                 [class.rotate-180]="expandedCategory() === category"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Accordion Body -->
          <div *ngIf="expandedCategory() === category" class="mt-1 space-y-1 overflow-hidden animate-fade-in-down">
            <div *ngFor="let price of getPricesByCategory(category)" 
                 (click)="selectAsset(price.simbolo)"
                 [class.bg-white_10]="selected() === price.simbolo"
                 [class.border-newera-primary]="selected() === price.simbolo"
                 class="flex justify-between items-center p-3 rounded-lg cursor-pointer border border-transparent hover:bg-white/5 transition-all group relative overflow-hidden pl-4">
              
              <!-- Selected Glow -->
              <div *ngIf="selected() === price.simbolo" class="absolute inset-0 bg-gradient-to-r from-newera-primary/10 to-transparent pointer-events-none"></div>
              <div *ngIf="selected() === price.simbolo" class="absolute left-0 top-0 bottom-0 w-1 bg-newera-primary shadow-[0_0_10px_#2563EB]"></div>

              <div class="flex items-center gap-3 z-10">
                <div>
                  <p class="font-bold text-sm text-white group-hover:text-newera-primary transition-colors leading-tight">{{ price.simbolo }}</p>
                </div>
              </div>
              
              <div class="text-right z-10 flex flex-col items-end gap-1.5">
                
                <!-- Recuadro de Venta / Compra -->
                <div class="flex items-center bg-black/40 border border-white/10 rounded overflow-hidden shadow-sm">
                  <!-- Venta (Bid) en Rojo -->
                  <div class="px-2 py-1 flex items-center gap-1 border-r border-white/10 bg-newera-loss/5" title="Venta (Bid)">
                     <span class="text-[8px] text-white/40 uppercase font-bold">V</span>
                     <span class="font-mono text-[10px] font-bold text-newera-loss">{{ (price.precioVenta || price.precioActual) | number:'1.2-6' }}</span>
                  </div>
                  <!-- Compra (Ask) en Verde -->
                  <div class="px-2 py-1 flex items-center gap-1 bg-newera-profit/5" title="Compra (Ask)">
                     <span class="text-[8px] text-white/40 uppercase font-bold">C</span>
                     <span class="font-mono text-[10px] font-bold text-newera-profit">{{ (price.precioCompra || price.precioActual) | number:'1.2-6' }}</span>
                  </div>
                </div>

                <!-- Variante -->
                <p class="font-mono text-[10px] font-bold flex items-center justify-end gap-1" 
                   [class.text-newera-profit]="price.variacionPorcentaje >= 0"
                   [class.text-newera-loss]="price.variacionPorcentaje < 0">
                   <span *ngIf="price.variacionPorcentaje >= 0">▲</span>
                   <span *ngIf="price.variacionPorcentaje < 0">▼</span>
                   {{ price.variacionPorcentaje > 0 ? '+' : '' }}{{ price.variacionPorcentaje }}%
                </p>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .bg-white_10 { background-color: rgba(255,255,255,0.08); }
    .animate-fade-in-down { animation: fadeInDown 0.3s ease-out; }
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SidebarActivosComponent {
  
  prices = computed(() => this.marketDataService.marketPrices());
  selected = computed(() => this.marketDataService.selectedAsset());
  
  categories = ['CRIPTO', 'FONDOS', 'DIVISA', 'MATERIAS', 'ACCIONES'];
  expandedCategory = signal<string>('CRIPTO');

  constructor(private marketDataService: MarketDataService) {}

  selectAsset(simbolo: string) {
    this.marketDataService.setSelectedAsset(simbolo);
  }

  toggleCategory(category: string) {
    if (this.expandedCategory() === category) {
      this.expandedCategory.set(''); // Collapse if already open
    } else {
      this.expandedCategory.set(category);
    }
  }

  getPricesByCategory(category: string): PriceData[] {
    return this.prices().filter(p => p.categoria === category);
  }
}
