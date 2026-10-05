import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  getTransaccionesPendientes(): Observable<TransaccionCaja[]> {
    return this.http.get<TransaccionCaja[]>(`${this.apiUrl}/pendientes`);
  }

  getTransaccionesHistorial(): Observable<TransaccionCaja[]> {
    return this.http.get<TransaccionCaja[]>(`${this.apiUrl}/historial`);
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
