import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="text-center mt-5">
    <h1 class="display-4 text-danger">404</h1>
    <p>Page non trouvée 😢</p>
    <a routerLink="/login" class="btn btn-primary">Retour à l’accueil</a>
  </div>
  `
})
export class NotFoundComponent {}
