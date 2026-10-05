import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { AdminCrmService } from '../../core/services/admin-crm.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';
import { TradingSocketService } from '../../core/services/trading-socket.service';

@Component({
  selector: 'app-admin-crm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-crm.component.html'
})
export class AdminCrmComponent implements OnInit {
  
  showCloseConfirmModal: boolean = false;
  positionToClose: string | null = null;

  showSaveConfirmModal: boolean = false;
  positionToSave: any = null;

  showCajaConfirmModal: boolean = false;
  showNotaConfirmModal: boolean = false;

  toastMessage: string | null = null;
  toastType: 'success' | 'warning' | 'error' = 'success';

  cajaForm = {
    tipo: 'DEPOSITO',
    metodo: 'TRANSFERENCIA',
    monto: null as number | null,
    referencia: '',
    notas: ''
  };

  cajaError: string = '';
  cajaExito: string = '';

  cajaHistorial: any[] = [];

  clients: any[] = [];
  filteredClients: any[] = [];
  searchTerm: string = '';

  isNewClientModalOpen: boolean = false;
  newClientErrorMessage: string = '';
  newClientErrors: any = {};
  newClient = {
    nombreCompleto: '',
    nombrePila: '',
    correo: '',
    telefono: '',
    estadoResidencia: '',
    fechaNacimiento: '',
    profesion: '',
    experienciaTrading: '',
    hobbie: '',
    pass: ''
  };
  correoStatus: 'valid' | 'invalid' | 'loading' | null = null;
  telefonoStatus: 'valid' | 'invalid' | 'loading' | null = null;
  totalDepositosAprobados: number = 0;
  totalRetirosAprobados: number = 0;

  selectedClient: any = null;
  
  activeAdmins: any[] = [];
  selectedAdminId: number | null = null;
  clientAsignaciones: any[] = [];
  
  urlFotoPerfilBlob: any = null;
  urlIneFrenteBlob: any = null;
  urlIneReversoBlob: any = null;
  
  // Modal de imagen a pantalla completa
  isFullscreenImageOpen: boolean = false;
  fullscreenImageUrl: any = null;

  activeTab: 'posiciones' | 'perfil' | 'kyc' | 'caja' | 'notas' = 'posiciones';
  isSupremo: boolean = false;

  posicionesAbiertas: any[] = [];
  posicionesCerradas: any[] = [];
  mockPositions: any[] = [];

  notasCliente: any[] = [];
  nuevaNotaText: string = '';
  isAddingNota: boolean = false;

  filtroPosiciones: 'ABIERTO' | 'CERRADO' = 'ABIERTO';

  statesOfMexico = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 
    'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 
    'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 
    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 
    'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ];

