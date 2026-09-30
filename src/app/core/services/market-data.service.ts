import { Injectable, signal, OnDestroy, effect } from '@angular/core';
import { TradingSocketService } from './trading-socket.service';

export interface PriceData {
  simbolo: string;
  precioActual: number;
  precioCompra?: number;
  precioVenta?: number;
  variacionPorcentaje: number;
  timestamp: number;
  isUp: boolean; // Ahora se calcula centralizado
  categoria: string;
}



@Injectable({
  providedIn: 'root'
})
export class MarketDataService implements OnDestroy {
  
  public marketPrices = signal<PriceData[]>([]);
  public selectedAsset = signal<string>('BTC/USD');

  // Categorías y Activos
  private binanceAssets = ['BTC/USD', 'ETH/USD', 'XRP/USD', 'SOL/USD', 'ADA/USD'];

  // Estado interno para calcular isUp y variacionPorcentaje
  private currentPrices = new Map<string, PriceData>();
  private initialPrices = new Map<string, number>();
  
  constructor(private socketService: TradingSocketService) {
    // Escuchar el stream SSE de Mercados
    effect(() => {
      const prices = this.socketService.marketState();
      if (prices) {
        // Formatear al PriceData que espera el frontend
        const formattedPrices = prices.map((p: any) => ({
          simbolo: p.simbolo,
          precioActual: p.precioActual,
          precioCompra: p.precioCompra,
          precioVenta: p.precioVenta,
          variacionPorcentaje: p.variacionPorcentaje,
          timestamp: new Date(p.timestamp).getTime(),
          isUp: p.variacionPorcentaje >= 0,
          categoria: p.categoria || 'CRIPTO'
        }));
        this.marketPrices.set(formattedPrices);
      }
    }, { allowSignalWrites: true });
  }

  public setSelectedAsset(simbolo: string) {
    this.selectedAsset.set(simbolo);
  }

  ngOnDestroy() {
    // Ya no hay websockets que limpiar, el TradingSocketService se encarga
  }
}

