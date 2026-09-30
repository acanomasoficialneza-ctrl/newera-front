import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'CLIENTE' | 'EJECUTIVO' | 'GERENTE' | 'DIRECTOR' | 'ADMIN' | null;

export interface CurrentUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResponse {
  token: string;
  rol: UserRole;
  idUsuario: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  public currentUser = signal<CurrentUser | null>(null);

  constructor(private http: HttpClient) {
    // Al iniciar el servicio, intentamos restaurar la sesión desde el LocalStorage
    this.restoreSession();
  }

  /**
   * Realiza la llamada HTTP al API Gateway para iniciar sesión.
   */
  public login(correo: string, pass: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { correo, pass })
      .pipe(
        tap(response => {
          // Si es exitoso, guardamos el token y actualizamos el estado
          if (response && response.token) {
            sessionStorage.setItem('jwt_token', response.token);
            
            // Decodificamos el nombre desde el JWT (si el backend lo enviara)
            // o usamos un valor default según el rol por ahora.
            let name = 'Usuario';
            if (response.rol === 'DIRECTOR') name = 'Director General';
            if (response.rol === 'GERENTE' || response.rol === 'EJECUTIVO' || response.rol === 'ADMIN') name = 'Mesa de Control';
            if (response.rol === 'CLIENTE') name = 'Trader VIP';

            this.currentUser.set({
              id: response.idUsuario || 0, // Fallback if backend doesn't send it in login root
              email: correo,
              role: response.rol,
              name: name
            });
          }
        })
      );
  }

  public logout(): void {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('authUser');
    this.currentUser.set(null);
  }

  public isAuthenticated(): boolean {
    return this.currentUser() !== null || sessionStorage.getItem('jwt_token') !== null;
  }

  /**
   * Intenta restaurar la sesión si el navegador es recargado
   */
  private restoreSession(): void {
    const token = sessionStorage.getItem('jwt_token');
    if (token) {
      try {
        // Obtenemos el payload del JWT (parte del medio)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Verificamos expiración
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp < currentTime) {
          this.logout();
          return;
        }

        let name = 'Usuario';
        if (payload.rol === 'DIRECTOR') name = 'Director General';
        if (payload.rol === 'GERENTE' || payload.rol === 'EJECUTIVO' || payload.rol === 'ADMIN') name = 'Mesa de Control';
        if (payload.rol === 'CLIENTE') name = 'Trader VIP';

        this.currentUser.set({
          id: payload.idUsuario,
          email: payload.sub || 'usuario@newera', // En JWT usualmente es "sub"
          role: payload.rol, 
          name: name
        });
      } catch(e) {
        // Token inválido o malformado
        this.logout();
      }
    }
  }

  // Método antiguo ficticio mantenido solo si alguien más lo usara, 
  // pero ya no debería usarse en el login.component.ts.
  public loginFicticio(email: string): boolean {
    return false; 
  }
}
