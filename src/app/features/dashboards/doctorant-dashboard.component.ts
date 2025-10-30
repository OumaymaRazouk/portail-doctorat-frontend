import { Component } from '@angular/core';
import {LayoutComponent} from '../components/layout.component';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-doctorant-dashboard',
  standalone: true,
  imports: [LayoutComponent, RouterLink],
  template: `
    <app-layout title="Espace Doctorant">
      <p>Bienvenue Doctorant 👨‍🎓</p>
      <p>Gérez vos inscriptions et dossiers ici.</p>
      <p>
        <a routerLink="/inscriptions/nouvelle">Créer une nouvelle inscription</a>
      </p>
    </app-layout>
  `
})
export class DoctorantDashboardComponent {}
