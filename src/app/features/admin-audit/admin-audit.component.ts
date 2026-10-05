import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuditService, AuditLog } from '../../core/services/admin-audit.service';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-audit.component.html'
})
export class AdminAuditComponent implements OnInit {
  selectedDate: string = '';
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];

  constructor(private auditService: AdminAuditService) {}

  ngOnInit() {
    const today = new Date();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.selectedDate = `${today.getFullYear()}-${m}-${day}`;
    
    this.loadLogs();
  }

  loadLogs() {
    this.auditService.getLogs(this.selectedDate).subscribe({
      next: (data) => {
        // Sort descending by date
        this.filteredLogs = data.sort((a, b) => new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime());
      },
      error: (err) => console.error('Error loading audit logs', err)
    });
  }

  onDateChange() {
    this.loadLogs();
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
