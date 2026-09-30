import { Injectable, NgZone, signal, WritableSignal } from '@angular/core';
import { UserDashboardDto, BalanceDto, PriceDto, PositionUpdateDto } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TradingSocketService {
  // Legacy EventSource
  private eventSource: EventSource | null = null;
  public dashboardState: WritableSignal<UserDashboardDto | null> = signal(null);
  
  // Nuevos EventSources
  private balanceEventSource: EventSource | null = null;
  private marketEventSource: EventSource | null = null;
  private positionsEventSource: EventSource | null = null;

  // Señales reactivas Fase 1 y 2 y 3
  public balanceState: WritableSignal<BalanceDto | null> = signal(null);
  public marketState: WritableSignal<PriceDto[] | null> = signal(null);
  public positionsState: WritableSignal<PositionUpdateDto[] | null> = signal(null);

  // Estado de la conexión
  public isConnected: WritableSignal<boolean> = signal(false);
  public isBalanceConnected: WritableSignal<boolean> = signal(false);
  public isMarketConnected: WritableSignal<boolean> = signal(false);
  public isPositionsConnected: WritableSignal<boolean> = signal(false);

  // Señal específica para el activo seleccionado en la gráfica
  public selectedAsset = signal<string>('BTC/USD');

  constructor(private zone: NgZone) {}

  public connect(userId: number): void {
    if (this.eventSource) {
      this.disconnect();
    }

    // Obtenemos el token para pasarlo por query param ya que EventSource no permite headers
    const token = sessionStorage.getItem('jwt_token') || '';
    const url = `${environment.apiUrl}/stream/usuario/${userId}?token=${token}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.zone.run(() => {
        this.isConnected.set(true);
      });
    };

    this.eventSource.addEventListener('dashboard-update', (event: MessageEvent) => {
      // Angular 17+: Asegurar que la actualización de la señal entra en la zona de Angular
      this.zone.run(() => {
        const data: UserDashboardDto = JSON.parse(event.data);
        this.dashboardState.set(data);
      });
    });

    this.eventSource.onerror = (error) => {
      console.error('Error en SSE:', error);
      this.zone.run(() => {
        this.isConnected.set(false);
      });
      this.disconnect();
      // Lógica de reconexión opcional
      setTimeout(() => this.connect(userId), 5000);
    };
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.zone.run(() => {
      this.isConnected.set(false);
    });
  }

  public connectAdmin(clientId: number): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const token = sessionStorage.getItem('jwt_token') || '';
    const url = `${environment.apiUrl}/stream/admin/cliente/${clientId}?token=${token}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.zone.run(() => {
        this.isConnected.set(true);
      });
    };

    this.eventSource.addEventListener('dashboard-update', (event: MessageEvent) => {
      this.zone.run(() => {
        const data: UserDashboardDto = JSON.parse(event.data);
        this.dashboardState.set(data);
      });
    });

    this.eventSource.onerror = (error) => {
      console.error('Error en SSE Admin:', error);
      this.zone.run(() => {
        this.isConnected.set(false);
      });
      this.disconnect();
    };
  }

  // ============================================
  // FASE 1: CONEXIÓN EXCLUSIVA DE BALANCE
  // ============================================
  public connectBalance(userId: number): void {
    if (this.balanceEventSource) {
      this.disconnectBalance();
    }

    const token = sessionStorage.getItem('jwt_token') || '';
    const url = `${environment.apiUrl}/stream/balance/${userId}?token=${token}`;
    this.balanceEventSource = new EventSource(url);

    this.balanceEventSource.onopen = () => {
      this.zone.run(() => this.isBalanceConnected.set(true));
    };

    this.balanceEventSource.addEventListener('balance-update', (event: MessageEvent) => {
      this.zone.run(() => {
        const data: BalanceDto = JSON.parse(event.data);
        this.balanceState.set(data);
      });
    });

    this.balanceEventSource.onerror = (error) => {
      this.zone.run(() => this.isBalanceConnected.set(false));
      this.disconnectBalance();
      setTimeout(() => this.connectBalance(userId), 5000);
    };
  }

  public disconnectBalance(): void {
    if (this.balanceEventSource) {
      this.balanceEventSource.close();
      this.balanceEventSource = null;
    }
    this.zone.run(() => this.isBalanceConnected.set(false));
  }

  // ============================================
  // FASE 1: CONEXIÓN EXCLUSIVA DE MERCADOS
  // ============================================
  public connectMarket(): void {
    if (this.marketEventSource) {
      this.disconnectMarket();
    }

    const token = sessionStorage.getItem('jwt_token') || '';
    const url = `${environment.apiUrl}/stream/mercados?token=${token}`;
    this.marketEventSource = new EventSource(url);

    this.marketEventSource.onopen = () => {
      this.zone.run(() => this.isMarketConnected.set(true));
    };

    this.marketEventSource.addEventListener('market-update', (event: MessageEvent) => {
      this.zone.run(() => {
        const data: PriceDto[] = JSON.parse(event.data);
        this.marketState.set(data);
      });
    });

    this.marketEventSource.onerror = (error) => {
      this.zone.run(() => this.isMarketConnected.set(false));
      this.disconnectMarket();
      setTimeout(() => this.connectMarket(), 5000);
    };
  }

  public disconnectMarket(): void {
    if (this.marketEventSource) {
      this.marketEventSource.close();
      this.marketEventSource = null;
    }
    this.zone.run(() => this.isMarketConnected.set(false));
  }

  // ============================================
  // FASE 3: CONEXIÓN EXCLUSIVA DE POSICIONES
  // ============================================
  public connectPositions(userId: number): void {
    if (this.positionsEventSource) {
      this.disconnectPositions();
    }

    const token = sessionStorage.getItem('jwt_token') || '';
    const url = `${environment.apiUrl}/stream/posiciones/${userId}?token=${token}`;
    this.positionsEventSource = new EventSource(url);

    this.positionsEventSource.onopen = () => {
      this.zone.run(() => this.isPositionsConnected.set(true));
    };

    this.positionsEventSource.addEventListener('positions-update', (event: MessageEvent) => {
      this.zone.run(() => {
        const data: PositionUpdateDto[] = JSON.parse(event.data);
        this.positionsState.set(data);
      });
    });

    this.positionsEventSource.onerror = (error) => {
      this.zone.run(() => this.isPositionsConnected.set(false));
      this.disconnectPositions();
      setTimeout(() => this.connectPositions(userId), 5000);
    };
  }

  public disconnectPositions(): void {
    if (this.positionsEventSource) {
      this.positionsEventSource.close();
      this.positionsEventSource = null;
    }
    this.zone.run(() => this.isPositionsConnected.set(false));
  }

  public setSelectedAsset(simbolo: string): void {
    this.selectedAsset.set(simbolo);
  }
}
