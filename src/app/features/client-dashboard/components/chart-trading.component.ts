import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createChart, IChartApi, ISeriesApi, Time, LineSeries } from 'lightweight-charts';
import { MarketDataService } from '../../../core/services/market-data.service';
import { PriceDto } from '../../../core/models/models';

@Component({
  selector: 'app-chart-trading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel w-full h-full flex flex-col p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white tracking-wider">{{ selectedAsset }}</h2>
        <div class="flex gap-2">
          <span class="text-xs text-newera-text-muted">1m</span>
          <span class="text-xs text-newera-text-muted">5m</span>
          <span class="text-xs text-newera-text-muted bg-white/10 px-2 rounded">15m</span>
        </div>
      </div>
      <div #chartContainer class="flex-1 w-full h-full rounded overflow-hidden"></div>
    </div>
  `,
})
export class ChartTradingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  
  private chart!: IChartApi;
  private askSeries!: ISeriesApi<"Line">;
  private bidSeries!: ISeriesApi<"Line">;
  
  public selectedAsset: string = 'BTC/USD';
  private currentAsset: string = '';

  constructor(private marketDataService: MarketDataService) {
    // Escuchamos los cambios en los precios para actualizar la gráfica del activo seleccionado
    effect(() => {
      const prices = this.marketDataService.marketPrices();
      const newSelected = this.marketDataService.selectedAsset();
      
      this.selectedAsset = newSelected;

      // Si cambia el activo, limpiamos la gráfica desde cero
      if (this.currentAsset !== newSelected) {
        this.currentAsset = newSelected;
        if (this.askSeries) this.askSeries.setData([]);
        if (this.bidSeries) this.bidSeries.setData([]);
      }

      if (prices && prices.length > 0 && this.askSeries && this.bidSeries) {
        const targetPrice = prices.find((p: any) => p.simbolo === this.selectedAsset);
        if (targetPrice) {
          // Add data point. Use timestamp / 1000 for lightweight charts time format (Unix timestamp in seconds)
          const timeValue = Math.floor(new Date(targetPrice.timestamp).getTime() / 1000) as Time;
          
          try {
            this.askSeries.update({
              time: timeValue,
              value: targetPrice.precioCompra || targetPrice.precioActual
            });
            this.bidSeries.update({
              time: timeValue,
              value: targetPrice.precioVenta || targetPrice.precioActual
            });
          } catch(e) {
            // En caso de que el timestamp sea igual al anterior (ligera colisión)
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#A1A1AA',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    this.askSeries = this.chart.addSeries(LineSeries, {
      color: '#22C55E', // text-newera-profit (Green) -> Compra (Ask)
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      title: 'Compra (Ask)'
    });

    this.bidSeries = this.chart.addSeries(LineSeries, {
      color: '#EF4444', // text-newera-loss (Red) -> Venta (Bid)
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      title: 'Venta (Bid)'
    });

    // No initial mock data. The chart starts empty and will populate via the signal effect.

    // Handle resize
    new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== this.chartContainer.nativeElement) return;
      const newRect = entries[0].contentRect;
      this.chart.applyOptions({ width: newRect.width, height: newRect.height });
    }).observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.remove();
    }
  }
}
