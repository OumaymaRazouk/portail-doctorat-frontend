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
import { InscriptionDetailComponent } from './features/inscriptions/inscription-detail.component';
import { InscriptionAttachmentViewerComponent } from './features/inscriptions/inscription-attachment-viewer.component';
import { InscriptionPdfViewerComponent } from './features/inscriptions/inscription-pdf-viewer.component';
import { SoutenanceDoctorantComponent } from './features/soutenances/soutenance-doctorant.component';
import { SoutenanceDirecteurComponent } from './features/soutenances/soutenance-directeur.component';
import { SoutenanceAdminComponent } from './features/soutenances/soutenance-admin.component';
import { SoutenancePdfViewerComponent } from './features/soutenances/soutenance-pdf-viewer.component';
import { UsersAdminComponent } from './features/users/users-admin.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/auth.models';
import { ActivateAccountComponent } from './features/auth/activate-account.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate', component: ActivateAccountComponent },
  { path: 'forbidden', component: ForbiddenComponent },

  { path: 'dashboard/doctorant', component: DoctorantDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['CANDIDAT','DOCTORANT'] as Role[] } },
  { path: 'dashboard/admin', component: AdminDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['PERSONNEL_ADMINISTRATIF','SUPERADMIN'] as Role[] } },
  { path: 'dashboard/encadrant', component: EncadrantDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DIRECTEUR','SUPERADMIN'] as Role[] } },
  { path: 'dashboard/super-admin', component: SuperAdminDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['SUPERADMIN'] as Role[] } },

  { path: 'admin/users', component: UsersAdminComponent, canActivate: [authGuard, roleGuard], data: { roles: ['PERSONNEL_ADMINISTRATIF','SUPERADMIN'] as Role[] } },

  { path: 'inscriptions/nouvelle', component: CreateInscriptionComponent, canActivate: [authGuard, roleGuard], data: { roles: ['CANDIDAT','DOCTORANT'] as Role[] } },
  { path: 'inscriptions/:id/edit', component: EditInscriptionComponent, canActivate: [authGuard, roleGuard], data: { roles: ['CANDIDAT','DOCTORANT'] as Role[] } },
  { path: 'inscriptions/:id/consultation', component: InscriptionDetailComponent, canActivate: [authGuard, roleGuard], data: { roles: ['CANDIDAT','DOCTORANT','DIRECTEUR','PERSONNEL_ADMINISTRATIF','SUPERADMIN'] as Role[] } },
  { path: 'inscriptions/:id/attachments/:fileName', component: InscriptionAttachmentViewerComponent, canActivate: [authGuard, roleGuard], data: { roles: ['CANDIDAT','DOCTORANT','DIRECTEUR','PERSONNEL_ADMINISTRATIF','SUPERADMIN'] as Role[] } },
  { path: 'inscriptions/:id/pdf-viewer/:fileName', component: InscriptionPdfViewerComponent, canActivate: [authGuard, roleGuard], data: { roles: ['CANDIDAT','DOCTORANT','DIRECTEUR','PERSONNEL_ADMINISTRATIF','SUPERADMIN'] as Role[] } },
  { path: 'reinscriptions/nouvelle', component: CreateReinscriptionComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DOCTORANT'] as Role[] } },
  { path: 'soutenances/mine', component: SoutenanceDoctorantComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DOCTORANT'] as Role[] } },
  { path: 'soutenances/directeur', component: SoutenanceDirecteurComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DIRECTEUR','SUPERADMIN'] as Role[] } },
  { path: 'soutenances/admin', component: SoutenanceAdminComponent, canActivate: [authGuard, roleGuard], data: { roles: ['PERSONNEL_ADMINISTRATIF','SUPERADMIN'] as Role[] } },
  { path: 'soutenances/:id/pdf-viewer/:fileName', component: SoutenancePdfViewerComponent, canActivate: [authGuard, roleGuard], data: { roles: ['DOCTORANT','DIRECTEUR','PERSONNEL_ADMINISTRATIF','SUPERADMIN'] as Role[] } },

  { path: '**', component: NotFoundComponent }
];
