import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardGlobalStats {
  aum: number;
  riesgoVivo: number;
  volumen24h: number;
  flujoNeto30d: number;
  staffActivos: number;
  conversionFtd: number;
  usuariosTotales: number;
  retirosEnCola: number;
  retirosEnColaMonto: number;
  kycPendientes: number;
  alertasSeguridad: number;
}

export interface DashboardChartData {
  time: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getGlobalStats(): Observable<DashboardGlobalStats> {
    return this.http.get<DashboardGlobalStats>(`${this.apiUrl}/global`);
  }

  getChartData(days: number = 30): Observable<DashboardChartData[]> {
    return this.http.get<DashboardChartData[]>(`${this.apiUrl}/chart-data?days=${days}`);
  }
}
