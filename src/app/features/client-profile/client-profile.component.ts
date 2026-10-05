import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { AdminCrmService } from '../../core/services/admin-crm.service';
import { LoadingService } from '../../core/services/loading.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-profile.component.html'
})
export class ClientProfileComponent implements OnInit {
  authService = inject(AuthService);
  adminCrmService = inject(AdminCrmService);
  loadingService = inject(LoadingService);
  http = inject(HttpClient);
  sanitizer = inject(DomSanitizer);

  selectedClient: any = {
    id: null,
    name: '',
    nombrePila: '',
    telefono: '',
    email: '',
    password: '',
    fechaNacimiento: '',
    estadoResidencia: '',
    experienciaTrading: 'PRINCIPIANTE',
    profesion: '',
    hobbie: '',
    fechaRegistro: '',
    status: 'ACTIVO',
    estadoKyc: 'PENDIENTE',
    urlFotoPerfil: '',
    urlIneFrente: '',
    urlIneReverso: ''
  };

  statesOfMexico: string[] = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
    'Guerrero', 'Hidalgo', 'Jalisco', 'Estado de México', 'Michoacán', 'Morelos',
    'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
    'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
    'Veracruz', 'Yucatán', 'Zacatecas'
  ];

  urlFotoPerfilBlob: SafeUrl | null = null;
  urlIneFrenteBlob: SafeUrl | null = null;
  urlIneReversoBlob: SafeUrl | null = null;

  isFullscreenImageOpen: boolean = false;
  fullscreenImageUrl: any = null;

  toastMessage: string | null = null;
  isConfirmOpen = false;
  confirmActionType: 'save' | null = null;

  ngOnInit() {
    this.loadMyProfile();
  }

  loadMyProfile() {
    const authUser = this.authService.currentUser();
    if (!authUser || !authUser.id) return;
    this.selectedClient.id = authUser.id;

    this.loadingService.show('radar', 'Cargando perfil...');
    this.adminCrmService.getClienteById(authUser.id).subscribe({
      next: (data) => {
        this.selectedClient.name = data.nombreCompleto || '';
        this.selectedClient.nombrePila = data.nombrePila || '';
        this.selectedClient.telefono = data.telefono || '';
        this.selectedClient.estadoResidencia = data.estadoResidencia || '';
        this.selectedClient.profesion = data.profesion || '';
        this.selectedClient.experienciaTrading = data.experienciaTrading || 'PRINCIPIANTE';
        this.selectedClient.hobbie = data.hobbie || '';
        this.selectedClient.fechaNacimiento = data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString().split('T')[0] : '';
        this.selectedClient.fechaRegistro = data.fechaRegistro;
        this.selectedClient.estadoKyc = data.estadoKyc || 'PENDIENTE';
        
        if (data.usuarioAuth) {
          this.selectedClient.status = data.usuarioAuth.estado || 'ACTIVO';
          this.selectedClient.password = data.usuarioAuth.pass;
          this.selectedClient.email = data.usuarioAuth.correo;
        }

        this.selectedClient.urlFotoPerfil = data.urlFotoPerfil;
        this.selectedClient.urlIneFrente = data.urlIneFrente;
        this.selectedClient.urlIneReverso = data.urlIneReverso;
        this.loadSecureImages();
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error fetching my profile', err);
        this.loadingService.hide();
      }
    });
  }

  loadSecureImages() {
    const defaultAvatar = 'E:\\casino\\newEra\\fotoGenerica.png';
    const defaultIne = 'E:\\casino\\newEra\\credencial.png';

    this.urlFotoPerfilBlob = this.buildMediaUrl(this.selectedClient.urlFotoPerfil || defaultAvatar);
    this.urlIneFrenteBlob = this.buildMediaUrl(this.selectedClient.urlIneFrente || defaultIne);
    this.urlIneReversoBlob = this.buildMediaUrl(this.selectedClient.urlIneReverso || defaultIne);
  }

  buildMediaUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.apiUrl}/file/view/${encodeURIComponent(path.split('\\').pop() || path)}`;
  }



  openFullscreenImage(url: any) {
    if (url) {
      this.fullscreenImageUrl = url;
      this.isFullscreenImageOpen = true;
    }
  }

  closeFullscreenImage() {
    this.isFullscreenImageOpen = false;
    this.fullscreenImageUrl = null;
  }

  uploadFotoPerfil(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.loadingService.show('radar', 'Subiendo foto...');
    const formData = new FormData();
    formData.append('file', file);
    this.http.put(`${environment.apiUrl}/usuarios/${this.selectedClient.id}/foto-perfil`, formData, { responseType: 'text' }).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Foto de perfil actualizada');
        this.loadMyProfile();
      },
      error: (err) => {
        this.loadingService.hide();
        this.showToast('Error al subir foto');
        console.error(err);
      }
    });
  }

  uploadDocumento(event: any, type: 'frente' | 'reverso') {
    const file = event.target.files[0];
    if (!file) return;
    this.loadingService.show('radar', 'Subiendo documento...');
    const formData = new FormData();
    if (type === 'frente') formData.append('fileFrente', file);
    if (type === 'reverso') formData.append('fileReverso', file);
    this.http.put(`${environment.apiUrl}/usuarios/${this.selectedClient.id}/documentos`, formData, { responseType: 'text' }).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Documento actualizado');
        this.loadMyProfile();
      },
      error: (err) => {
        this.loadingService.hide();
        this.showToast('Error al subir documento');
        console.error(err);
      }
    });
  }

  requestConfirm(type: 'save') {
    if (type === 'save' && this.selectedClient.fechaNacimiento) {
      const birthDate = new Date(this.selectedClient.fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        this.showToast('Debes ser mayor de 18 años para actualizar tu perfil.', 'error');
        return;
      }
    }
    this.confirmActionType = type;
    this.isConfirmOpen = true;
  }

  cancelConfirm() {
    this.isConfirmOpen = false;
    this.confirmActionType = null;
  }

  confirmAction() {
    if (this.confirmActionType === 'save') {
      this.guardarCambios();
    }
    this.isConfirmOpen = false;
    this.confirmActionType = null;
  }

  guardarCambios() {
    this.loadingService.show('radar', 'Actualizando mis datos...');
    const payload = {
      nombreCompleto: this.selectedClient.name,
      nombrePila: this.selectedClient.nombrePila,
      telefono: this.selectedClient.telefono,
      correo: this.selectedClient.email,
      pass: this.selectedClient.password,
      fechaNacimiento: this.selectedClient.fechaNacimiento,
      estadoResidencia: this.selectedClient.estadoResidencia,
      profesion: this.selectedClient.profesion,
      experienciaTrading: this.selectedClient.experienciaTrading,
      hobbie: this.selectedClient.hobbie
    };

    this.adminCrmService.updateCliente(this.selectedClient.id, payload).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Datos de perfil actualizados correctamente.');
        this.loadMyProfile(); // Reload
      },
      error: (err) => {
        console.error(err);
        this.loadingService.hide();
        this.showToast('Error al actualizar el perfil.');
      }
    });
  }

  toastType: 'success' | 'warning' | 'error' = 'success';

  showToast(msg: string, type: 'success' | 'warning' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}
