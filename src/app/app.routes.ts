import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { ClientDashboardComponent } from './features/client-dashboard/client-dashboard.component';
import { ClientHistoryComponent } from './features/client-history/client-history.component';
import { ClientPositionsComponent } from './features/client-positions/client-positions.component';
import { ClientProfileComponent } from './features/client-profile/client-profile.component';
import { AdminCajaComponent } from './features/admin-caja/admin-caja.component';
import { AdminCrmComponent } from './features/admin-crm/admin-crm.component';
import { AdminAuditComponent } from './features/admin-audit/admin-audit.component';
import { AdminGlobalComponent } from './features/admin-global/admin-global.component';
import { AdminStaffComponent } from './features/admin-staff/admin-staff.component';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { 
        path: 'app', 
        component: MainLayoutComponent,
        children: [
            { path: 'dashboard', component: ClientDashboardComponent },
            { path: 'history', component: ClientHistoryComponent },
            { path: 'positions', component: ClientPositionsComponent },
            { path: 'profile', component: ClientProfileComponent },
            { path: 'admin/caja', component: AdminCajaComponent },
            { path: 'admin/crm', component: AdminCrmComponent },
            { path: 'admin/audit', component: AdminAuditComponent },
            { path: 'admin/global', component: AdminGlobalComponent },
            { path: 'admin/staff', component: AdminStaffComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    { path: '**', redirectTo: 'auth/login' }
];
