import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      width: 100%;
    }
  `]
})
export class AppComponent {
  constructor(private router: Router) {
    console.log('AppComponent loaded');
    this.handleViewerRedirect();
  }

  private handleViewerRedirect() {
    if (typeof window === 'undefined') {
      return;
    }
    const search = window.location.search || '';
    if (!search.includes('viewer=')) {
      return;
    }
    const params = new URLSearchParams(search);
    const viewer = params.get('viewer');
    if (!viewer) {
      return;
    }
    try {
      const data = JSON.parse(viewer);
      const id = (data as any).id;
      const fileName = (data as any).fileName;
      const type = (data as any).type || 'inscription';
      if (id && fileName) {
        if (type === 'soutenance') {
          this.router.navigate(['/soutenances', id, 'pdf-viewer', fileName]);
        } else {
          this.router.navigate(['/inscriptions', id, 'pdf-viewer', fileName]);
        }
      }
    } catch {
      // ignore malformed viewer payload
    }
  }
}
