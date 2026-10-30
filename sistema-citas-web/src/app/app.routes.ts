import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./app').then(m => m.AppComponent)
  },
  {
    path: 'admin/reportes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () =>
      import('./pages/admin/reportes').then(m => m.ReportesPageComponent)
  },
  {
    path: 'secretaria',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_SECRETARY'] },
    loadComponent: () =>
      import('./pages/secretaria/secretaria').then(m => m.SecretariaPageComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () =>
      import('./pages/admin/admin').then(m => m.AdminPageComponent)
  },
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_DOCTOR'] },
    loadComponent: () =>
      import('./pages/doctor/doctor').then(m => m.DoctorPageComponent)
  },
  {
    path: 'paciente',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_PATIENT'] },
    loadComponent: () =>
      import('./pages/paciente/paciente').then(m => m.PacientePageComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
