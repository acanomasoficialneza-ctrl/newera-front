import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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
  
  // Validation State
  emailError: string | null = null;
  phoneError: string | null = null;
  emailValid: boolean = false;
  phoneValid: boolean = false;
  
  private emailCheckSubject = new Subject<string>();
  private phoneCheckSubject = new Subject<string>();

  toastMessage: string | null = null;
  toastType: 'success' | 'warning' | 'error' = 'success';

  constructor(
    private loadingService: LoadingService,
    private adminStaffService: AdminStaffService
  ) {}

  ngOnInit() {
    this.loadAdmins();

    this.emailCheckSubject.pipe(debounceTime(500)).subscribe(email => {
      this.checkEmail(email);
    });

    this.phoneCheckSubject.pipe(debounceTime(500)).subscribe(phone => {
      this.checkPhone(phone);
    });
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
    this.emailError = null;
    this.phoneError = null;
    this.emailValid = false;
    this.phoneValid = false;

    if (admin) {
      this.isEditMode = true;
      this.selectedAdmin = { ...admin };
      this.emailValid = true; // existing is valid
      this.phoneValid = true;
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
    this.emailError = null;
    this.phoneError = null;
    this.emailValid = false;
    this.phoneValid = false;
  }

  onEmailChange(email: string | undefined) {
    if (this.isEditMode) return;
    this.emailValid = false;
    if (!email || !email.includes('@')) {
      this.emailError = 'Correo inválido.';
      return;
    }
    this.emailError = null;
    this.emailCheckSubject.next(email);
  }

  onPhoneChange(phone: string | undefined) {
    if (this.isEditMode) return;
    this.phoneValid = false;
    if (!phone || phone.trim().length < 8) {
      this.phoneError = 'Teléfono inválido (mín. 8 caracteres).';
      return;
    }
    this.phoneError = null;
    this.phoneCheckSubject.next(phone);
  }

  checkEmail(email: string) {
    this.adminStaffService.checkCorreo(email).subscribe({
      next: (res) => {
        if (res.exists) {
          this.emailError = 'Este correo ya está registrado.';
          this.emailValid = false;
        } else {
          this.emailError = null;
          this.emailValid = true;
        }
      },
      error: () => {
        this.emailError = 'Error validando correo';
        this.emailValid = false;
      }
    });
  }

  checkPhone(phone: string) {
    this.adminStaffService.checkTelefono(phone).subscribe({
      next: (res) => {
        if (res.exists) {
          this.phoneError = 'Este teléfono ya está registrado.';
          this.phoneValid = false;
        } else {
          this.phoneError = null;
          this.phoneValid = true;
        }
      },
      error: () => {
        this.phoneError = 'Error validando teléfono';
        this.phoneValid = false;
      }
    });
  }

  requestSaveAdmin() {
    if (this.emailError) {
      this.showToast('Verifica el correo electrónico.', 'error');
      return;
    }
    if (this.phoneError) {
      this.showToast('Verifica el número de teléfono.', 'error');
      return;
    }
    if (!this.selectedAdmin.correo || !this.selectedAdmin.correo.includes('@')) {
      this.showToast('Ingresa un correo electrónico válido.', 'error');
      return;
    }
    if (!this.selectedAdmin.nombre || this.selectedAdmin.nombre.trim().length < 3) {
      this.showToast('El nombre completo es requerido (mín. 3 caracteres).', 'error');
      return;
    }
    if (!this.selectedAdmin.telefono || this.selectedAdmin.telefono.trim().length < 8) {
      this.showToast('El teléfono es requerido y debe ser válido (mín. 8 caracteres).', 'error');
      return;
    }
    if (!this.selectedAdmin.departamento) {
      this.showToast('Selecciona un departamento válido.', 'error');
      return;
    }
    if (!this.selectedAdmin.rol) {
      this.showToast('Selecciona un rol válido.', 'error');
      return;
    }
    if (!this.selectedAdmin.pass || this.selectedAdmin.pass.trim().length < 6) {
      this.showToast('La contraseña es obligatoria (mín. 6 caracteres).', 'error');
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
    this.showToast(`¡Administrador ${action} correctamente!`, 'success');
    this.closeModal();
    this.loadAdmins();
  }

  handleError(err: any) {
    this.loadingService.hide();
    console.error(err);
    this.showToast('Ocurrió un error en la operación', 'error');
    this.closeModal();
  }

  showToast(msg: string, type: 'success' | 'warning' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}
