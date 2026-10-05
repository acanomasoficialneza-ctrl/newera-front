import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AlertaCampanita {
  idAlerta: number;
  idUsuarioDestino: number;
  titulo: string;
  mensaje: string;
  tipo?: string;
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
    return new Observable(observer => {
      const token = sessionStorage.getItem('jwt_token') || '';
      const eventSource = new EventSource(`${this.apiUrl}/stream/${idUsuario}?token=${token}`);

      eventSource.addEventListener('notifications-update', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);
        } catch (e) {
          console.error('Error parsing notifications update', e);
        }
      });

      eventSource.onerror = (error) => {
        console.error('Error in notifications SSE', error);
        // We don't complete or error out immediately, to allow automatic reconnection by the browser.
      };

      return () => {
        eventSource.close();
      };
    });
  }

  marcarComoLeida(idAlerta: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/campanita/${idAlerta}/leer`, {});
  }
}
