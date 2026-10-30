# Sistema de Citas Médicas y Portal de Salud

Proyecto académico — Universidad Mariano Gálvez de Guatemala, Ingeniería en Sistemas.

## Alcance de esta entrega

- **Backend**: API REST con Java 24, Spring Boot 3.5.16, Spring Security JWT, JPA/Hibernate y MySQL.
- **Frontend web**: Angular, inicio de sesión, rutas protegidas por rol, interceptor de JWT, funciones de administración, agenda médica y reservas del paciente.
- **Documentación API**: Swagger/OpenAPI.
- **Ionic**: **pospuesto**. No se presenta como terminado ni probado en esta entrega parcial.

## Funciones disponibles

- Autenticación y autorización basada en roles `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_PATIENT` y `ROLE_SECRETARY` en la API.
- Administración de usuarios, especialidades, perfiles de médicos y horarios; algunas operaciones están restringidas deliberadamente.
- Agenda médica y registro de diagnóstico/receta.
- Consulta de horarios disponibles, reserva, historial y cancelación de citas desde la interfaz web del paciente.
- Búsqueda de médicos por parámetro `especialidadId`.
- Formularios reactivos para registrar médicos y horarios.
- Rutas `login`, `admin`, `doctor` y `paciente` con guardias de acceso; la lógica de los paneles web sigue compartiendo `AppComponent` y requiere modularización posterior.

## Estructura del proyecto

```text
Sistema_Citas_Fases_1_a_4/
  SistemaCitas/          # Spring Boot
  sistema-citas-web/     # Angular
  sistema-citas-movil/   # Ionic, pendiente
  sistema_citas.sql      # Script de BD del proyecto
```

## Ejecución local

**Requisitos:** MySQL 8, Java 24, Maven, Node.js/npm, dependencias npm instalables y puertos 3306/8080/4200 disponibles.

1. Revisar la BD antes de ejecutar un script SQL (ver advertencia en el manual de instalación).
2. Iniciar el servicio `MySQL80`.
3. En PowerShell, entrar a `SistemaCitas`, establecer `DB_PASSWORD` y ejecutar `mvn spring-boot:run`.
4. En otra terminal, entrar a `sistema-citas-web`, ejecutar `npm.cmd install` (primera vez) y `npm.cmd start`.
5. Abrir el frontend en <http://localhost:4200/login>.
6. Abrir Swagger en <http://localhost:8080/swagger-ui/index.html>.

Las instrucciones completas están en [docs/MANUAL_INSTALACION.md](docs/MANUAL_INSTALACION.md).

## Documentación incluida

- [Manual de instalación](docs/MANUAL_INSTALACION.md)
- [Manual de usuario](docs/MANUAL_USUARIO.md)
- [Reporte de pruebas](docs/REPORTE_PRUEBAS.md)
- [Guía de entrega y despliegue](docs/GUIA_ENTREGA.md)

## Seguridad

Las contraseñas de MySQL y los JWT no deben subirse a GitHub ni aparecer en capturas. Los accesos de prueba deben reemplazarse antes de utilizar el sistema con datos reales. No se ha realizado una auditoría completa de seguridad.

## Limitaciones actuales

No se incluye certificación de cobertura completa de pruebas, ni un despliegue público. Ionic queda expresamente pendiente. Las rutas web generan chunks con Lazy Loading, aunque los paneles comparten lógica y no están completamente desacoplados.