  constructor(
    private authService: AuthService, 
    private loadingService: LoadingService,
    private adminCrmService: AdminCrmService,
    private tradingSocketService: TradingSocketService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    this.isSupremo = this.authService.currentUser()?.role === 'DIRECTOR';

    // Watch SSE updates for the selected client's positions
    effect(() => {
      const positions = this.tradingSocketService.positionsState();
      if (positions && positions.length > 0 && this.selectedClient && this.filtroPosiciones === 'ABIERTO') {
        // Optimización Visor: Cruce de IDs para actualizar SOLO el PnL
        this.mockPositions = this.mockPositions.map(pos => {
          const update = positions.find(s => s.id === pos.id);
          if (update) {
            return { ...pos, pnl: update.pnl };
          }
          return pos;
        });
      }
    });

    // Watch SSE updates for the selected client's balance
    effect(() => {
      const balance = this.tradingSocketService.balanceState();
      if (balance && this.selectedClient) {
        this.selectedClient.balance = balance.dineroTotal;
        this.selectedClient.margenLibre = balance.margenLibre;
        this.selectedClient.margen = balance.margen;
      }
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  // Se eliminó loadAdmins() individual porque ahora se carga junto con clientes


  loadClients() {
    forkJoin({
      clientes: this.adminCrmService.getClientes(),
      asignaciones: this.adminCrmService.getAllAsignaciones(),
      admins: this.adminCrmService.getAdmins()
    }).subscribe({
      next: ({ clientes, asignaciones, admins }) => {
        // Guardar admins activos globalmente (Solo GERENTES y EJECUTIVOS)
        this.activeAdmins = admins.filter(a => 
          a.usuarioAuth?.estado === 'ACTIVO' && 
          ['GERENTE', 'EJECUTIVO'].includes(a.usuarioAuth?.rol)
        );

        this.clients = clientes
          .filter(c => {
            if (this.isSupremo) return true; // Director ve todos
            const asigs = asignaciones.filter(a => a.idCliente === c.idUsuario);
            const myId = this.authService.currentUser()?.id;
            return asigs.some(a => a.idAdmin === myId); // Ejecutivo/Gerente ve solo los suyos
          })
          .map(c => {
          // Filtrar asignaciones de este cliente
          const asigs = asignaciones.filter(a => a.idCliente === c.idUsuario);
          
          // Mapear al nombre del ejecutivo (solo si está activo)
          const managerNames = asigs
            .map(asig => this.activeAdmins.find(admin => admin.idUsuario === asig.idAdmin))
            .filter(admin => !!admin) // omitir inactivos
            .map(admin => admin.nombreCompleto || 'Sin Nombre');

          return {
            id: c.idUsuario,
            name: c.nombreCompleto || 'Sin Nombre',
            nombrePila: c.nombrePila,
            telefono: c.telefono,
            estadoResidencia: c.estadoResidencia,
            profesion: c.profesion,
            experienciaTrading: c.experienciaTrading,
            hobbie: c.hobbie,
            email: c.usuarioAuth?.correo,
            password: c.usuarioAuth?.pass,
            status: c.usuarioAuth?.estado || 'ACTIVO',
            estadoKyc: c.estadoKyc || 'PENDIENTE',
            balance: c.balance || 0,
            margen: c.margenUtilizado || 0,
            margenLibre: c.margenLibre || 0,
            pnl: 0,
            manager: managerNames, // Se asigna el array real
            fechaNacimiento: c.fechaNacimiento ? new Date(c.fechaNacimiento).toISOString().split('T')[0] : '',
            fechaRegistro: c.fechaRegistro,
            urlFotoPerfil: c.urlFotoPerfil,
            urlIneFrente: c.urlIneFrente,
            urlIneReverso: c.urlIneReverso
          };
        });
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching clients', err);
      }
    });
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(c => 
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.status?.toLowerCase().includes(term)
    );
  }

  openClientModal(client: any) {
    this.selectedClient = { ...client };
    this.activeTab = 'posiciones'; // Reset to default tab
    this.filtroPosiciones = 'ABIERTO';
    this.loadApuestasCliente();
    this.loadSecureImages();
    // Conectar los sockets modulares para el cliente
    this.tradingSocketService.connectPositions(this.selectedClient.id);
    this.tradingSocketService.connectBalance(this.selectedClient.id);
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
    return `${environment.apiUrl}/usuarios/media?path=${encodeURIComponent(path)}`;
  }

  loadApuestasCliente() {
    if (!this.selectedClient) return;
    this.mockPositions = []; // Limpiamos para asegurar que solo vemos info de BD
    this.adminCrmService.getApuestas(this.selectedClient.id, this.filtroPosiciones).subscribe({
      next: (data) => {
        this.mockPositions = data.map(a => ({
          id: a.idApuestaCliente,
          name: a.compra,
          category: a.categoria || 'N/A', 
          type: a.tipoCompra,
          pnl: a.gananciaPerdida || 0,
          status: a.estatusCompra,
          unidades: a.unidades || 1, 
          monto_usd: a.montoApuesta,
          variacion: a.variacion || 0,
          fecha_creacion: a.fechaCreacion
        }));
      },
      error: (err) => console.error('Error fetching apuestas', err)
    });
  }

  closeClientModal() {
    this.selectedClient = null;
    this.tradingSocketService.disconnectPositions();
    this.tradingSocketService.disconnectBalance();
    this.loadClients(); // Actualizar la tabla con los nuevos asignados
  }

  openNewClientModal() {
    this.newClient = {
      nombreCompleto: '',
      nombrePila: '',
      correo: '',
      telefono: '',
      estadoResidencia: '',
      fechaNacimiento: '',
      profesion: '',
      experienciaTrading: '',
      hobbie: '',
      pass: ''
    };
    this.newClientErrorMessage = '';
    this.isNewClientModalOpen = true;
  }

  closeNewClientModal() {
    this.isNewClientModalOpen = false;
    this.newClientErrors = {};
    this.correoStatus = null;
    this.telefonoStatus = null;
  }

  onCorreoBlur() {
    if (!this.newClient.correo || !this.newClient.correo.includes('@')) {
      this.correoStatus = null;
      return;
    }
    this.correoStatus = 'loading';
    this.adminCrmService.checkCorreo(this.newClient.correo).subscribe({
      next: (res) => {
        this.correoStatus = res.exists ? 'invalid' : 'valid';
        if (res.exists) {
          this.showToast('El correo ingresado ya está registrado.', 'error');
        }
      },
      error: () => {
        this.correoStatus = null;
      }
    });
  }

  onTelefonoBlur() {
    if (!this.newClient.telefono || this.newClient.telefono.trim().length < 10) {
      this.telefonoStatus = null;
      return;
    }
    this.telefonoStatus = 'loading';
    this.adminCrmService.checkTelefono(this.newClient.telefono).subscribe({
      next: (res) => {
        this.telefonoStatus = res.exists ? 'invalid' : 'valid';
        if (res.exists) {
          this.showToast('El teléfono ingresado ya está registrado.', 'error');
        }
      },
      error: () => {
        this.telefonoStatus = null;
      }
    });
  }

  requestSaveNewClient() {
    this.newClientErrorMessage = '';
    this.newClientErrors = {};
    let hasError = false;
    
    if (!this.newClient.correo || !this.newClient.correo.includes('@') || this.correoStatus === 'invalid') {
      if (!hasError && this.correoStatus === 'invalid') this.showToast('El correo ya está registrado.', 'error');
      else if (!hasError) this.showToast('Ingresa un correo electrónico válido.', 'warning');
      this.newClientErrors['correo'] = true;
      hasError = true;
    }
    if (!this.newClient.pass || this.newClient.pass.trim().length < 6) {
      if (!hasError) this.showToast('La contraseña es obligatoria (mínimo 6 caracteres).', 'warning');
      this.newClientErrors['pass'] = true;
      hasError = true;
    }
    if (!this.newClient.nombreCompleto || this.newClient.nombreCompleto.trim().length < 3) {
      if (!hasError) this.showToast('Ingresa un nombre completo válido (mínimo 3 caracteres).', 'warning');
      this.newClientErrors['nombreCompleto'] = true;
      hasError = true;
    }
    if (!this.newClient.telefono || this.newClient.telefono.trim().length < 10 || this.telefonoStatus === 'invalid') {
      if (!hasError && this.telefonoStatus === 'invalid') this.showToast('El teléfono ya está registrado.', 'error');
      else if (!hasError) this.showToast('Ingresa un teléfono válido (mínimo 10 dígitos).', 'warning');
      this.newClientErrors['telefono'] = true;
      hasError = true;
    }
    if (!this.newClient.fechaNacimiento) {
      if (!hasError) this.showToast('La fecha de nacimiento es obligatoria para el KYC.', 'warning');
      this.newClientErrors['fechaNacimiento'] = true;
      hasError = true;
    } else {
      const birthDate = new Date(this.newClient.fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        if (!hasError) this.showToast('El cliente debe ser mayor de 18 años.', 'error');
        this.newClientErrors['fechaNacimiento'] = true;
        hasError = true;
      }
    }
    if (!this.newClient.experienciaTrading || this.newClient.experienciaTrading.trim() === '') {
      if (!hasError) this.showToast('Selecciona el nivel de experiencia en trading.', 'warning');
      this.newClientErrors['experienciaTrading'] = true;
      hasError = true;
    }

    if (hasError) return;
    
    this.loadingService.show('radar', 'Registrando cliente...');
    const payload = {
      correo: this.newClient.correo,
      pass: this.newClient.pass,
      nombreCompleto: this.newClient.nombreCompleto,
      nombrePila: this.newClient.nombrePila,
      telefono: this.newClient.telefono,
      estadoResidencia: this.newClient.estadoResidencia,
      fechaNacimiento: this.newClient.fechaNacimiento,
      profesion: this.newClient.profesion,
      experienciaTrading: this.newClient.experienciaTrading,
      hobbie: this.newClient.hobbie
    };
    
    this.adminCrmService.createCliente(payload).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Cliente registrado exitosamente.');
        this.closeNewClientModal();
        this.loadClients();
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al registrar el cliente. Posiblemente el correo ya existe.', 'error');
      }
    });
  }

