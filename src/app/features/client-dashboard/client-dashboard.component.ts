import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingSocketService } from '../../core/services/trading-socket.service';
import { SidebarActivosComponent } from './components/sidebar-activos.component';
import { ChartTradingComponent } from './components/chart-trading.component';
import { OrderPanelComponent } from './components/order-panel.component';
import { PositionsTableComponent } from './components/positions-table.component';
import { TickHistoryTableComponent } from './components/tick-history-table.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    SidebarActivosComponent, 
    ChartTradingComponent, 
    OrderPanelComponent, 
    PositionsTableComponent,
    TickHistoryTableComponent
  ],
  template: `
    <div class="h-full w-full bg-newera-bg-dark text-newera-text-main flex flex-col overflow-hidden animate-in fade-in duration-300">
      <!-- Main Layout -->
      <div class="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden p-2 gap-2 custom-scrollbar">
        
        <!-- Left Sidebar (Markets) -->
        <app-sidebar-activos class="shrink-0"></app-sidebar-activos>

        <!-- Center Column (Chart & Positions/Ticks) -->
        <div class="flex-1 flex flex-col gap-2 min-w-0 min-h-[300px] lg:min-h-0 shrink-0 lg:shrink">
          <div class="flex-[3] min-h-[300px] lg:min-h-0">
            <app-chart-trading></app-chart-trading>
          </div>
          
          <!-- Se oculta en móvil, visible en Desktop -->
          <div class="hidden lg:flex flex-[2] flex-col lg:min-h-0 bg-[#0A0A0A] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative">
            <!-- Tabs Header -->
            <div class="flex border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <button (click)="activeTab = 'positions'" 
                      [class.border-newera-primary]="activeTab === 'positions'" 
                      [class.text-white]="activeTab === 'positions'" 
                      [class.bg-white_5]="activeTab === 'positions'"
                      class="flex-1 md:flex-none px-4 md:px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-newera-text-muted hover:text-white border-b-2 border-transparent transition-all flex items-center justify-center md:justify-start gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Posiciones
              </button>
              
              <button (click)="activeTab = 'ticks'" 
                      [class.border-newera-primary]="activeTab === 'ticks'" 
                      [class.text-white]="activeTab === 'ticks'"
                      [class.bg-white_5]="activeTab === 'ticks'"
                      class="flex-1 md:flex-none px-4 md:px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-newera-text-muted hover:text-white border-b-2 border-transparent transition-all flex items-center justify-center md:justify-start gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Historial Ticks
              </button>
            </div>
            
            <!-- Content -->
            <div class="flex-1 overflow-hidden relative">
              <app-positions-table *ngIf="activeTab === 'positions'" class="absolute inset-0"></app-positions-table>
              <app-tick-history-table *ngIf="activeTab === 'ticks'" class="absolute inset-0"></app-tick-history-table>
            </div>
          </div>
        </div>

        <!-- Right Sidebar (Order Panel) -->
        <app-order-panel id="order-panel" class="shrink-0"></app-order-panel>
        
      </div>
    </div>
  `,
  styles: [`
    .bg-white_5 { background-color: rgba(255,255,255,0.05); }
  `]
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  
  dashboard = computed(() => this.socketService.dashboardState());
  activeTab: 'positions' | 'ticks' = 'positions';

  constructor(private socketService: TradingSocketService) {}

  ngOnInit() {
    this.socketService.connectMarket();
  }

  ngOnDestroy() {
    this.socketService.disconnectMarket();
  }
}
