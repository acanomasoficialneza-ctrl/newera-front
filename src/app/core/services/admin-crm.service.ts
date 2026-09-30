import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClientePayload {
  correo: string;
  pass?: string;
  nombreCompleto: string;
  nombrePila?: string;
  telefono?: string;
  estadoResidencia?: string;
  profesion?: string;
  experienciaTrading?: string;
  hobbie?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCrmService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private cajaUrl = `${environment.apiUrl}/caja`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes`);
  }

  getClienteById(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idUsuario}`);
  }

  getApuestas(idUsuario: number, estatus?: string): Observable<any[]> {
    const url = estatus ? 
      `${environment.apiUrl}/apuestas/usuario/${idUsuario}?estatus=${estatus}` : 
      `${environment.apiUrl}/apuestas/usuario/${idUsuario}`;
    return this.http.get<any[]>(url);
  }

  getTransacciones(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/caja/usuario/${idUsuario}`);
  }

  createCliente(payload: ClientePayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registro/cliente`, payload);
  }

  updateCliente(id: number, payload: Partial<ClientePayload>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/perfil`, payload);
  }

  updateKyc(id: number, estadoKyc: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/kyc?estado=${estadoKyc}`, {});
  }

  solicitarCaja(payload: any): Observable<any> {
    return this.http.post<any>(`${this.cajaUrl}/solicitar`, payload);
  }

  getTransaccionesUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.cajaUrl}/usuario/${idUsuario}`);
  }

  updateEstado(id: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  asignarEjecutivo(idCliente: number, idAdmin: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/asignaciones`, { idCliente, idAdmin });
  }

  desasignarEjecutivo(idCliente: number, idAdmin: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/asignaciones/cliente/${idCliente}/admin/${idAdmin}`);
  }

  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admins`);
  }

  getAsignacionesCliente(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/asignaciones/cliente/${idCliente}`);
  }

  getAllAsignaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/asignaciones`);
  }

  resetPassword(correo: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/reset`, { correo });
  }

  cerrarPosicion(idApuesta: string, gananciaPerdida: number): Observable<any> {
    // Note: Assuming Apuesta Controller exists and maps to /apuestas
    return this.http.post<any>(`${environment.apiUrl}/apuestas/${idApuesta}/cerrar?gananciaPerdida=${gananciaPerdida}`, {});
  }

  actualizarPosicion(idApuesta: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/apuestas/${idApuesta}`, payload);
  }

  getNotasCliente(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/crm/cliente/${idCliente}`);
  }

  createNota(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/crm`, payload);
  }
}
