import { Injectable, NgZone } from '@angular/core';
import { MarketDataService, PriceData } from './market-data.service';

@Injectable({
  providedIn: 'root'
})
export class EodMarketSocketService {
  private readonly EOD_TOKEN = '68b09a16609891.62026589';
  private readonly EOD_FOREX_URL = `wss://ws.eodhistoricaldata.com/ws/forex?api_token=${this.EOD_TOKEN}`;
  private readonly EOD_US_URL = `wss://ws.eodhistoricaldata.com/ws/us-quote?api_token=${this.EOD_TOKEN}`;

  // Símbolos de Forex (1:1 Alpha)
  public readonly FOREX_SYMBOLS = [
    'EURUSD', 'USDJPY', 'GBPUSD', 'USDTRY', 'USDCHF', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDINR', 'USDCNY',
    'USDSGD', 'USDHKD', 'USDDKK', 'USDSEK', 'USDILS', 'USDMXN', 'USDZAR'
  ];

  // Símbolos de Materias Primas (1:1 Alpha)
  public readonly MATERIAS_SYMBOLS = [
    'XAUUSD', 'XAGUSD', 'WTIUSD', 'XBRUSD', 'XCUUSD', 'BRLUSD',
    'THBUSD', 'XALUSD', 'XPDUSD', 'XPTUSD', 'XZNUSD', 'XPBUSD'
  ];

  // Símbolos de Acciones (28 originales Alpha + 20 nuevos validados)
  public readonly ACCIONES_SYMBOLS = [
    'AMZN', 'TSLA', 'MSFT', 'NVDA', 'AAPL', 'GOOG', 'META', 'LLY', 'JNJ', 'ORCL',
    'ADBE', 'UBER', 'SBUX', 'MCD', 'KO', 'WMT', 'PFE', 'AZN', 'BABA', 'PEP',
    'BBVA', 'MA', 'INTC', 'ERII', 'BE', 'CARR', 'CMI', 'NFLX',
    'DIS', 'TSM', 'SQM', 'ALB', 'CVX', 'XOM', 'SPCE', 'V', 'MELI', 'GM',
    'AXP', 'AAL', 'BAC', 'F', 'JPM', 'IBM', 'WFC', 'C', 'T', 'MMM'
  ];

  // Binance Cripto y Fondos
  private readonly CRIPTO_SYMBOLS = [
    'trump', 'meme', 'btc', 'eth', 'ltc', 'alpha', 'ada', 'bnb', 'doge', 'avax', 'shib', 
    'bch', 'dot', 'trx', 'link', 'matic', 'icp', 'near', 'uni', 'dai', 'apt', 'stx', 
    'fil', 'atom', 'arb', 'wif', 'mkr', 'inj', 'grt', 'op', 'jup', 'flow', 'pepe'
  ];
  private readonly FONDOS_SYMBOLS = ['imx', 'ai', 'dia'];

  // Socket EODHD activo (máximo 1 conexión controlada para evitar colisiones de plan)
  private activeEodSocket: WebSocket | null = null;
  private binanceSockets: WebSocket[] = [];
  
  // Control de sub-batching Alpha
  private batchTimer: any = null;
  private binanceReconnectTimers: any[] = [];
  private nextSymbolIndex = 0;
  private batchSize = 5;
  private pendingBatch: string[] = [];
  private awaitingAuth = true;
  private currentSymbols: string[] = [];
  private currentActiveCategory: 'DIVISA' | 'MATERIAS' | 'ACCIONES' | '' = '';

  private isConnected = false;
  private currentCategory: string = 'CRIPTO';

  // Memoria de cálculo para variación de acciones idéntica a Alpha (chunk-4YRX6F3E.js)
  private accionesMemory = new Map<string, { lastMid: number; lastVar: number }>();

  constructor(
    private marketDataService: MarketDataService,
    private zone: NgZone
  ) {}

  public connectAll(): void {
    if (this.isConnected) return;
    this.isConnected = true;
    console.log('📡 [EodMarketSocketService] Iniciando servicio de mercados en vivo');

    // 1. Precarga instantánea por REST de Binance (<50ms, sin CORS)
    this.fetchBinanceFondosInstant();
    this.fetchBinanceCriptoInstant();

    // 2. Conectar streams de Binance (individuales 1:1 como Alpha)
    this.connectBinanceCrypto();
    this.connectBinanceFondos();

    // 3. Conectar la categoría enfocada inicialmente si corresponde
    if (this.currentCategory && this.currentCategory !== 'CRIPTO' && this.currentCategory !== 'FONDOS') {
      this.connectCategory(this.currentCategory as any);
    }
  }

