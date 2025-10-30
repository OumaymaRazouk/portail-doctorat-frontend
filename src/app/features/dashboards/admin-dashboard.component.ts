import { Component } from '@angular/core';
import { LayoutComponent } from '../components/layout.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    LayoutComponent
  ],
  template: `
    <app-layout title="Espace Administratif">
      <p>Bienvenue Admin 🧾</p>
      <p>Gérez les inscriptions et les soutenances.</p>
    </app-layout>
  `
})
export class AdminDashboardComponent {}
