import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LayoutComponent } from './app/layout';
import { authInterceptor } from './app/app';
import { routes } from './app/app.routes';

// Iniciar Angular con rutas e interceptor JWT
bootstrapApplication(LayoutComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes)
  ]
}).catch(console.error);