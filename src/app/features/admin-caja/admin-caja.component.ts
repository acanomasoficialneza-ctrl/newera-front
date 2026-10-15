import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService, TransaccionCaja } from '../../core/services/caja.service';
import { NotificationAlertService } from '../../core/services/notification-alert.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

interface RequestModel {
  id: number;
  date: string | Date;
  clientName: string;
  clientEmail: string;
  type: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: string;
  resolvedBy?: string;
  raw: TransaccionCaja;
}

@Component({
  selector: 'app-admin-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  providers: [],
  templateUrl: './admin-caja.component.html'
})
export class AdminCajaComponent implements OnInit {
  // Tab State
  activeTab: 'PENDIENTES' | 'HISTORIAL' = 'PENDIENTES';

  // Pagination State
  currentPage: number = 0;
  totalPages: number = 1;
  totalElements: number = 0;
  pageSize: number = 10;

  // Modal State
  showConfirmModal: boolean = false;
  confirmAction: 'APROBAR' | 'RECHAZAR' | null = null;
  selectedRequest: RequestModel | null = null;
  confirmNote: string = '';
  toastMessage: string | null = null;
  
  requests: RequestModel[] = [];
  approvedRequests: RequestModel[] = [];

  constructor(
    private cajaService: CajaService,
    private alertService: NotificationAlertService
  ) {}

  ngOnInit() {
    this.loadPendientes(0);
  }

  setTab(tab: 'PENDIENTES' | 'HISTORIAL') {
    this.activeTab = tab;
    this.currentPage = 0;
    if (tab === 'PENDIENTES') {
      this.loadPendientes(0);
    } else {
      this.loadHistorial(0);
    }
  }

  mapTransaccion(t: TransaccionCaja): RequestModel {
    return {
      id: t.idTransaccion,
      date: t.fechaSolicitud,
      clientName: t.usuario?.correo?.split('@')[0] || 'Desconocido',
      clientEmail: t.usuario?.correo || 'Sin correo',
      type: t.tipoTransaccion,
      amount: t.monto,
      method: t.metodoPago || 'N/A',
      accountDetails: t.detallesCuenta || 'N/A',
      status: t.estatus,
      resolvedBy: t.adminAprobador?.correo || 'N/A',
      raw: t
    };
  }

  loadPendientes(page: number = 0) {
    this.cajaService.getTransaccionesPendientesPaginadas(page, this.pageSize).subscribe({
      next: (res) => {
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.requests = (res.content || []).map(t => this.mapTransaccion(t));
      },
      error: (err) => console.error('Error loading pending caja data', err)
    });
  }

  loadHistorial(page: number = 0) {
    this.cajaService.getTransaccionesHistorialPaginadas(page, this.pageSize).subscribe({
      next: (res) => {
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.approvedRequests = (res.content || []).map(t => this.mapTransaccion(t));
      },
      error: (err) => console.error('Error loading historial caja data', err)
    });
  }

  onPageChange(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      if (this.activeTab === 'PENDIENTES') {
        this.loadPendientes(newPage);
      } else {
        this.loadHistorial(newPage);
      }
    }
  }

  get pendingRetirosTotal(): number {
    return this.requests.filter(r => r.type === 'RETIRO').reduce((acc, curr) => acc + curr.amount, 0);
  }

  get pendingDepositosTotal(): number {
    return this.requests.filter(r => r.type === 'DEPOSITO').reduce((acc, curr) => acc + curr.amount, 0);
  }

  openConfirm(req: RequestModel, action: 'APROBAR' | 'RECHAZAR') {
    this.selectedRequest = req;
    this.confirmAction = action;
    this.confirmNote = '';
    this.showConfirmModal = true;
  }

  cancelConfirm() {
    this.showConfirmModal = false;
    this.selectedRequest = null;
    this.confirmAction = null;
    this.confirmNote = '';
  }

  confirmActionExecute() {
    if(this.selectedRequest && this.confirmAction) {
       // SuperAdmin ID hardcoded to 1 for now
       const idAdmin = 1; 
       const reqId = this.selectedRequest.id;
       const reqType = this.selectedRequest.type;
       const reqAmount = this.selectedRequest.amount;

       if (this.confirmAction === 'APROBAR') {
         this.cajaService.aprobarTransaccion(this.selectedRequest.id, idAdmin, this.confirmNote).subscribe({
           next: () => {
             this.showToast(`Petición APROBADA correctamente`);
             this.alertService.notify({
               title: 'Caja: Petición Aprobada',
               message: `Petición #${reqId} (${reqType} por $${reqAmount} USD) aprobada con éxito.`,
               type: 'success'
             });
             if (this.activeTab === 'PENDIENTES') this.loadPendientes(this.currentPage);
             else this.loadHistorial(this.currentPage);
           },
           error: (err) => {
             console.error(err);
             this.showToast('Error al aprobar la transacción');
             this.alertService.notify({
               title: 'Error en Caja',
               message: 'No se pudo aprobar la transacción.',
               type: 'error'
             });
           }
         });
       } else {
         this.cajaService.rechazarTransaccion(this.selectedRequest.id, idAdmin, this.confirmNote).subscribe({
           next: () => {
             this.showToast(`Petición RECHAZADA correctamente`);
             this.alertService.notify({
               title: 'Caja: Petición Rechazada',
               message: `Petición #${reqId} ha sido rechazada.`,
               type: 'warning'
             });
             if (this.activeTab === 'PENDIENTES') this.loadPendientes(this.currentPage);
             else this.loadHistorial(this.currentPage);
           },
           error: (err) => {
             console.error(err);
             this.showToast('Error al rechazar la transacción');
           }
         });
       }
    }
    this.cancelConfirm();
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}
