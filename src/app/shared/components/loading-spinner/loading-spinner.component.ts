import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.isOpen()" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-newera-bg-dark/90 backdrop-blur-md transition-all duration-300 animate-in fade-in">
        
      <!-- OPCIÓN 1: BITCOIN GIRANDO -->
      <div *ngIf="loadingService.type() === 'bitcoin'" class="relative w-32 h-32 flex items-center justify-center perspective-[1000px]">
        <div class="absolute inset-0 bg-newera-primary/30 rounded-full blur-[40px] animate-pulse"></div>
        <div class="relative w-24 h-24 bg-gradient-to-tr from-[#f7931a] to-[#ffba4d] rounded-full shadow-[0_0_30px_rgba(247,147,26,0.6)] flex items-center justify-center border-4 border-[#f7931a]/50 animate-[spin_3s_linear_infinite] transform-gpu preserve-3d">
          <svg class="w-12 h-12 text-white/90 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 11.011c1.554-.378 2.378-1.488 2.012-3.085-.386-1.688-1.89-2.073-4.048-1.579l-.794-3.48-1.597.364.776 3.402c-.416.096-.84.202-1.272.316L8.3 3.513l-1.597.364.793 3.473c-.347.073-.687.151-1.016.233L4 8.16l.893 2.18s1.082-.298 1.06-.242c.59-.136.696.111.821.328l1.455 6.386c-.033.053-.133.136-.341.183.023.056-1.06.242-1.06.242l-.658 2.658 2.483-.566c.433-.102.857-.209 1.276-.309l.805 3.528 1.598-.364-.783-3.435c.44-.093.864-.19 1.276-.29l.784 3.44 1.597-.364-.81-3.551c2.617-.417 4.296-1.276 4.79-3.238.397-1.574-.112-2.487-1.168-3.088zm-2.404 4.542c-.63 2.76-4.887 1.282-6.262 1.595l1.096-4.805c1.374-.313 5.82 1.066 5.166 3.21zm.557-4.606c-.571 2.502-4.148 1.222-5.305 1.486l.995-4.364c1.157-.264 4.897.94 4.31 2.878z" />
          </svg>
        </div>
      </div>

      <!-- OPCIÓN 2: VELAS JAPONESAS (TRADING) -->
      <div *ngIf="loadingService.type() === 'candles'" class="relative w-32 h-32 flex items-end justify-center gap-2 pb-6">
        <div class="absolute inset-0 bg-newera-profit/10 rounded-full blur-[40px] animate-pulse"></div>
        
        <!-- Vela 1 -->
        <div class="relative w-4 h-12 bg-newera-profit rounded-sm animate-[bounce_1.5s_infinite_ease-in-out]">
          <div class="absolute -top-3 left-1/2 w-0.5 h-16 bg-newera-profit -translate-x-1/2 opacity-60"></div>
        </div>
        <!-- Vela 2 -->
        <div class="relative w-4 h-6 bg-newera-loss rounded-sm animate-[bounce_1.5s_infinite_ease-in-out] delay-150">
          <div class="absolute -top-4 left-1/2 w-0.5 h-14 bg-newera-loss -translate-x-1/2 opacity-60"></div>
        </div>
        <!-- Vela 3 -->
        <div class="relative w-4 h-16 bg-newera-profit rounded-sm animate-[bounce_1.5s_infinite_ease-in-out] delay-300">
          <div class="absolute -top-2 left-1/2 w-0.5 h-20 bg-newera-profit -translate-x-1/2 opacity-60"></div>
        </div>
      </div>

      <!-- OPCIÓN 3: ANILLO RADAR INSTITUCIONAL -->
      <div *ngIf="loadingService.type() === 'radar'" class="relative w-32 h-32 flex items-center justify-center">
        <div class="absolute w-24 h-24 border-2 border-newera-primary/20 rounded-full"></div>
        <div class="absolute w-24 h-24 border-t-2 border-l-2 border-newera-primary rounded-full animate-[spin_1s_linear_infinite]"></div>
        <div class="absolute w-16 h-16 border-2 border-white/10 rounded-full"></div>
        <div class="absolute w-16 h-16 border-b-2 border-r-2 border-white rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
        <div class="w-8 h-8 bg-newera-primary/20 rounded-full animate-pulse flex items-center justify-center">
          <div class="w-2 h-2 bg-newera-primary rounded-full shadow-[0_0_10px_#2563eb]"></div>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center">
        <h2 class="text-white text-xl font-bold tracking-widest uppercase mb-2">{{ loadingService.message() }}</h2>
        <div class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-newera-primary rounded-full animate-bounce" style="animation-delay: 0s"></span>
          <span class="w-1.5 h-1.5 bg-newera-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
          <span class="w-1.5 h-1.5 bg-newera-primary rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
        </div>
      </div>
    </div>
  `
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}