  setTab(tab: 'posiciones' | 'perfil' | 'kyc' | 'caja' | 'notas') {
    this.activeTab = tab;
    if (tab === 'caja' && this.selectedClient) {
      this.loadTransaccionesCaja();
    } else if (tab === 'posiciones' && this.selectedClient) {
      this.loadApuestasCliente();
    } else if (tab === 'perfil' && this.selectedClient) {
      this.loadPerfilCliente();
      this.loadTransaccionesCaja(); // Necesario para calcular totales de depósitos y retiros
      this.loadAsignaciones();
    } else if (tab === 'notas' && this.selectedClient) {
      this.loadNotasCliente();
    }
  }

  setFiltroPosiciones(filtro: 'ABIERTO' | 'CERRADO') {
    this.filtroPosiciones = filtro;
    this.loadApuestasCliente();
  }

  loadAsignaciones() {
    if (!this.selectedClient) return;
    this.adminCrmService.getAsignacionesCliente(this.selectedClient.id).subscribe({
      next: (data) => {
        // Solo mostrar asignaciones de Ejecutivos y Gerentes (los que están en activeAdmins)
        this.clientAsignaciones = data.filter((asig: any) => 
          this.activeAdmins.some(admin => admin.idUsuario === asig.idAdmin)
        );
      },
      error: (err) => console.error(err)
    });
  }

