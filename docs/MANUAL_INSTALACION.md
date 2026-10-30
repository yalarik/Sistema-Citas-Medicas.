# Manual de instalación y configuración

## 1. Requisitos

- Windows 11 (entorno usado en las pruebas).
- MySQL Server 8.0; servicio local `MySQL80`.
- Java JDK 24 y Maven (proyecto configurado con `java.version=24`).
- Node.js y npm para Angular.
- NetBeans o editor Java; Visual Studio Code es opcional.

## 2. Base de datos

Comprobar que MySQL esté encendido:

```powershell
Get-Service MySQL80
```

Si está detenido, abrir PowerShell como administrador y ejecutar `Start-Service MySQL80`.

La configuración conocida utiliza la BD `sistema_citas` en `localhost:3306`, usuario `root`, y la contraseña recibida en la variable `DB_PASSWORD`.

> **ADVERTENCIA IMPORTANTE:** el script original `sistema_citas.sql` comienza con `DROP DATABASE IF EXISTS sistema_citas`. **NO volver a ejecutar ese script sobre la base de datos que ya contiene tus usuarios, citas y horarios**: borraría los registros. Usar únicamente una instancia de prueba o hacer primero un respaldo verificado.

Para una instalación desde cero, revisar el SQL y sus restricciones antes de importarlo. Si ya existe una base funcional, conservarla.

## 3. Iniciar el backend

Abrir PowerShell en la carpeta `SistemaCitas` y establecer Java y la contraseña local:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-24'
$env:DB_PASSWORD = Read-Host 'Contraseña local de MySQL'
& 'C:\Program Files\NetBeans-25\netbeans\java\maven\bin\mvn.cmd' spring-boot:run
```

`Read-Host` muestra el texto mientras se escribe. No grabar ni compartir esa ventana; una alternativa es configurar la variable de entorno mediante un mecanismo local de secretos. La variable debe ser **texto**, no un objeto `SecureString`. Mantener abierta la ventana del backend.

Esperar un mensaje de arranque de Spring Boot/Tomcat en el puerto **8080**. Si aparece `Access denied ... (using password: NO)`, revisar que `DB_PASSWORD` esté definida como texto y que `application.properties` use `${DB_PASSWORD:}`.

## 4. Iniciar Angular

En una segunda terminal:

```powershell
cd "$env:USERPROFILE\Desktop\Sistema_Citas_Proyecto\Sistema_Citas_Fases_1_a_4\sistema-citas-web"
npm.cmd install
npm.cmd start
```

Abrir <http://localhost:4200/login>. Para compilar la aplicación sin ejecutarla, usar `npm.cmd run build`.

Si el puerto 4200 ya está ocupado, primero identificar la instancia existente antes de detenerla:

```powershell
Get-NetTCPConnection -LocalPort 4200 -State Listen | Select-Object LocalPort, OwningProcess
```

## 5. API Swagger y autenticación

- Swagger: <http://localhost:8080/swagger-ui/index.html>
- API base: `http://localhost:8080/api/v1`
- Inicio de sesión: `POST /api/v1/auth/login`

Para endpoints protegidos en Swagger, utilizar **Authorize** con un JWT válido. No enviar tokens en informes, capturas ni repositorios.

## 6. Variables y CORS

- API web actual apunta a `http://localhost:8080/api/v1`.
- Origen Angular local: `http://localhost:4200`.
- El archivo `SecurityConfig.java` contiene configuración de CORS para desarrollo; comprobar si otras clases (`CorsConfig`) también registran filtros y evitar políticas contradictorias.

## 7. Solución rápida de problemas

| Síntoma | Revisión |
|---|---|
| `ERR_CONNECTION_REFUSED` en el login | Backend no responde en 8080 |
| `using password: NO` | Variable `DB_PASSWORD` ausente o no convertida a texto |
| `Port 4200 is already in use` | Existe otra instancia Angular; localizar su PID |
| `403 Forbidden` en Swagger | JWT ausente, no válido o rol sin permiso |
| Error de compilación en `app.ts` | Revisar primeras líneas (`import`) y detalles exactos del compilador |

## 8. Alcance

Estas instrucciones son para una ejecución **local**, no para un despliegue público. Ionic no forma parte de la ejecución exigida en esta fase de trabajo.