  public disconnectAll(): void {
    if (!this.isConnected) return;
    this.isConnected = false;
    console.log('🔌 [EodMarketSocketService] Desconectando todos los sockets');

    this.closeEodSocket();

    this.binanceReconnectTimers.forEach(t => clearTimeout(t));
    this.binanceReconnectTimers = [];

    this.binanceSockets.forEach(s => {
      try { s.close(); } catch {}
    });
    this.binanceSockets = [];
  }

  /**
   * Cambia el foco de categoría cuando el usuario abre una sección en el acordeón del sidebar.
   * Cierra de inmediato cualquier socket previo de EODHD y abre una sola conexión limpia
   * aplicando el algoritmo de batching de Alpha para no saturar el plan EODHD.
   */
  public setFocusCategory(category: string): void {
    if (this.currentCategory === category && this.activeEodSocket) return;
    this.currentCategory = category;

    if (!this.isConnected) return;

    if (category === 'MATERIAS' || category === 'DIVISA' || category === 'ACCIONES') {
      this.connectCategory(category);
    } else {
      this.closeEodSocket();
    }
  }

  public onAssetSelected(simbolo: string): void {
    const cat = this.getCategoryForSymbol(simbolo);
    if (cat && cat !== this.currentCategory && (cat === 'DIVISA' || cat === 'MATERIAS' || cat === 'ACCIONES')) {
      this.setFocusCategory(cat);
    }
  }

  /**
   * Conexión única 1:1 a EODHD para la categoría activa con arquitectura Alpha robusta.
   */
  private connectCategory(categoria: 'DIVISA' | 'MATERIAS' | 'ACCIONES'): void {
    this.closeEodSocket();

    if (!this.isConnected) return;

    let symbols: string[] = [];
    let url = this.EOD_FOREX_URL;

    if (categoria === 'DIVISA') {
      symbols = [...this.FOREX_SYMBOLS];
      url = this.EOD_FOREX_URL;
    } else if (categoria === 'MATERIAS') {
      symbols = [...this.MATERIAS_SYMBOLS];
      url = this.EOD_FOREX_URL;
    } else if (categoria === 'ACCIONES') {
      symbols = [...this.ACCIONES_SYMBOLS];
      url = this.EOD_US_URL;
    }

    this.currentSymbols = symbols;
    this.currentActiveCategory = categoria;
    this.nextSymbolIndex = 0;
    this.batchSize = 5;
    this.pendingBatch = [];
    this.awaitingAuth = true;

    try {
      console.log(`🔌 [EOD ${categoria}] Conectando socket único para ${symbols.length} activos...`);
      const ws = new WebSocket(url);
      this.activeEodSocket = ws;

      ws.onopen = () => {
        console.log(`🔌 [EOD ${categoria}] WebSocket conectado exitosamente`);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data);

          // 1. Manejo de status
          if (msg.status_code) {
            const code = Number(msg.status_code);
            if (code === 200) {
              if (this.awaitingAuth) {
                this.awaitingAuth = false;
                this.subscribeNextBatch();
              }
              return;
            }

            const errStr = String(msg.message || msg.error || '');
            if (code === 422 && /symbol/i.test(errStr)) {
              this.onSymbolLimitReached();
              return;
            }

            console.warn(`[EOD ${categoria}] Estado:`, msg);
            return;
          }

          // 2. Procesamiento de cotizaciones en tiempo real
          if (msg && msg.s) {
            if (categoria === 'ACCIONES') {
              // Mapeo Alpha 1:1 original para acciones
              const vender = parseFloat(msg.ap ?? msg.ask) || parseFloat(msg.p) || 0;
              const comprar = parseFloat(msg.bp ?? msg.bid) || parseFloat(msg.p) || 0;
              const actual = parseFloat(msg.p) || ((comprar + vender) > 0 ? (comprar + vender) / 2 : (comprar || vender));

              const sym = msg.s;
              const mem = this.accionesMemory.get(sym) || { lastMid: actual, lastVar: 0 };
              const changeMid = mem.lastMid !== 0 ? ((actual - mem.lastMid) / mem.lastMid) * 100 : 0;
              const variacion = parseFloat(msg.dc) || (Number.isFinite(changeMid) ? Math.round(changeMid * 100) / 100 : 0);
              this.accionesMemory.set(sym, { lastMid: actual, lastVar: variacion });

              this.updatePrice(sym, actual, comprar, vender, variacion, 'ACCIONES');
            } else {
              // Mapeo Alpha 1:1 original para Forex y Materias Primas
              const comprar = parseFloat(msg.a) || parseFloat(msg.p) || 0;
              const vender = parseFloat(msg.b) || parseFloat(msg.p) || 0;
              const actual = (comprar + vender) > 0 ? (comprar + vender) / 2 : (comprar || vender);
              const variacion = parseFloat(msg.dc) || 0;
              this.updatePrice(msg.s, actual, comprar, vender, variacion, categoria);
            }
          }
        } catch (e) {}
      };

