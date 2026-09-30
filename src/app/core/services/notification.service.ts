import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AlertaCampanita {
  idAlerta: number;
  idUsuarioDestino: number;
  titulo: string;
  mensaje: string;
  leido: boolean;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  getNotificaciones(idUsuario: number): Observable<AlertaCampanita[]> {
    return this.http.get<AlertaCampanita[]>(`${this.apiUrl}/campanita/${idUsuario}`);
  }

  marcarComoLeida(idAlerta: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/campanita/${idAlerta}/leer`, {});
  }
}
