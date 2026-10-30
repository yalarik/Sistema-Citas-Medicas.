# Manual de usuario — sistema web

## Iniciar sesión

1. Abrir <http://localhost:4200/login> con Angular y Spring Boot ejecutándose.
2. Ingresar correo y contraseña de una cuenta habilitada.
3. La aplicación redirige a `/admin`, `/doctor` o `/paciente` según el rol.
4. Utilizar **Salir** para cerrar la sesión y regresar al login.

No se documentan contraseñas reales en este manual.

## Administrador (`ROLE_ADMIN`)

- **Usuarios:** registrar usuario (nombre, correo, contraseña y rol), consultar, editar y eliminar usuarios permitidos. Existen restricciones de interfaz para evitar eliminar administradores y médicos mediante la opción general.
- **Especialidades:** registrar, editar, consultar y eliminar cuando las relaciones de datos lo permitan.
- **Médicos:** registrar usando una cuenta con rol médico y una especialidad; número de colegiado obligatorio. Editar perfil profesional. La eliminación está deshabilitada en la interfaz actual mientras se verifican las relaciones con citas y horarios.
- **Horarios:** seleccionar médico, fecha y horario de inicio/fin; consultar, filtrar, editar y eliminar según las reglas del backend.
- **Actualizar:** recarga listados de la API.

Los formularios reactivos de registro de médico y horario validan campos obligatorios y rango horario.

## Médico (`ROLE_DOCTOR`)

1. Entrar a `/doctor`.
2. Ingresar/confirmar el ID propio de doctor y la fecha de la agenda.
3. Presionar **Consultar agenda**.
4. En una cita pendiente, usar **Diagnóstico**, completar diagnóstico y receta.

El backend restringe la consulta de agendas ajenas cuando el usuario no es administrador. En la interfaz actual el médico todavía introduce el ID manualmente.

## Paciente (`ROLE_PATIENT`)

1. Entrar a `/paciente`.
2. Elegir médico y fecha.
3. Presionar **Buscar horarios**.
4. Seleccionar una hora disponible e indicar el motivo.
5. Presionar **Reservar cita**.
6. En **Mis citas e historial**, consultar estado, diagnóstico y receta; cancelar solo cuando esté permitido.

## Secretaria (`ROLE_SECRETARY`)

El backend contempla permisos para secretaria en determinados endpoints, pero **no existe una pantalla de secretaria independiente confirmada** en la interfaz web actual.

## Mensajes frecuentes

- **Datos obligatorios:** completar los campos resaltados o faltantes.
- **Inicio mayor o igual al fin:** corregir el rango de horas.
- **401/403:** comprobar sesión vigente y permisos del rol.
- **No se pudieron cargar datos:** comprobar que la API y MySQL estén activos.
