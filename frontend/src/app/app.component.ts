import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header>
      <h1>Microservice Frontend</h1>
    </header>
    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [`
    header {
      background-color: #1976d2;
      color: white;
      padding: 1rem 2rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
    }
  `]
})
export class AppComponent {
  title = 'angular-frontend';
}
