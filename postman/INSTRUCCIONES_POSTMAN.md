# Colección Postman — Sistema de Citas Médicas

## Importar

1. Abrir Postman, elegir **Import** e importar los dos archivos JSON de `postman/`.
2. Seleccionar el entorno **Sistema Citas — Local**.
3. Abrir las variables del entorno y completar los correos y contraseñas **localmente**. Nunca subir el entorno con las credenciales completadas.
4. Asegurar que Spring Boot esté funcionando en `http://localhost:8080`.
5. Ejecutar uno de los logins y comprobar `200 OK`; el script almacenará el JWT temporal en la variable `token` del entorno.
6. Probar consultas y permisos. La cuenta activa determina qué endpoints están autorizados.

## Prueba completa guiada

- Iniciar como **paciente** y consultar `/schedules/available` con un `doctorId`, `fechaCita` y `horaCita` que realmente existan.
- Crear cita (debería devolver `201` y guardar `citaId` automáticamente); consultar el historial.
- Iniciar como **médico propietario** y registrar diagnóstico en la cita pendiente (no en una cancelada). Consultar agenda.
- Para probar cancelación, crear **otra cita pendiente** y cancelarla con el paciente propietario. No usar una cita diagnosticada o completada.
- Para permisos, usar la cuenta de paciente e intentar `GET /users` (esperado `403`).

## Alcance

Las pruebas están **preparadas** pero no se han ejecutado desde Postman en tu computadora. El estado `200`, `201`, `400`, `403` corresponde a expectativas, no a resultados certificados.

Los permisos de administrador/secretaria para gestionar citas requieren revisión en el backend: en ciertos endpoints se usa el correo de quien inicia sesión como si fuera el paciente.

No realizar estas pruebas contra datos médicos reales. No exportar entornos con JWT o contraseñas guardadas.
