import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  idUsuario: number;
  correo: string;
  nombre: string;
  departamento: string;
  rol: string;
  estado: string;
  fechaIngreso: string;
}

export interface AdminPayload {
  correo: string;
  pass?: string;
  nombreCompleto: string;
  telefono?: string;
  departamento: string;
  rol: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStaffService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admins`);
  }

  createAdmin(payload: AdminPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registro/admin`, payload);
  }

  updateAdmin(id: number, payload: AdminPayload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/perfil`, payload);
  }

  updateAdminStatus(id: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
