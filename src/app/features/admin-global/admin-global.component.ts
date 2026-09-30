import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { createChart, IChartApi, ISeriesApi, AreaSeries } from 'lightweight-charts';

import { DashboardService, DashboardGlobalStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-global',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [],
  templateUrl: './admin-global.component.html'
})
export class AdminGlobalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private chart!: IChartApi;
  private areaSeries!: ISeriesApi<"Area">;
  
  stats = signal<DashboardGlobalStats | null>(null);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getGlobalStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error cargando stats globales', err)
    });
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.remove();
    }
  }

  private initChart() {
    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#888',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: { color: 'rgba(255, 255, 255, 0.4)', width: 1, style: 3 },
        horzLine: { color: 'rgba(255, 255, 255, 0.4)', width: 1, style: 3 },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    this.areaSeries = this.chart.addSeries(AreaSeries, {
      lineColor: '#2563EB',
      topColor: 'rgba(37, 99, 235, 0.4)',
      bottomColor: 'rgba(37, 99, 235, 0.0)',
      lineWidth: 2,
    });

    this.dashboardService.getChartData(30).subscribe({
      next: (chartData) => {
        if (chartData && chartData.length > 0) {
          this.areaSeries.setData(chartData);
        } else {
          // Fallback empty data to prevent crash
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          this.areaSeries.setData([{ time: `${y}-${m}-${d}`, value: 0 }]);
        }
        this.chart.timeScale().fitContent();
      },
      error: (err) => console.error('Error loading chart data', err)
    });
    this.chart.timeScale().fitContent();

    // Auto resize
    new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== this.chartContainer.nativeElement) return;
      const newRect = entries[0].contentRect;
      this.chart.applyOptions({ width: newRect.width, height: newRect.height });
    }).observe(this.chartContainer.nativeElement);
  }
}
