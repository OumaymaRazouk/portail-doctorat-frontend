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
      background: transparent;
    }
    
    .layout-body { 
      display: flex; 
      flex: 1;
      width: 100%;
    }
    
    .content { 
      flex: 1; 
      background: var(--card-bg);
      border-radius: 18px; 
      box-shadow: var(--shadow-soft);
      margin: 24px auto;
      width: calc(100% - 48px);
      max-width: 1240px;
      padding: 2rem 2.25rem;
      min-height: calc(100vh - 140px);
      overflow-y: auto;
      border: 1px solid var(--border-color);
      backdrop-filter: blur(14px);
    }
    
    .page-title {
      margin: 0 0 1.5rem 0;
      color: var(--card-foreground);
      font-size: 1.75rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
    }
  `]
})
export class LayoutComponent {
  @Input() title = '';
}
