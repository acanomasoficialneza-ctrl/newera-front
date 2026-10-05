import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService, TransaccionCaja } from '../../core/services/caja.service';

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
  imports: [CommonModule, FormsModule],
  providers: [],
  templateUrl: './admin-caja.component.html'
})
export class AdminCajaComponent implements OnInit {
  // Tab State
  activeTab: 'PENDIENTES' | 'HISTORIAL' = 'PENDIENTES';

  // Modal State
  showConfirmModal: boolean = false;
  confirmAction: 'APROBAR' | 'RECHAZAR' | null = null;
  selectedRequest: RequestModel | null = null;
  confirmNote: string = '';
  toastMessage: string | null = null;
  
  requests: RequestModel[] = [];
  approvedRequests: RequestModel[] = [];

  constructor(private cajaService: CajaService) {}

  ngOnInit() {
    this.loadPendientes();
  }

  setTab(tab: 'PENDIENTES' | 'HISTORIAL') {
    this.activeTab = tab;
    if (tab === 'PENDIENTES') {
      this.loadPendientes();
    } else {
      this.loadHistorial();
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

  loadPendientes() {
    this.cajaService.getTransaccionesPendientes().subscribe({
      next: (transacciones) => {
        this.requests = transacciones.map(t => this.mapTransaccion(t));
      },
      error: (err) => console.error('Error loading pending caja data', err)
    });
  }

  loadHistorial() {
    this.cajaService.getTransaccionesHistorial().subscribe({
      next: (transacciones) => {
        this.approvedRequests = transacciones.map(t => this.mapTransaccion(t));
      },
      error: (err) => console.error('Error loading historial caja data', err)
    });
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

       if (this.confirmAction === 'APROBAR') {
         this.cajaService.aprobarTransaccion(this.selectedRequest.id, idAdmin, this.confirmNote).subscribe({
           next: () => {
             this.showToast(`Petición APROBADA correctamente`);
             if (this.activeTab === 'PENDIENTES') this.loadPendientes();
             else this.loadHistorial();
           },
           error: (err) => {
             console.error(err);
             this.showToast('Error al aprobar la transacción');
           }
         });
       } else {
         this.cajaService.rechazarTransaccion(this.selectedRequest.id, idAdmin, this.confirmNote).subscribe({
           next: () => {
             this.showToast(`Petición RECHAZADA correctamente`);
             if (this.activeTab === 'PENDIENTES') this.loadPendientes();
             else this.loadHistorial();
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
