import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Componente principal de navegacion
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `
})
export class LayoutComponent {}