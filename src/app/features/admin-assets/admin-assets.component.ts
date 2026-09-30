import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300">
      
      <!-- Header Section -->
      <div class="flex items-end justify-between border-b border-white/10 pb-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-white mb-2">Gestión de Activos</h1>
          <p class="text-newera-text-muted text-sm">Habilita mercados y controla el riesgo de apalancamiento global.</p>
        </div>
        
        <button class="bg-newera-primary text-black px-6 py-2 rounded font-bold uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all">
          + Nuevo Activo
        </button>
      </div>

      <!-- Assets Table -->
      <div class="glass-panel flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto flex-1">          <!-- Vista Desktop (Tabla) -->
          <table class="w-full text-left text-sm whitespace-nowrap hidden md:table">
            <thead class="text-xs text-newera-text-muted uppercase bg-black/40 sticky top-0 backdrop-blur-md border-b border-white/10 z-10">
              <tr>
                <th class="px-6 py-4 font-semibold hidden lg:table-cell">ID Activo</th>
                <th class="px-6 py-4 font-semibold">Símbolo (Nombre)</th>
                <th class="px-6 py-4 font-semibold hidden md:table-cell">Categoría</th>
                <th class="px-6 py-4 font-semibold text-center">Spread (%)</th>
                <th class="px-6 py-4 font-semibold text-center">Apalancamiento Max</th>
                <th class="px-6 py-4 font-semibold text-center">Estado Mercado</th>
                <th class="px-6 py-4 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let asset of assets" class="hover:bg-white/5 transition-colors group">
                <td class="px-6 py-4 font-mono text-xs text-white/50 hidden lg:table-cell">
                  {{ asset.id }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-xs text-white uppercase">
                      {{ asset.symbol.substring(0,2) }}
                    </div>
                    <div class="flex flex-col">
                      <span class="text-white font-bold">{{ asset.symbol }}</span>
                      <span class="text-[10px] text-newera-text-muted">{{ asset.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 hidden md:table-cell">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/70">
                    {{ asset.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <input type="number" [(ngModel)]="asset.spread" class="w-16 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs text-center focus:outline-none focus:border-newera-primary transition-colors">
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex flex-wrap gap-0.5 bg-black/40 border border-white/10 rounded-lg p-0.5 justify-center min-w-[150px]">
                    <button (click)="asset.maxLeverage = 1" [ngClass]="asset.maxLeverage === 1 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="px-1.5 py-1 rounded text-[9px] font-bold uppercase transition-all">x1</button>
                    <button (click)="asset.maxLeverage = 10" [ngClass]="asset.maxLeverage === 10 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="px-1.5 py-1 rounded text-[9px] font-bold uppercase transition-all">x10</button>
                    <button (click)="asset.maxLeverage = 50" [ngClass]="asset.maxLeverage === 50 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="px-1.5 py-1 rounded text-[9px] font-bold uppercase transition-all">x50</button>
                    <button (click)="asset.maxLeverage = 100" [ngClass]="asset.maxLeverage === 100 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="px-1.5 py-1 rounded text-[9px] font-bold uppercase transition-all">x100</button>
                    <button (click)="asset.maxLeverage = 500" [ngClass]="asset.maxLeverage === 500 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="px-1.5 py-1 rounded text-[9px] font-bold uppercase transition-all">x500</button>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <button (click)="toggleStatus(asset)" 
                          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                          [ngClass]="asset.isActive ? 'bg-green-500' : 'bg-white/20'">
                    <span class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
                          [ngClass]="asset.isActive ? 'translate-x-5' : 'translate-x-1'"></span>
                  </button>
                  <span class="ml-2 text-[10px] font-bold uppercase" [ngClass]="asset.isActive ? 'text-green-400' : 'text-white/30'">
                    {{ asset.isActive ? 'Abierto' : 'Cerrado' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="text-newera-text-muted hover:text-newera-primary transition-colors p-2 rounded hover:bg-newera-primary/10">
                    Guardar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Vista Móvil (Tarjetas) -->
          <div class="md:hidden flex flex-col gap-4 p-4 pb-20 overflow-y-auto">
            <div *ngFor="let asset of assets" class="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
              
              <!-- Header -->
              <div class="flex justify-between items-center border-b border-white/5 pb-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-xs text-white uppercase">
                    {{ asset.symbol.substring(0,2) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-white font-bold">{{ asset.symbol }}</span>
                    <span class="text-[10px] text-newera-text-muted">{{ asset.name }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-bold uppercase" [ngClass]="asset.isActive ? 'text-green-400' : 'text-white/30'">
                    {{ asset.isActive ? 'Abierto' : 'Cerrado' }}
                  </span>
                  <button (click)="toggleStatus(asset)" 
                          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                          [ngClass]="asset.isActive ? 'bg-green-500' : 'bg-white/20'">
                    <span class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
                          [ngClass]="asset.isActive ? 'translate-x-5' : 'translate-x-1'"></span>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[9px] text-newera-text-muted uppercase tracking-wider block mb-1">Spread (%)</label>
                  <input type="number" [(ngModel)]="asset.spread" class="w-full bg-black/50 border border-white/10 rounded px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-newera-primary transition-colors">
                </div>
                <div>
                  <label class="text-[9px] text-newera-text-muted uppercase tracking-wider block mb-1">Categoría</label>
                  <span class="inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/70 w-full text-center">
                    {{ asset.category }}
                  </span>
                </div>
              </div>

              <!-- Apalancamiento -->
              <div>
                <label class="text-[9px] text-newera-text-muted uppercase tracking-wider block mb-1 text-center">Apalancamiento Max</label>
                <div class="flex flex-wrap gap-1 bg-black/40 border border-white/10 rounded-lg p-1 w-full">
                  <button (click)="asset.maxLeverage = 1" [ngClass]="asset.maxLeverage === 1 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all">x1</button>
                  <button (click)="asset.maxLeverage = 10" [ngClass]="asset.maxLeverage === 10 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all">x10</button>
                  <button (click)="asset.maxLeverage = 50" [ngClass]="asset.maxLeverage === 50 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all">x50</button>
                  <button (click)="asset.maxLeverage = 100" [ngClass]="asset.maxLeverage === 100 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all">x100</button>
                  <button (click)="asset.maxLeverage = 500" [ngClass]="asset.maxLeverage === 500 ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white'" class="flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all">x500</button>
                </div>
              </div>

              <button class="w-full mt-2 py-2 rounded bg-white/5 text-white/70 hover:bg-newera-primary hover:text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/10 hover:border-newera-primary">
                Guardar Cambios
              </button>

            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminAssetsComponent {
  
  assets = [
    { id: 1, symbol: 'BTC/USD', name: 'Bitcoin', category: 'Criptos', spread: 2.5, maxLeverage: 100, isActive: true },
    { id: 2, symbol: 'ETH/USD', name: 'Ethereum', category: 'Criptos', spread: 1.8, maxLeverage: 50, isActive: true },
    { id: 3, symbol: 'EUR/USD', name: 'Euro vs Dólar', category: 'Forex', spread: 0.8, maxLeverage: 500, isActive: true },
    { id: 4, symbol: 'AAPL', name: 'Apple Inc.', category: 'Acciones', spread: 1.2, maxLeverage: 10, isActive: false },
    { id: 5, symbol: 'XAU/USD', name: 'Oro (Gold)', category: 'Materias Primas', spread: 3.0, maxLeverage: 50, isActive: true },
  ];

  toggleStatus(asset: any) {
    asset.isActive = !asset.isActive;
  }
}
