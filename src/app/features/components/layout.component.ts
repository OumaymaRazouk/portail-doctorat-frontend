import { Component, Input } from '@angular/core';
import {HeaderComponent} from './header.component';
import {SidebarComponent} from './sidebar.component';
import {FooterComponent} from './footer.component';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FooterComponent],
  template: `
  <div class="layout">
    <app-header></app-header>
    <div class="layout-body">
      <app-sidebar></app-sidebar>
      <main class="content">
        <h3 class="page-title">{{ title }}</h3>
        <ng-content></ng-content>
      </main>
    </div>
    <app-footer></app-footer>
  </div>
  `,
  styles: [`
    .layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
    }
    
    .layout-body { 
      display: flex; 
      flex: 1;
      width: 100%;
    }
    
    .content { 
      flex: 1; 
      background: #fff; 
      border-radius: 8px; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
      margin: 20px;
      padding: 2rem;
      min-height: calc(100vh - 140px);
      overflow-y: auto;
    }
    
    .page-title {
      margin: 0 0 1.5rem 0;
      color: #2d3748;
      font-size: 1.75rem;
      font-weight: 600;
    }
  `]
})
export class LayoutComponent {
  @Input() title = '';
}
