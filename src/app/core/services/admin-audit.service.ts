import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/models';

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

  getLogsPaginados(date?: string, page: number = 0, size: number = 10): Observable<PageResponse<AuditLog>> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (date) {
      url += `&fecha=${date}`;
    }
    return this.http.get<PageResponse<AuditLog>>(url);
  }
}