  loadNotasCliente() {
    if (!this.selectedClient) return;
    this.loadingService.show('radar', 'Cargando notas...');
    this.adminCrmService.getNotasCliente(this.selectedClient.id).subscribe({
      next: (data) => {
        this.loadingService.hide();
        this.notasCliente = data;
        this.isAddingNota = false;
        this.nuevaNotaText = '';
      },
      error: (err) => {
        this.loadingService.hide();
        console.error('Error fetching notas', err);
      }
    });
  }

  toggleAddNota() {
    this.isAddingNota = !this.isAddingNota;
    this.nuevaNotaText = '';
  }

  procesarNota() {
    if (!this.nuevaNotaText.trim()) return;
    this.showNotaConfirmModal = true;
  }

  cancelNotaConfirm() {
    this.showNotaConfirmModal = false;
  }

  confirmarGuardarNota() {
    this.showNotaConfirmModal = false;
    this.loadingService.show('radar', 'Guardando nota...');
    
    const authUser = JSON.parse(sessionStorage.getItem('authUser') || '{}');
    const adminId = authUser.idUsuario || this.authService.currentUser()?.id || 1; // Fallback

    const payload = {
      cliente: { idUsuario: this.selectedClient.id },
      colaborador: { idUsuario: adminId },
      nota: this.nuevaNotaText.trim()
    };

    this.adminCrmService.createNota(payload).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Nota guardada correctamente.');
        this.loadNotasCliente();
      },
      error: (err) => {
        this.loadingService.hide();
        console.error('Error guardando nota', err);
        this.showToast('Error al guardar la nota.');
      }
    });
  }

  // Legacy method, not used in HTML anymore, handled by blob fetching
  getMediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    return `${environment.apiUrl}/usuarios/media?path=${encodeURIComponent(path)}`;
  }

  loadPerfilCliente() {
    this.adminCrmService.getClienteById(this.selectedClient.id).subscribe({
      next: (data) => {
        // Refrescar los datos del cliente seleccionado en tiempo real
        this.selectedClient.name = data.nombreCompleto || 'Sin Nombre';
        this.selectedClient.nombrePila = data.nombrePila;
        this.selectedClient.telefono = data.telefono;
        this.selectedClient.estadoResidencia = data.estadoResidencia;
        this.selectedClient.profesion = data.profesion;
        this.selectedClient.experienciaTrading = data.experienciaTrading;
        this.selectedClient.hobbie = data.hobbie;
        this.selectedClient.balance = data.balance || 0;
        this.selectedClient.margen = data.margenUtilizado || 0;
        this.selectedClient.margenLibre = data.margenLibre || 0;
        this.selectedClient.fechaNacimiento = data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString().split('T')[0] : '';
        this.selectedClient.fechaRegistro = data.fechaRegistro;
        this.selectedClient.urlFotoPerfil = data.urlFotoPerfil;
        this.selectedClient.urlIneFrente = data.urlIneFrente;
        this.selectedClient.urlIneReverso = data.urlIneReverso;
        if (data.usuarioAuth) {
          this.selectedClient.password = data.usuarioAuth.pass;
          this.selectedClient.email = data.usuarioAuth.correo;
        }
      },
      error: (err) => console.error('Error fetching perfil', err)
    });
  }

  loadTransaccionesCaja() {
    this.adminCrmService.getTransaccionesUsuario(this.selectedClient.id).subscribe({
      next: (data) => {
        this.cajaHistorial = data.map(t => ({
          id: t.idTransaccion,
          tipo: t.tipoTransaccion,
          metodo: t.metodoPago,
          monto: t.monto,
          referencia: t.detallesCuenta,
          notas: t.adminAprobador?.correo || '',
          fecha: t.fechaSolicitud,
          estado: t.estatus
        })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        this.totalDepositosAprobados = this.cajaHistorial
          .filter(t => t.tipo === 'DEPOSITO' && t.estado === 'APROBADO')
          .reduce((acc, t) => acc + t.monto, 0);

        this.totalRetirosAprobados = this.cajaHistorial
          .filter(t => t.tipo === 'RETIRO' && t.estado === 'APROBADO')
          .reduce((acc, t) => acc + t.monto, 0);
      },
      error: (err) => console.error(err)
    });
  }

  procesarCaja() {
    this.cajaError = '';
    this.cajaExito = '';

    if (!this.cajaForm.monto || this.cajaForm.monto <= 0) {
      this.showToast('Ingresa un monto válido mayor a 0.', 'error');
      return;
    }

    if (this.cajaForm.tipo === 'RETIRO' && this.selectedClient.margenLibre < this.cajaForm.monto) {
      this.showToast('Fondos insuficientes. El monto supera el margen libre del cliente.', 'error');
      return;
    }

    this.showCajaConfirmModal = true;
  }

  cancelCajaConfirm() {
    this.showCajaConfirmModal = false;
  }

  confirmarProcesarCaja() {
    this.showCajaConfirmModal = false;
    this.loadingService.show('radar', 'Procesando transacción...');
    
    const adminId = this.authService.currentUser()?.id || null;

    const payload = {
      usuario: { idUsuario: this.selectedClient.id },
      tipoTransaccion: this.cajaForm.tipo,
      monto: this.cajaForm.monto,
      metodoPago: this.cajaForm.metodo,
      detallesCuenta: this.cajaForm.referencia + ' ' + this.cajaForm.notas,
      idAdmin: adminId
    };

    this.adminCrmService.solicitarCaja(payload).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Transacción solicitada correctamente. Pasó a estado PENDIENTE de Aprobación.', 'success');
        this.cajaForm = { tipo: 'DEPOSITO', metodo: 'TRANSFERENCIA', monto: null, referencia: '', notas: '' };
        this.loadTransaccionesCaja();
      },
      error: (err) => {
        this.loadingService.hide();
        this.showToast('Error al procesar: ' + err.message, 'error');
      }
    });
  }

  // Position Actions
  confirmClosePosition(id: string) {
    this.positionToClose = id;
    this.showCloseConfirmModal = true;
  }

  cancelClosePosition() {
    this.showCloseConfirmModal = false;
    this.positionToClose = null;
  }



  // Profile Save
  requestSaveProfile() {
    this.showSaveConfirmModal = true;
  }

  cancelSaveProfile() {
    this.showSaveConfirmModal = false;
  }

  executeSaveProfile() {
    this.showSaveConfirmModal = false;
    this.loadingService.show('radar', 'Actualizando perfil de inversor...');

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
        this.showToast('Perfil actualizado correctamente.');
        this.loadClients(); // Reload data
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al actualizar el perfil.');
      }
    });
  }

  // KYC Actions
  approveKyc() {
    this.loadingService.show('radar', 'Aprobando documentos...');
    this.adminCrmService.updateKyc(this.selectedClient.id, 'APROBADO').subscribe({
      next: () => {
        this.loadingService.hide();
        this.selectedClient.estadoKyc = 'APROBADO';
        this.showToast('KYC Aprobado. El cliente ahora tiene nivel 2.');
        this.loadClients();
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al aprobar KYC.');
      }
    });
  }

  rejectKyc() {
    this.loadingService.show('radar', 'Rechazando documentos...');
    this.adminCrmService.updateKyc(this.selectedClient.id, 'RECHAZADO').subscribe({
      next: () => {
        this.loadingService.hide();
        this.selectedClient.estadoKyc = 'RECHAZADO';
        this.showToast('KYC Rechazado. Se notificará al cliente.');
        this.loadClients();
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al rechazar KYC.');
      }
    });
  }

  guardarEstado() {
    this.loadingService.show('radar', 'Actualizando estado...');
    this.adminCrmService.updateEstado(this.selectedClient.id, this.selectedClient.status).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Estado actualizado a ' + this.selectedClient.status);
        this.loadClients();
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al actualizar estado.');
      }
    });
  }

  guardarAsignacion() {
    this.loadingService.show('radar', 'Guardando asignación...');
    // Assuming you select only 1 manager for simplicity, or we can just pick the first one
    const idAdmin = 1; // You'd realistically resolve this from a list of admins
    this.adminCrmService.asignarEjecutivo(this.selectedClient.id, idAdmin).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Asignación guardada.');
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al guardar asignación.');
      }
    });
  }

  asignarEjecutivoBtn() {
    if (!this.selectedAdminId) return;
    this.loadingService.show('radar', 'Asignando ejecutivo...');
    this.adminCrmService.asignarEjecutivo(this.selectedClient.id, this.selectedAdminId).subscribe({
      next: () => {
        this.loadingService.hide();
        this.loadAsignaciones();
        this.selectedAdminId = null;
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
      }
    });
  }

  desasignarEjecutivoBtn(idAdmin: number) {
    this.loadingService.show('radar', 'Desasignando ejecutivo...');
    this.adminCrmService.desasignarEjecutivo(this.selectedClient.id, idAdmin).subscribe({
      next: () => {
        this.loadingService.hide();
        this.loadAsignaciones();
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
      }
    });
  }

  getAdminName(idAdmin: number): string {
    const admin = this.activeAdmins.find(a => a.idUsuario === idAdmin);
    return admin ? `${admin.nombreCompleto} (${admin.departamento})` : `Ejecutivo #${idAdmin}`;
  }

  enviarResetPasswordAdmin() {
    if (!this.selectedClient.email) return;
    this.loadingService.show('radar', 'Enviando reseteo...');
    this.adminCrmService.resetPassword(this.selectedClient.email).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Correo de recuperación enviado.');
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al enviar correo.');
      }
    });
  }

  guardarPosicionIndividual(pos: any) {
    this.loadingService.show('radar', 'Guardando posición...');
    const payload = { margen: pos.monto_usd, swap: 0 };
    this.adminCrmService.actualizarPosicion(pos.id, payload).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast('Posición actualizada.');
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al actualizar posición.');
      }
    });
  }

  cerrarPosicionAdmin(id: string) {
    this.confirmClosePosition(id);
  }

  executeClosePosition() {
    this.showCloseConfirmModal = false;
    if (!this.positionToClose) return;
    this.loadingService.show('radar', 'Cerrando posición a precio de mercado...');
    
    const posIdNum = typeof this.positionToClose === 'string' ? parseInt(this.positionToClose, 10) : this.positionToClose;
    const pos = this.mockPositions.find(p => p.id === posIdNum);
    const pnl = pos?.pnl || 0;
    const adminId = this.authService.currentUser()?.id;

    this.adminCrmService.cerrarPosicion(this.positionToClose, pnl, adminId).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showToast(`Posición ${this.positionToClose} cerrada exitosamente.`);
        this.positionToClose = null;
        this.loadApuestasCliente(); // Reload UI
        this.loadPerfilCliente(); // Reload Margen/Balance
      },
      error: (err) => {
        this.loadingService.hide();
        console.error(err);
        this.showToast('Error al cerrar posición.');
        this.positionToClose = null;
      }
    });
  }

  showToast(msg: string, type: 'success' | 'warning' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  openFullscreenImage(url: any) {
    if (!url) return;
    
    // Si viene de un evento de click en la imagen (para tomar el fallback si se activó)
    if (url && url.target && url.target.src) {
      this.fullscreenImageUrl = url.target.src;
    } else {
      this.fullscreenImageUrl = url;
    }
    this.isFullscreenImageOpen = true;
  }

  closeFullscreenImage() {
    this.isFullscreenImageOpen = false;
    this.fullscreenImageUrl = null;
  }
}
