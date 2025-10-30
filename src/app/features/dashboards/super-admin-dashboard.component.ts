import { Component } from '@angular/core';
import { LayoutComponent } from '../components/layout.component';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    LayoutComponent
  ],
  template: `
    <app-layout title="Espace Super Admin">
      <p>Bienvenue Super Admin 👑</p>
      <p>Vous pouvez gérer tous les utilisateurs et les rôles.</p>
    </app-layout>
  `
})
export class SuperAdminDashboardComponent {}
