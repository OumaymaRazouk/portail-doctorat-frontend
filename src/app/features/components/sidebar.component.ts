import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, HasRoleDirective],
  template: `
  <aside class="sidebar">
    <ul class="nav-list">
      <li class="nav-item" *hasRole="'DOCTORANT'">
        <a routerLink="/dashboard/doctorant" class="nav-link">Espace Doctorant</a>
      </li>
      <li class="nav-item" *hasRole="'DOCTORANT'">
        <a routerLink="/soutenances/mine" class="nav-link">Ma soutenance</a>
      </li>
      <li class="nav-item" *hasRole="['DIRECTEUR','SUPERADMIN']">
        <a routerLink="/dashboard/encadrant" class="nav-link">Espace Directeur</a>
      </li>
      <li class="nav-item" *hasRole="['DIRECTEUR','SUPERADMIN']">
        <a routerLink="/soutenances/directeur" class="nav-link">Soutenances (Directeur)</a>
      </li>
      <li class="nav-item" *hasRole="['PERSONNEL_ADMINISTRATIF','SUPERADMIN']">
        <a routerLink="/dashboard/admin" class="nav-link">Espace Administratif</a>
      </li>
      <li class="nav-item" *hasRole="['PERSONNEL_ADMINISTRATIF','SUPERADMIN']">
        <a routerLink="/soutenances/admin" class="nav-link">Soutenances (Admin)</a>
      </li>
      <li class="nav-item" *hasRole="'SUPERADMIN'">
        <a routerLink="/dashboard/super-admin" class="nav-link">Espace Super Admin</a>
      </li>
    </ul>
  </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      min-width: 240px;
      background-color: #020617;
      color: var(--secondary-foreground);
      padding: 1.25rem 1.5rem;
      border-right: 1px solid rgba(15, 23, 42, 0.6);
      box-shadow: 2px 0 12px rgba(15, 23, 42, 0.45);
      min-height: calc(100vh - 64px);
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      margin: 2px 0;
    }

    .nav-link {
      display: block;
      color: #e5e7eb;
      text-decoration: none;
      padding: 10px 14px;
      border-radius: 999px;
      transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .nav-link:hover {
      color: #f9fafb;
      background-color: rgba(37, 99, 235, 0.2);
      transform: translateX(2px);
    }

    .nav-link.active {
      color: #f9fafb;
      background-color: rgba(37, 99, 235, 0.9);
      font-weight: 600;
    }
  `]
})
export class SidebarComponent {}
