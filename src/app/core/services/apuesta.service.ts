import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApuestaService {
  private apiUrl = `${environment.apiUrl}/apuestas`;
  
  public posicionesActualizadas = new Subject<void>();

  constructor(private http: HttpClient) {}

  abrirPosicion(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/abrir`, payload);
  }

  cerrarPosicion(idApuestaCliente: number, gananciaPerdida: number = 0): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idApuestaCliente}/cerrar?gananciaPerdida=${gananciaPerdida}`, {});
  }

  obtenerPosicionesCerradas(idUsuario: number): Observable<any> {
    // Ajustar a la ruta real de tu backend si es distinta
    return this.http.post(`${environment.apiUrl}/apuestaCliente/consultaApuestasCerradasClienteID`, {
      idUsuario: idUsuario
    });
  }

  getApuestasByUsuario(idUsuario: number, estatus?: string): Observable<any[]> {
    let url = `${this.apiUrl}/usuario/${idUsuario}`;
    if (estatus) {
      url += `?estatus=${estatus}`;
    }
    return this.http.get<any[]>(url);
  }
}
