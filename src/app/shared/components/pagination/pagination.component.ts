import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="totalElements > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 px-2 border-t border-white/10 text-xs text-white/60">
      
      <!-- Contador de registros -->
      <div class="font-mono text-[11px] text-white/50 text-center sm:text-left">
        Mostrando <span class="text-white font-bold">{{ startRecord }}</span> - <span class="text-white font-bold">{{ endRecord }}</span> de <span class="text-newera-primary font-bold">{{ totalElements }}</span> registros
      </div>

      <!-- Controles de Navegación -->
      <div class="flex items-center gap-1.5 select-none">
        
        <!-- Botón Primera Página -->
        <button type="button" 
                (click)="goToPage(0)" 
                [disabled]="currentPage === 0"
                class="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Primera página">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <!-- Botón Anterior -->
        <button type="button" 
                (click)="goToPage(currentPage - 1)" 
                [disabled]="currentPage === 0"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors font-semibold text-[11px]">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="hidden sm:inline">Anterior</span>
        </button>

        <!-- Indicador de Página Actual -->
        <div class="px-3 py-1 rounded-lg bg-newera-primary/10 border border-newera-primary/30 text-newera-primary font-mono font-bold text-xs tracking-wide">
          {{ currentPage + 1 }} / {{ totalPages || 1 }}
        </div>

        <!-- Botón Siguiente -->
        <button type="button" 
                (click)="goToPage(currentPage + 1)" 
                [disabled]="currentPage >= totalPages - 1"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors font-semibold text-[11px]">
          <span class="hidden sm:inline">Siguiente</span>
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Botón Última Página -->
        <button type="button" 
                (click)="goToPage(totalPages - 1)" 
                [disabled]="currentPage >= totalPages - 1"
                class="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Última página">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

      </div>

    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage: number = 0; // Base 0
  @Input() totalPages: number = 1;
  @Input() totalElements: number = 0;
  @Input() pageSize: number = 10;

  @Output() pageChange = new EventEmitter<number>();

  get startRecord(): number {
    if (this.totalElements === 0) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  get endRecord(): number {
    const end = (this.currentPage + 1) * this.pageSize;
    return end > this.totalElements ? this.totalElements : end;
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
