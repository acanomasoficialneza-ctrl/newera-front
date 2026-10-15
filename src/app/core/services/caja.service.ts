import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/models';

export interface TransaccionCaja {
  idTransaccion: number;
  usuario: {
    idUsuario: number;
    correo: string;
  };
  tipoTransaccion: string;
  metodoPago: string;
  detallesCuenta: string;
  monto: number;
  estatus: string;
  fechaSolicitud: string;
  fechaResolucion: string;
  adminAprobador?: {
    idUsuario: number;
    correo: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private apiUrl = `${environment.apiUrl}/caja`;

  constructor(private http: HttpClient) {}

  getAllTransacciones(): Observable<TransaccionCaja[]> {
    return this.http.get<TransaccionCaja[]>(this.apiUrl);
  }

  getTransaccionesByUsuarioPaginado(idUsuario: number, page: number = 0, size: number = 10): Observable<PageResponse<TransaccionCaja>> {
    return this.http.get<PageResponse<TransaccionCaja>>(`${this.apiUrl}/usuario/${idUsuario}?page=${page}&size=${size}`);
  }

  getTransaccionesPendientes(): Observable<TransaccionCaja[]> {
    return this.http.get<TransaccionCaja[]>(`${this.apiUrl}/pendientes`);
  }

  getTransaccionesPendientesPaginadas(page: number = 0, size: number = 10): Observable<PageResponse<TransaccionCaja>> {
    return this.http.get<PageResponse<TransaccionCaja>>(`${this.apiUrl}/pendientes?page=${page}&size=${size}`);
  }

  getTransaccionesHistorial(): Observable<TransaccionCaja[]> {
    return this.http.get<TransaccionCaja[]>(`${this.apiUrl}/historial`);
  }

  getTransaccionesHistorialPaginadas(page: number = 0, size: number = 10): Observable<PageResponse<TransaccionCaja>> {
    return this.http.get<PageResponse<TransaccionCaja>>(`${this.apiUrl}/historial?page=${page}&size=${size}`);
  }

  aprobarTransaccion(idTransaccion: number, idAdmin: number, nota?: string): Observable<TransaccionCaja> {
    const queryParams = nota ? `?idAdmin=${idAdmin}&nota=${encodeURIComponent(nota)}` : `?idAdmin=${idAdmin}`;
    return this.http.put<TransaccionCaja>(`${this.apiUrl}/aprobar/${idTransaccion}${queryParams}`, {});
  }

  rechazarTransaccion(idTransaccion: number, idAdmin: number, nota?: string): Observable<TransaccionCaja> {
    const queryParams = nota ? `?idAdmin=${idAdmin}&nota=${encodeURIComponent(nota)}` : `?idAdmin=${idAdmin}`;
    return this.http.put<TransaccionCaja>(`${this.apiUrl}/rechazar/${idTransaccion}${queryParams}`, {});
  }
}
