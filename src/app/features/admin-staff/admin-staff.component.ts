import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../core/services/loading.service';
import { AdminStaffService, AdminUser, AdminPayload } from '../../core/services/admin-staff.service';

@Component({
  selector: 'app-admin-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-staff.component.html'
})
export class AdminStaffComponent implements OnInit {
  isModalOpen = false;
  isConfirmOpen = false;
  isEditMode = false;
  
  // Data State
  admins: AdminUser[] = [];
  filteredAdmins: AdminUser[] = [];
  searchTerm: string = '';

  // Form State
  selectedAdmin: Partial<AdminUser> & { pass?: string, telefono?: string } = {};
  
  toastMessage: string | null = null;
  errorMessage: string = '';

  constructor(
    private loadingService: LoadingService,
    private adminStaffService: AdminStaffService
  ) {}

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.adminStaffService.getAdmins().subscribe({
      next: (data) => {
        this.admins = data.map(item => ({
          idUsuario: item.idUsuario,
          correo: item.usuarioAuth?.correo || 'Sin correo',
          pass: item.usuarioAuth?.pass || '',
          nombre: item.nombreCompleto || 'Sin Nombre',
          telefono: item.telefono || '',
          departamento: item.departamento || 'Sin asignar',
          rol: item.usuarioAuth?.rol || 'EJECUTIVO',
          estado: item.usuarioAuth?.estado || 'ACTIVO',
          fechaIngreso: item.fechaRegistro || 'N/A'
        }));
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching admins', err);
        this.showToast('Error al cargar administradores');
      }
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredAdmins = [...this.admins];
      return;
    }
    this.filteredAdmins = this.admins.filter(a => 
      a.nombre.toLowerCase().includes(term) ||
      a.correo.toLowerCase().includes(term) ||
      a.departamento.toLowerCase().includes(term)
    );
  }

  openModal(admin?: any) {
    if (admin) {
      this.isEditMode = true;
      this.selectedAdmin = { ...admin };
    } else {
      this.isEditMode = false;
      this.selectedAdmin = {
        departamento: 'DIRECCION',
        rol: 'EJECUTIVO',
        estado: 'ACTIVO'
      };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedAdmin = {};
    this.errorMessage = '';
  }

  requestSaveAdmin() {
    this.errorMessage = '';
    if (!this.selectedAdmin.correo || !this.selectedAdmin.correo.includes('@')) {
      this.errorMessage = 'Ingresa un correo electrónico válido.';
      return;
    }
    if (!this.selectedAdmin.nombre || this.selectedAdmin.nombre.trim().length < 3) {
      this.errorMessage = 'El nombre completo es requerido (mín. 3 caracteres).';
      return;
    }
    if (!this.selectedAdmin.telefono || this.selectedAdmin.telefono.trim().length < 8) {
      this.errorMessage = 'El teléfono es requerido y debe ser válido (mín. 8 caracteres).';
      return;
    }
    if (!this.selectedAdmin.departamento) {
      this.errorMessage = 'Selecciona un departamento válido.';
      return;
    }
    if (!this.selectedAdmin.rol) {
      this.errorMessage = 'Selecciona un rol válido.';
      return;
    }
    if (!this.selectedAdmin.pass || this.selectedAdmin.pass.trim().length < 6) {
      this.errorMessage = 'La contraseña es obligatoria (mín. 6 caracteres).';
      return;
    }
    this.isConfirmOpen = true;
  }

  cancelConfirm() {
    this.isConfirmOpen = false;
  }

  confirmSaveAdmin() {
    this.isConfirmOpen = false;
    this.loadingService.show('radar', 'Guardando cambios...');

    const payload: AdminPayload = {
      correo: this.selectedAdmin.correo || '',
      nombreCompleto: this.selectedAdmin.nombre || '',
      departamento: this.selectedAdmin.departamento || 'DIRECCION',
      rol: this.selectedAdmin.rol || 'EJECUTIVO',
      estado: this.selectedAdmin.estado
    };

    if (this.selectedAdmin.pass) {
      payload.pass = this.selectedAdmin.pass;
    }
    if (this.selectedAdmin.telefono) {
      payload.telefono = this.selectedAdmin.telefono;
    }

    if (this.isEditMode && this.selectedAdmin.idUsuario) {
      // Update
      this.adminStaffService.updateAdmin(this.selectedAdmin.idUsuario, payload).subscribe({
        next: () => {
          if (this.selectedAdmin.estado) {
            this.adminStaffService.updateAdminStatus(this.selectedAdmin.idUsuario!, this.selectedAdmin.estado).subscribe(() => {
               this.finalizeSave('actualizado');
            });
          } else {
            this.finalizeSave('actualizado');
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      // Create
      payload.pass = payload.pass || '123456'; // Default si no se provee
      this.adminStaffService.createAdmin(payload).subscribe({
        next: () => this.finalizeSave('registrado'),
        error: (err) => this.handleError(err)
      });
    }
  }

  finalizeSave(action: string) {
    this.loadingService.hide();
    this.showToast(`¡Administrador ${action} correctamente!`);
    this.closeModal();
    this.loadAdmins();
  }

  handleError(err: any) {
    this.loadingService.hide();
    console.error(err);
    this.showToast('Ocurrió un error en la operación');
    this.closeModal();
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}
