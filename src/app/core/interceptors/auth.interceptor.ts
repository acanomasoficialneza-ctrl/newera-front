import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Obtenemos el token desde el almacenamiento (usando el AuthService o directo desde sessionStorage)
  const token = sessionStorage.getItem('jwt_token');

  // Clonar la petición y agregar el Header Authorization si existe el token
  // Ignoramos el endpoint de login para no mandar token ahí
  let authReq = req;
  if (token && !req.url.includes('/auth/login')) {
    const user = authService.currentUser();
    const headersConfig: any = {
      Authorization: `Bearer ${token}`
    };
    if (user && user.id) {
      headersConfig['X-Auth-User-Id'] = user.id.toString();
    }
    
    authReq = req.clone({
      setHeaders: headersConfig
    });
  }

  // Pasamos la petición al siguiente handler y atrapamos errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un 401 Unauthorized (y no es el login, donde la credencial puede ser incorrecta),
      // significa que el token expiró o es inválido. Redirigimos al login.
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout(); // Limpiar el estado y el sessionStorage
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
