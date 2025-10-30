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
      <li class="nav-item" *hasRole="'ENCADRANT'">
        <a routerLink="/dashboard/encadrant" class="nav-link">Espace Encadrant</a>
      </li>
      <li class="nav-item" *hasRole="'ADMIN'">
        <a routerLink="/dashboard/admin" class="nav-link">Espace Admin</a>
      </li>
      <li class="nav-item" *hasRole="'SUPER_ADMIN'">
        <a routerLink="/dashboard/super-admin" class="nav-link">Espace Super Admin</a>
      </li>
    </ul>
  </aside>
  `,
  styles: [`
    .sidebar { 
      width: 250px; 
      min-width: 250px;
      background-color: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 1.5rem;
      box-shadow: 2px 0 4px rgba(0,0,0,0.1);
      min-height: calc(100vh - 100px);
    }
    
    .nav-list { 
      list-style: none; 
      padding: 0; 
      margin: 0;
      display: flex;
      flex-direction: column;
    }
    
    .nav-item { 
      margin: 4px 0; 
    }
    
    .nav-link { 
      display: block;
      color: #333; 
      text-decoration: none;
      padding: 12px 16px;
      border-radius: 8px;
      transition: all 0.2s ease;
      font-weight: 500;
    }
    
    .nav-link:hover { 
      color: #0d6efd; 
      background-color: #e7f3ff;
      transform: translateX(4px);
    }
    
    .nav-link.active {
      color: #0d6efd;
      background-color: #e7f3ff;
      font-weight: 600;
    }
  `]
})
export class SidebarComponent {}
