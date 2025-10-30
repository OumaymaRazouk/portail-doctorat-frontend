import { Component } from '@angular/core';
import { LayoutComponent } from '../components/layout.component';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [
    LayoutComponent
  ],
  template: `
    <app-layout title="Espace Encadrant">
      <p>Bienvenue Encadrant 👨‍🏫</p>
      <p>Validez et suivez les dossiers de vos doctorants.</p>
    </app-layout>
  `
})
export class EncadrantDashboardComponent {}
