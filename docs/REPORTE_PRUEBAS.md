# Reporte de pruebas y evidencias

**Fecha de registro:** 30 de octubre de 2026.  
**Entorno de prueba:** Windows 11, MySQL, Spring Boot local (8080), Angular local (4200), Swagger.

Este documento registra **solo los resultados confirmados durante la sesión de trabajo**; no reemplaza una batería de pruebas automatizadas ni implica cobertura total.

| ID | Caso | Resultado observado | Estado |
|---|---|---|---|
| P-01 | Compilación Angular (`npm.cmd run build`) | `Application bundle generation complete` y chunks de `admin`, `doctor`, `paciente` y `app` | Aprobado |
| P-02 | Inicio de sesión de médico | Login exitoso y navegación a `/doctor` | Aprobado |
| P-03 | Guard por rol | Usuario médico que visita `/admin` es redirigido a `/doctor` | Aprobado |
| P-04 | Cierre de sesión | Regresa a `/login` | Aprobado |
| P-05 | Validación formulario médico | Rechaza envío vacío; indica datos obligatorios y longitud mínima de colegiado | Aprobado |
| P-06 | Validación formulario horario | Rechaza hora de inicio posterior al fin | Aprobado |
| P-07 | Acceso a panel administrador | Se visualizan usuarios y panel; la actualización de datos funciona | Aprobado |
| P-08 | Documentación Swagger | Interfaz Swagger UI accesible en 8080 | Aprobado |
| P-09 | Seguridad y filtro de médicos | `GET /api/v1/doctors?especialidadId=1` autorizado con JWT devuelve HTTP 200 y médicos filtrados | Aprobado |
| P-10 | Agenda médica propia | Petición de doctor para su propia agenda devolvió 200 | Aprobado |
| P-11 | Agenda médica ajena | Petición de doctor para otra agenda devolvió 403 | Aprobado |
| P-12 | Comunicación web tras configuración CORS | Tablas de administrador se cargaron sin errores después del cambio | Aprobado (origen web) |

## Casos pendientes antes de la entrega definitiva

| ID | Caso | Estado |
|---|---|---|
| P-13 | Reserva de cita completa desde paciente hasta confirmación en backend | Repetir prueba final |
| P-14 | Cancelación de cita y consistencia de horario | Repetir prueba final |
| P-15 | Diagnóstico/receta y cambio a `COMPLETADA` | Repetir prueba final |
| P-16 | Edición y eliminación de registros con relaciones existentes | Pendiente de prueba integral |
| P-17 | CORS preflight desde otros orígenes, incluyendo Ionic | Pendiente; Ionic pospuesto |
| P-18 | Instalación en otra computadora desde repositorio limpio | Pendiente |
| P-19 | Validación de autenticación/seguridad en todos los endpoints | Pendiente de prueba exhaustiva |
| P-20 | Compilación y flujo de Ionic | Pospuesto |

## Evidencias recomendadas para anexar

Guardar capturas en `docs/evidencias/` con estos nombres sugeridos, sin mostrar contraseñas ni JWT:

- `01-login-admin.png`
- `02-panel-admin.png`
- `03-formulario-medico-validacion.png`
- `04-formulario-horario-validacion.png`
- `05-swagger-endpoints.png`
- `06-swagger-filtro-200.png`
- `07-consola-build-angular.png`

Adjuntar solo capturas reales; estos nombres son una guía, no archivos que ya existan.
