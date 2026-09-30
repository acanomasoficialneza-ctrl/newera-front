import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLog {
  idLog: number;
  idUsuarioResponsable: number | null;
  nivel: string;
  mensaje: string;
  direccionIp: string;
  fechaEvento: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuditService {
  private apiUrl = `${environment.apiUrl}/auditoria`;

  constructor(private http: HttpClient) {}

  getLogs(date?: string): Observable<AuditLog[]> {
    const url = date ? `${this.apiUrl}?fecha=${date}` : this.apiUrl;
    return this.http.get<AuditLog[]>(url);
  }
}