      ws.onerror = (err) => {
        console.error(`❌ [EOD ${categoria}] Error de conexión:`, err);
      };

      ws.onclose = () => {
        console.log(`🔌 [EOD ${categoria}] WebSocket cerrado`);
        if (this.activeEodSocket === ws) {
          this.activeEodSocket = null;
        }
      };
    } catch (err) {
      console.error(`❌ Error instanciando WebSocket EOD ${categoria}:`, err);
    }
  }

  /**
   * Envía el siguiente bloque de suscripciones según la lógica probada de Alpha (chunk-4YRX6F3E.js)
   */
  private subscribeNextBatch(): void {
    if (!this.activeEodSocket || this.activeEodSocket.readyState !== WebSocket.OPEN) return;
    if (this.pendingBatch.length > 0 || this.nextSymbolIndex >= this.currentSymbols.length) return;

    const batch = this.currentSymbols.slice(this.nextSymbolIndex, this.nextSymbolIndex + this.batchSize);
    this.pendingBatch = batch;
    this.nextSymbolIndex += batch.length;

    console.log(`📡 [EOD ${this.currentActiveCategory}] Suscribiendo ${batch.length} símbolos: ${batch.join(',')}`);
    this.activeEodSocket.send(JSON.stringify({
      action: 'subscribe',
      symbols: batch.join(',')
    }));

    clearTimeout(this.batchTimer);
    this.batchTimer = setTimeout(() => {
      this.pendingBatch = [];
      this.subscribeNextBatch();
    }, 400);
  }

  /**
   * Manejo exacto de límite de plan EODHD (Alpha original):
   * Reduce batchSize a 1; si ya era 1, se detiene limpiamente sin bucles ni sobrecargas.
   */
  private onSymbolLimitReached(): void {
    clearTimeout(this.batchTimer);
    const prevBatch = this.pendingBatch;
    this.pendingBatch = [];
    this.nextSymbolIndex = Math.max(0, this.nextSymbolIndex - prevBatch.length);

    if (this.batchSize === 1) {
      this.nextSymbolIndex = this.currentSymbols.length; // Finalizar: no insistir más
      console.warn(`⚠️ [EOD ${this.currentActiveCategory}] Límite de símbolos del plan alcanzado. Se muestran los activos recibidos.`);
      return;
    }

    this.batchSize = 1;
    this.subscribeNextBatch();
  }

  private closeEodSocket(): void {
    clearTimeout(this.batchTimer);
    this.batchTimer = null;
    this.pendingBatch = [];
    this.currentActiveCategory = '';

    if (this.activeEodSocket) {
      try {
        this.activeEodSocket.onopen = null;
        this.activeEodSocket.onmessage = null;
        this.activeEodSocket.onerror = null;
        this.activeEodSocket.onclose = null;
        this.activeEodSocket.close();
      } catch {}
      this.activeEodSocket = null;
    }
  }

  private getCategoryForSymbol(simbolo: string): string | null {
    if (this.MATERIAS_SYMBOLS.includes(simbolo)) return 'MATERIAS';
    if (this.FOREX_SYMBOLS.includes(simbolo)) return 'DIVISA';
    if (this.ACCIONES_SYMBOLS.includes(simbolo)) return 'ACCIONES';
    return null;
  }

  // ==========================================
  // PRECARGA INSTANTÁNEA BINANCE (SIN CORS, <50ms)
  // ==========================================
  private fetchBinanceFondosInstant(): void {
    const symbols = '["IMXUSDT","AIUSDT","DIAUSDT"]';
    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`)
      .then(r => r.json())
      .then(data => {
        if (!this.isConnected || !Array.isArray(data)) return;
        data.forEach(item => {
          const rawSym = item.symbol.replace('USDT', '').toLowerCase();
          const displaySymbol = rawSym.toUpperCase() + '/USD';
          const precioActual = parseFloat(item.lastPrice) || 0;
          const precioCompra = precioActual;
          const precioVenta = parseFloat(item.weightedAvgPrice) || precioActual;
          const variacion = parseFloat(item.priceChangePercent) || 0;
          this.updatePrice(displaySymbol, precioActual, precioCompra, precioVenta, variacion, 'FONDOS');
        });
      })
      .catch(() => {});
  }

  private fetchBinanceCriptoInstant(): void {
    const topSymbols = '["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT","DOGEUSDT","ADAUSDT","XRPUSDT","AVAXUSDT","TRXUSDT","LINKUSDT"]';
    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(topSymbols)}`)
      .then(r => r.json())
      .then(data => {
        if (!this.isConnected || !Array.isArray(data)) return;
        data.forEach(item => {
          const rawSym = item.symbol.replace('USDT', '').toLowerCase();
          const displaySymbol = rawSym.toUpperCase() + '/USD';
          const precioActual = parseFloat(item.lastPrice) || 0;
          const precioCompra = precioActual;
          const precioVenta = parseFloat(item.weightedAvgPrice) || precioActual;
          const variacion = parseFloat(item.priceChangePercent) || 0;
          this.updatePrice(displaySymbol, precioActual, precioCompra, precioVenta, variacion, 'CRIPTO');
        });
      })
      .catch(() => {});
  }

  // ==========================================
  // BINANCE CRIPTO & FONDOS (WS INDIVIDUALES 1:1 COMO ALPHA)
  // ==========================================
  private connectBinanceCrypto(): void {
    this.CRIPTO_SYMBOLS.forEach(symbol => {
      this.createBinanceStream(symbol, 'CRIPTO');
    });
  }

  private connectBinanceFondos(): void {
    this.FONDOS_SYMBOLS.forEach(symbol => {
      this.createBinanceStream(symbol, 'FONDOS');
    });
  }

  private createBinanceStream(symbol: string, categoria: string): void {
    if (!this.isConnected) return;
    try {
      const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@ticker`;
      const ws = new WebSocket(url);
      this.binanceSockets.push(ws);

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const precioActual = parseFloat(data.c) || 0;
          const precioCompra = precioActual;
          const precioVenta = parseFloat(data.w) || precioActual;
          const variacion = parseFloat(data.P) || 0;

          const displaySymbol = symbol.toUpperCase() + '/USD';
          this.updatePrice(displaySymbol, precioActual, precioCompra, precioVenta, variacion, categoria);
        } catch (e) {}
      };

      ws.onerror = () => {};
      ws.onclose = () => {
        const idx = this.binanceSockets.indexOf(ws);
        if (idx !== -1) this.binanceSockets.splice(idx, 1);

        if (this.isConnected) {
          const t = setTimeout(() => {
            if (this.isConnected) this.createBinanceStream(symbol, categoria);
          }, 5000);
          this.binanceReconnectTimers.push(t);
        }
      };
    } catch (e) {}
  }

  // ==========================================
  // ACTUALIZADOR CENTRALIZADO A MARKETDATA
  // ==========================================
  private updatePrice(simbolo: string, actual: number, compra: number, venta: number, variacion: number, categoria: string): void {
    const basePrice = actual > 0 ? actual : (compra > 0 ? compra : venta);
    if (basePrice <= 0) return;

    // Precios puros 1:1 sin fórmulas ficticias
    const finalCompra = compra > 0 ? compra : basePrice;
    const finalVenta = venta > 0 ? venta : basePrice;

    this.zone.run(() => {
      this.marketDataService.upsertPrice({
        simbolo,
        precioActual: basePrice,
        precioCompra: finalCompra,
        precioVenta: finalVenta,
        variacionPorcentaje: Math.round(variacion * 100) / 100,
        timestamp: Date.now(),
        isUp: variacion >= 0,
        categoria
      });
    });
  }
}
