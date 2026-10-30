import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Verificar que exista una sesion
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// Verificar que el usuario tenga el rol correcto
export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');
  const rol = sessionStorage.getItem('rol');

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos = route.data['roles'] as string[] || [];

  if (rolesPermitidos.includes(rol || '')) {
    return true;
  }

  // Enviar al usuario a su propio panel
  switch (rol) {
    case 'ROLE_ADMIN':
      return router.createUrlTree(['/admin']);

    case 'ROLE_DOCTOR':
      return router.createUrlTree(['/doctor']);

    case 'ROLE_PATIENT':
      return router.createUrlTree(['/paciente']);

    default:
      return router.createUrlTree(['/login']);
  }
};