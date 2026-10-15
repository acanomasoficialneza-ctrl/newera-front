import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuditService, AuditLog } from '../../core/services/admin-audit.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './admin-audit.component.html'
})
export class AdminAuditComponent implements OnInit {
  selectedDate: string = '';
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];

  currentPage: number = 0;
  totalPages: number = 1;
  totalElements: number = 0;
  pageSize: number = 10;

  constructor(private auditService: AdminAuditService) {}

  ngOnInit() {
    const today = new Date();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.selectedDate = `${today.getFullYear()}-${m}-${day}`;
    
    this.loadLogs(0);
  }

  loadLogs(page: number = 0) {
    this.auditService.getLogsPaginados(this.selectedDate, page, this.pageSize).subscribe({
      next: (res) => {
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.filteredLogs = res.content || [];
      },
      error: (err) => console.error('Error loading audit logs', err)
    });
  }

  onPageChange(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadLogs(newPage);
    }
  }

  onDateChange() {
    this.currentPage = 0;
    this.loadLogs(0);
  }

  downloadLogs() {
    if (this.filteredLogs.length === 0) return;
    
    const headers = ['Nivel', 'Fecha/Hora', 'IP', 'Mensaje'];
    const rows = this.filteredLogs.map(log => [
      log.nivel,
      log.fechaEvento,
      log.direccionIp,
      `"${log.mensaje.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join('\t'), ...rows.map(e => e.join('\t'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const strTime = `${hours.toString().padStart(2, '0')}_${now.getMinutes().toString().padStart(2, '0')}_${ampm}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_${this.selectedDate}_${strTime}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
