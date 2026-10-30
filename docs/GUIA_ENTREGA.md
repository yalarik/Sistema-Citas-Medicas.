# Guía de entrega, GitHub y despliegue local

## 1. Contenido esperado de la entrega parcial

- `SistemaCitas/`: código fuente del backend y `pom.xml`.
- `sistema-citas-web/`: código fuente Angular, rutas, guardias y componentes.
- `sistema_citas.sql`: script de base de datos original **solo como referencia para instalación nueva**.
- `README.md` y carpeta `docs/`.
- Diagrama entidad-relación (DER), si el docente lo solicita (aún no incluido en este paquete documental).
- Evidencias y pruebas reales.
- `sistema-citas-movil/`: proyecto existente **solo si se exige incluirlo en el repositorio**; no declararlo como terminado.

## 2. No subir archivos sensibles o generados

- `node_modules/`, `dist/`, `.angular/`, `target/`, `.idea/`, logs.
- Contraseñas, tokens JWT, claves privadas o `.env` con secretos.

Ejemplo de `.gitignore` en la raíz:

```gitignore
**/node_modules/
**/dist/
**/.angular/
**/target/
**/.idea/
**/.vscode/
*.log
.env
.env.*
!.env.example
```

## 3. GitHub (repositorio nuevo)

Desde la carpeta `Sistema_Citas_Fases_1_a_4` en PowerShell:

```powershell
git init
git add .
git status
git commit -m "Entrega parcial sistema de citas médicas"
git branch -M main
```

Crear un repositorio vacío en GitHub y copiar la URL real. Después ejecutar:

```powershell
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

**Reemplazar `TU_USUARIO/TU_REPOSITORIO` por la URL real**. No pegar credenciales ni tokens en comandos de chat. Si el repositorio ya existe, no repetir `git init` ni añadir otro `origin`: comprobar con `git remote -v` y `git status`.

## 4. ZIP de entrega

En PowerShell, desde la carpeta que contiene `Sistema_Citas_Fases_1_a_4`:

```powershell
Compress-Archive -Path '.\Sistema_Citas_Fases_1_a_4' -DestinationPath '.\Sistema_Citas_Entrega.zip' -Force
```

Antes de comprimir, verificar que no haya `node_modules`, `target`, ni secretos. Si hay demasiados archivos generados, crear una carpeta de entrega limpia y copiar únicamente el código y la documentación.

## 5. Instalación por el evaluador

- Crear una base de datos de prueba (ver advertencia destructiva del SQL).
- Configurar el servidor MySQL local y contraseña mediante variable de entorno.
- Iniciar Spring Boot en 8080.
- Instalar dependencias Angular e iniciar en 4200.
- Visitar Swagger y ejecutar una prueba protegida con JWT.

> El enlace `localhost` **no es público**. Para un despliegue en servidor real se deben configurar HTTPS, origen CORS, dirección de API, base de datos externa, variables de entorno y controles de seguridad adicionales.

## 6. Estado y límites

El frontend Angular tiene chunks de carga diferida, pero sus paneles aún reutilizan el componente principal. Ionic se pospone expresamente. No se ha realizado un despliegue público ni una auditoría de seguridad completa.
