import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

export interface CajaTransaction {
  id: string;
  date: Date;
  type: string;
  method: string;
  amount: number;
  status: string;
  note: string;
}

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full p-6 flex flex-col gap-6 animate-in fade-in duration-300">
      
      <!-- Header Section -->
      <!-- Header -->
      <div class="flex items-end justify-between border-b border-white/10 pb-4 mb-6 z-10">
        <div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight mb-2">Historial de Caja</h1>
          <p class="text-newera-text-muted text-sm">Resumen de todas tus transacciones de depósito y retiro.</p>
        </div>
      </div>

      <!-- Table Section -->
      <div class="glass-panel flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto flex-1">
          <!-- Vista Desktop (Tabla) -->
          <table class="w-full text-left text-sm whitespace-nowrap hidden md:table">
            <thead class="text-xs text-newera-text-muted uppercase bg-black/40 sticky top-0 backdrop-blur-md border-b border-white/10 z-10">
              <tr>
                <th class="px-6 py-4 font-semibold hidden lg:table-cell">ID Transacción</th>
                <th class="px-6 py-4 font-semibold">Fecha</th>
                <th class="px-6 py-4 font-semibold">Tipo</th>
                <th class="px-6 py-4 font-semibold hidden md:table-cell">Método</th>
                <th class="px-6 py-4 font-semibold hidden lg:table-cell">Nota</th>
                <th class="px-6 py-4 font-semibold text-right">Monto</th>
                <th class="px-6 py-4 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              
              <tr *ngFor="let tx of transactions" class="hover:bg-white/5 transition-colors group">
                <td class="px-6 py-4 font-mono text-xs text-white/50 group-hover:text-newera-primary transition-colors hidden lg:table-cell">
                  {{ tx.id }}
                </td>
                <td class="px-6 py-4 text-white">
                  {{ tx.date | date:'dd MMM yyyy, HH:mm' }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border"
                        [ngClass]="{
                          'bg-green-500/10 text-green-400 border-green-500/20': tx.type === 'DEPOSITO',
                          'bg-red-500/10 text-red-400 border-red-500/20': tx.type === 'RETIRO'
                        }">
                    {{ tx.type }}
                  </span>
                </td>
                <td class="px-6 py-4 text-newera-text-muted hidden md:table-cell">
                  {{ tx.method }}
                </td>
                <td class="px-6 py-4 text-white/50 text-xs hidden lg:table-cell max-w-[150px] truncate" [title]="tx.note">
                  {{ tx.note }}
                </td>
                <td class="px-6 py-4 font-mono font-bold text-right"
                    [ngClass]="tx.type === 'DEPOSITO' ? 'text-newera-profit' : 'text-white'">
                  {{ tx.type === 'DEPOSITO' ? '+' : '-' }}<span>$</span>{{ tx.amount | number:'1.2-6' }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border"
                        [ngClass]="{
                          'bg-green-500/10 text-green-400 border-green-500/20': tx.status === 'APROBADO',
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20': tx.status === 'PENDIENTE',
                          'bg-red-500/10 text-red-400 border-red-500/20': tx.status === 'RECHAZADO'
                        }">
                    {{ tx.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Vista Móvil (Tarjetas) -->
          <div class="md:hidden flex flex-col gap-4 p-4 pb-20 overflow-y-auto">
            <div *ngFor="let tx of transactions" class="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 shadow-lg relative overflow-hidden group">
              <!-- Top Row -->
              <div class="flex justify-between items-start">
                <div class="flex flex-col items-start">
                  <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border mb-2"
                        [ngClass]="{
                          'bg-green-500/10 text-green-400 border-green-500/20': tx.type === 'DEPOSITO',
                          'bg-red-500/10 text-red-400 border-red-500/20': tx.type === 'RETIRO'
                        }">
                    {{ tx.type }}
                  </span>
                  <span class="text-[10px] text-newera-text-muted">{{ tx.date | date:'dd MMM yyyy, HH:mm' }}</span>
                </div>
                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border"
                      [ngClass]="{
                        'bg-green-500/10 text-green-400 border-green-500/20': tx.status === 'APROBADO',
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20': tx.status === 'PENDIENTE',
                        'bg-red-500/10 text-red-400 border-red-500/20': tx.status === 'RECHAZADO'
                      }">
                  {{ tx.status }}
                </span>
              </div>
              
              <!-- Bottom Row -->
              <div class="flex flex-col gap-3 border-t border-white/5 pt-3">
                <div class="flex justify-between items-end">
                  <div class="flex flex-col">
                    <span class="text-[9px] text-newera-text-muted uppercase tracking-wider mb-0.5">Método</span>
                    <span class="text-white text-xs font-bold">{{ tx.method }}</span>
                    <span class="text-white/30 font-mono text-[9px] mt-0.5">{{ tx.id }}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-[9px] text-newera-text-muted uppercase tracking-wider mb-0.5">Monto</span>
                    <span class="font-mono font-bold text-lg"
                          [ngClass]="tx.type === 'DEPOSITO' ? 'text-newera-profit' : 'text-white'">
                      {{ tx.type === 'DEPOSITO' ? '+' : '-' }}<span>$</span>{{ tx.amount | number:'1.2-6' }}
                    </span>
                  </div>
                </div>
                
                <!-- Expanded Note Section -->
                <div class="flex flex-col bg-white/5 rounded-lg p-3 relative group/tooltip" *ngIf="tx.note">
                  <span class="text-[9px] text-newera-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Nota
                  </span>
                  <span class="text-white/80 text-[11px] leading-relaxed line-clamp-2 cursor-pointer">{{ tx.note }}</span>
                  
                  <!-- Tooltip Custom para vista móvil -->
                  <div class="absolute z-50 left-0 bottom-full mb-2 w-[calc(100vw-4rem)] p-3 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-200">
                    <span class="text-white text-xs block break-words">{{ tx.note }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ClientHistoryComponent {
  transactions: CajaTransaction[] = [];
  isLoading = true;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    const user = this.authService.currentUser();
    if (!user) return;
    
    this.http.get<any[]>(`${environment.apiUrl}/caja/usuario/${user.id}`).subscribe({
      next: (data) => {
        this.transactions = data.map(tx => ({
          id: `TX-${tx.idTransaccion}`,
          date: new Date(tx.fechaSolicitud),
          type: tx.tipoTransaccion,
          method: tx.metodoPago || 'N/A',
          amount: tx.monto,
          status: tx.estatus,
          note: tx.notas || ''
        })).sort((a, b) => b.date.getTime() - a.date.getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching history', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClasses(status: string) {
    switch(status) {
      case 'APROBADO': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PENDIENTE': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'RECHAZADO': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/10 text-white border-white/20';
    }
  }

  getStatusDotClasses(status: string) {
    switch(status) {
      case 'APROBADO': return 'bg-green-400 shadow-[0_0_5px_#4ade80]';
      case 'PENDIENTE': return 'bg-yellow-400 animate-pulse shadow-[0_0_5px_#facc15]';
      case 'RECHAZADO': return 'bg-red-400 shadow-[0_0_5px_#f87171]';
      default: return 'bg-white';
    }
  }
}
