import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { NotFoundComponent } from './features/errors/not-found.component';
import { ForbiddenComponent } from './shared/forbidden/forbidden';
import { DoctorantDashboardComponent } from './features/dashboards/doctorant-dashboard.component';
import { AdminDashboardComponent } from './features/dashboards/admin-dashboard.component';
import { EncadrantDashboardComponent } from './features/dashboards/encadrant-dashboard.component';
import { SuperAdminDashboardComponent } from './features/dashboards/super-admin-dashboard.component';
import { CreateInscriptionComponent } from './features/inscriptions/create-inscription.component';
import { CreateReinscriptionComponent } from './features/inscriptions/create-reinscription.component';
import { EditInscriptionComponent } from './features/inscriptions/edit-inscription.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/auth.models';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forbidden', component: ForbiddenComponent },

  { path: 'dashboard/doctorant', component: DoctorantDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DOCTORANT'] as Role[] } },
  { path: 'dashboard/admin', component: AdminDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['PERSONNEL_ADMINISTRATIF','SUPERADMIN'] as Role[] } },
  { path: 'dashboard/encadrant', component: EncadrantDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DIRECTEUR','SUPERADMIN'] as Role[] } },
  { path: 'dashboard/super-admin', component: SuperAdminDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['SUPERADMIN'] as Role[] } },

  { path: 'inscriptions/nouvelle', component: CreateInscriptionComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DOCTORANT'] as Role[] } },
  { path: 'inscriptions/:id/edit', component: EditInscriptionComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DOCTORANT'] as Role[] } },
  { path: 'reinscriptions/nouvelle', component: CreateReinscriptionComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DOCTORANT'] as Role[] } },

  { path: '**', component: NotFoundComponent }
];
