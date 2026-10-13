import { Injectable, signal, OnDestroy } from '@angular/core';

export interface PriceData {
  simbolo: string;
  precioActual: number;
  precioCompra?: number;
  precioVenta?: number;
  variacionPorcentaje: number;
  timestamp: number;
  isUp: boolean;
  categoria: string;
  changeDirection?: 'up' | 'down' | 'same';
  flash?: 'up' | 'down' | null;
}

@Injectable({
  providedIn: 'root'
})
export class MarketDataService implements OnDestroy {
  
  public marketPrices = signal<PriceData[]>([]);
  public selectedAsset = signal<string>('BTC/USD');

  /**
   * Indica reactivamente si el mercado bursátil de EE. UU. (Wall Street) está abierto.
   * Horario regular: Lunes a Viernes de 9:30 AM a 4:00 PM Eastern Time (America/New_York).
   */
  public stockMarketOpen = signal<boolean>(this.isStockMarketOpen());

  private priceMap = new Map<string, PriceData>();
  private flashTimeouts = new Map<string, any>();
  private batchFlushTimer: any = null;
  private marketStatusInterval: any = null;
  private pendingFlush = false;

  constructor() {
    this.marketStatusInterval = setInterval(() => {
      this.stockMarketOpen.set(this.isStockMarketOpen());
    }, 30000);
  }

  /**
   * Evalúa si Wall Street está actualmente abierto según la hora oficial de Nueva York (ET).
   */
  public isStockMarketOpen(): boolean {
    try {
      const now = new Date();
      const nyDateStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
      const nyDate = new Date(nyDateStr);
      const day = nyDate.getDay(); // 0 = Domingo, 6 = Sábado
      if (day === 0 || day === 6) return false;
      const mins = nyDate.getHours() * 60 + nyDate.getMinutes();
      return mins >= 570 && mins < 960; // 9:30 AM (570) a 4:00 PM (960) ET
    } catch {
      return false;
    }
  }

  /**
   * Obtiene la hora actual formateada en hora de Nueva York (ET).
   */
  public getNyTimeString(): string {
    try {
      return new Date().toLocaleTimeString('en-US', { 
        timeZone: 'America/New_York', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) + ' ET';
    } catch {
      return '';
    }
  }

  public upsertPrice(price: PriceData): void {
    const existing = this.priceMap.get(price.simbolo);
    let changeDirection: 'up' | 'down' | 'same' = existing?.changeDirection || 'same';
    let flash: 'up' | 'down' | null = existing?.flash || null;

    if (existing) {
      const oldVal = existing.precioCompra || existing.precioActual || 0;
      const newVal = price.precioCompra || price.precioActual || 0;
      
      if (newVal > oldVal) {
        changeDirection = 'up';
        flash = 'up';
      } else if (newVal < oldVal) {
        changeDirection = 'down';
        flash = 'down';
      }
    }

    const updated: PriceData = {
      ...(existing || {}),
      ...price,
      changeDirection,
      flash
    };

    this.priceMap.set(price.simbolo, updated);

    // Reset de destello visual a los 750ms
    if (flash) {
      if (this.flashTimeouts.has(price.simbolo)) {
        clearTimeout(this.flashTimeouts.get(price.simbolo));
      }
      const t = setTimeout(() => {
        const curr = this.priceMap.get(price.simbolo);
        if (curr && curr.flash) {
          this.priceMap.set(price.simbolo, { ...curr, flash: null });
          this.scheduleFlush();
        }
      }, 750);
      this.flashTimeouts.set(price.simbolo, t);
    }

    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.pendingFlush) return;
    this.pendingFlush = true;

    // Throttle ligero a 50ms para 60fps fluidos con 30+ sockets simultáneos
    this.batchFlushTimer = setTimeout(() => {
      this.pendingFlush = false;
      this.marketPrices.set(Array.from(this.priceMap.values()));
    }, 50);
  }

  public setSelectedAsset(simbolo: string) {
    this.selectedAsset.set(simbolo);
  }

  public clearPrices() {
    if (this.batchFlushTimer) clearTimeout(this.batchFlushTimer);
    if (this.marketStatusInterval) clearInterval(this.marketStatusInterval);
    this.flashTimeouts.forEach(t => clearTimeout(t));
    this.flashTimeouts.clear();
    this.priceMap.clear();
    this.marketPrices.set([]);
  }

  ngOnDestroy() {
    this.clearPrices();
  }
}

