import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
// Conexion con Spring Boot (API). MySQL se conecta desde el backend.
const API = 'http://localhost:8080/api/v1';

// Agrega el token de inicio de sesion a las peticiones.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  return next(token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req);
};

@Component({
  selector: 'app-root',
  standalone: true,
imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<h1>Sistema de Citas Médicas</h1>
<!-- Inicio de sesion -->
<section *ngIf="!token">
  <h2>Ingresar</h2>
  <input placeholder="Correo" [(ngModel)]="correo">
  <input type="password" placeholder="Contraseña" [(ngModel)]="password">
  <button (click)="login()">Entrar</button>
</section>
<section *ngIf="token">
  <p>Perfil: {{rol}}</p>
  <button (click)="salir()">Salir</button>
  <button (click)="cargar()">Actualizar</button>
</section>
<p class="error">{{error}}</p>
<p *ngIf="mensaje">{{mensaje}}</p>
<!-- Administracion de usuarios y especialidades -->
<section *ngIf="token && rol==='ROLE_ADMIN'">
  <h2>Usuarios</h2>
  <button type="button" (click)="irAReportes()">Ver reportes administrativos</button>
  <h3>Registrar nuevo usuario</h3>

<form (ngSubmit)="crearUsuario()">
  <input
    name="nombre"
    placeholder="Nombre completo"
    [(ngModel)]="nuevoUsuario.nombre"
    required>

  <input
    name="correo"
    type="email"
    placeholder="Correo electrónico"
    [(ngModel)]="nuevoUsuario.correo"
    required>

  <input
    name="password"
    type="password"
    placeholder="Contraseña"
    [(ngModel)]="nuevoUsuario.password"
    required>

  <select name="rol" [(ngModel)]="nuevoUsuario.rol">
    <option value="ROLE_ADMIN">Administrador</option>
    <option value="ROLE_DOCTOR">Doctor</option>
    <option value="ROLE_PATIENT">Paciente</option>
    <option value="ROLE_SECRETARY">Secretaria</option>
  </select>

  <button type="submit">Registrar usuario</button>
</form>
  <table>
  <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr>
<tr *ngFor="let u of usuarios">
  <td>{{u.nombre}}</td>
  <td>{{u.correo}}</td>
  <td>{{u.rol}}</td>
  <td>
  <button (click)="seleccionarUsuario(u)">Editar</button>
  <button (click)="eliminarUsuario(u)">Eliminar</button>
</td>
</tr>
  </table>
  <div *ngIf="usuarioEditando !== null">
  <h3>Editar usuario</h3>

  <label>Nombre
    <input [(ngModel)]="datosEdicion.nombre">
  </label>

  <label>Correo
    <input type="email" [(ngModel)]="datosEdicion.correo">
  </label>

  <label>Rol
    <select [(ngModel)]="datosEdicion.rol">
      <option value="ROLE_ADMIN">Administrador</option>
      <option value="ROLE_DOCTOR">Doctor</option>
      <option value="ROLE_PATIENT">Paciente</option>
      <option value="ROLE_SECRETARY">Secretaria</option>
    </select>
  </label>

  <button (click)="guardarEdicion()">Guardar cambios</button>
  <button (click)="usuarioEditando=null">Cancelar</button>
</div>
<h2>Especialidades</h2>

<h3>Registrar especialidad</h3>

<input
  placeholder="Nombre de especialidad"
  [(ngModel)]="nuevaEspecialidad.nombre">

<input
  placeholder="Descripción"
  [(ngModel)]="nuevaEspecialidad.descripcion">

<button (click)="crearEspecialidad()">
  Registrar especialidad
</button>
<div *ngIf="especialidadEditando !== null">
  <h3>Editar especialidad</h3>

  <label>Nombre
    <input [(ngModel)]="datosEspecialidad.nombre">
  </label>

  <label>Descripción
    <input [(ngModel)]="datosEspecialidad.descripcion">
  </label>

  <button (click)="guardarEspecialidad()">
    Guardar cambios
  </button>

  <button (click)="especialidadEditando=null">
    Cancelar
  </button>
</div>
<h3>Especialidades registradas</h3>

<table>
 <tr>
  <th>Nombre</th>
  <th>Descripción</th>
  <th>Acciones</th>
</tr>

<tr *ngFor="let e of especialidades">
  <td>{{e.nombre}}</td>
  <td>{{e.descripcion}}</td>
  <td>
    <button (click)="seleccionarEspecialidad(e)">Editar</button>
    <button (click)="eliminarEspecialidad(e)">Eliminar</button>
  </td>
</tr>
</table>
</section>
<section *ngIf="token">

<!-- Administracion de horarios -->
<section *ngIf="token && rol === 'ROLE_ADMIN'">
  <h2>Administrar horarios médicos</h2>

  <h3>Registrar horario</h3>

  <form [formGroup]="formularioHorario" (ngSubmit)="crearHorario()">
    <label>Médico
      <select formControlName="doctorId">
        <option [ngValue]="0">Seleccione un médico</option>
        <option *ngFor="let d of doctores" [ngValue]="d.id">{{d.usuario?.nombre}}</option>
      </select>
    </label>
    <label>Fecha
      <input type="date" formControlName="fecha">
    </label>
    <label>Hora de inicio
      <input type="time" formControlName="horaInicio">
    </label>
    <label>Hora de finalización
      <input type="time" formControlName="horaFin">
    </label>
    <button type="submit">Registrar horario</button>
    <p *ngIf="formularioHorario.invalid && formularioHorario.touched">
      Seleccione un médico y complete la fecha y las horas.
    </p>
  </form>
  <h3>Horarios registrados</h3>
  
<label>Filtrar por médico
  <select [(ngModel)]="filtroDoctorId">
    <option [ngValue]="0">Seleccione un médico</option>
    <option *ngFor="let d of doctores" [ngValue]="d.id">
      {{d.usuario?.nombre}}
    </option>
  </select>
</label>

<label>Filtrar por fecha
  <input type="date" [(ngModel)]="filtroFecha">
</label>

<button (click)="filtroDoctorId=0; filtroFecha=''">
  Limpiar filtros
</button>

<p *ngIf="filtroDoctorId === 0">
  Seleccione un médico para consultar sus horarios.
</p>


<table>
  <tr>
    <th>Médico</th>
    <th>Fecha</th>
    <th>Hora inicio</th>
    <th>Hora fin</th>
    <th>Disponible</th>
    <th>Acciones</th>
  </tr>

  <ng-container *ngFor="let h of horariosAdmin">
    <tr *ngIf="filtroDoctorId !== 0 &&
               h.doctor?.id === filtroDoctorId &&
               (!filtroFecha || h.fecha === filtroFecha)">
      <td>{{h.doctor?.usuario?.nombre}}</td>
      <td>{{h.fecha}}</td>
      <td>{{h.horaInicio}}</td>
      <td>{{h.horaFin}}</td>
      <td>{{h.disponible ? 'Sí' : 'No'}}</td>
      <td>
        <button (click)="seleccionarHorario(h)">Editar</button>
        <button (click)="eliminarHorario(h)">Eliminar</button>
      </td>
    </tr>
  </ng-container>
</table>

<div *ngIf="horarioEditando !== null">
  <h3>Editar horario</h3>
  <label>Fecha <input type="date" [(ngModel)]="datosHorario.fecha"></label>
  <label>Inicio <input type="time" [(ngModel)]="datosHorario.horaInicio"></label>
  <label>Fin <input type="time" [(ngModel)]="datosHorario.horaFin"></label>
  <label>Disponible <input type="checkbox" [(ngModel)]="datosHorario.disponible"></label>
  <button (click)="guardarHorario()">Guardar cambios</button>
  <button (click)="horarioEditando=null">Cancelar</button>
</div>
</section>

  <!-- Registro y consulta de medicos -->
  <h2>Médicos</h2>
  <div *ngIf="rol === 'ROLE_ADMIN'">
  <h3>Registrar médico</h3>

  <form [formGroup]="formularioDoctor" (ngSubmit)="crearDoctor()">
    <label>Usuario
      <select formControlName="usuarioId">
        <option [ngValue]="0">Seleccione un usuario</option>
        <option *ngFor="let u of usuarios" [ngValue]="u.id">{{u.nombre}} - {{u.correo}}</option>
      </select>
    </label>
    <label>Especialidad
      <select formControlName="especialidadId">
        <option [ngValue]="0">Seleccione una especialidad</option>
        <option *ngFor="let e of especialidades" [ngValue]="e.id">{{e.nombre}}</option>
      </select>
    </label>
    <label>Número de colegiado
      <input formControlName="numeroColegiado">
    </label>
    <label>Biografía
      <input formControlName="biografia">
    </label>
    <button type="submit">Registrar médico</button>
    <p *ngIf="formularioDoctor.controls.numeroColegiado.touched && formularioDoctor.controls.numeroColegiado.invalid">
      El número de colegiado debe tener al menos 4 caracteres.
    </p>
  </form>
</div>

<div *ngIf="rol === 'ROLE_ADMIN' && doctorEditando !== null">
  <h3>Editar médico</h3>

  <label>Usuario
    <select [(ngModel)]="datosDoctor.usuarioId">
      <option *ngFor="let u of usuarios" [ngValue]="u.id">
        {{u.nombre}}
      </option>
    </select>
  </label>

  <label>Especialidad
    <select [(ngModel)]="datosDoctor.especialidadId">
      <option *ngFor="let e of especialidades" [ngValue]="e.id">
        {{e.nombre}}
      </option>
    </select>
  </label>

  <label>Número de colegiado
    <input [(ngModel)]="datosDoctor.numeroColegiado">
  </label>

  <label>Biografía
    <input [(ngModel)]="datosDoctor.biografia">
  </label>

  <button (click)="guardarDoctor()">Guardar cambios</button>
  <button (click)="doctorEditando=null">Cancelar</button>
</div>


<table>
  <tr>
    <th>Nombre</th>
    <th>Especialidad</th>
    <th>Colegiado</th>
    <th>Biografía</th>
    <th *ngIf="rol === 'ROLE_ADMIN'">Acciones</th>
  </tr>

  <tr *ngFor="let d of doctores">
    <td>{{d.usuario?.nombre}}</td>
    <td>{{d.especialidad?.nombre}}</td>
    <td>{{d.numeroColegiado}}</td>
    <td>{{d.biografia || 'Sin biografía'}}</td>
    <td *ngIf="rol === 'ROLE_ADMIN'">
      <button (click)="seleccionarDoctor(d)">Editar</button>
      <button (click)="eliminarDoctor(d)">Eliminar</button>
    </td>
  </tr>
</table>

</section>
<!-- Agenda del doctor -->
<section *ngIf="token && rol==='ROLE_DOCTOR'">
  <h2>Agenda médica</h2>
  <label>ID doctor <input type="number" [(ngModel)]="doctorId"></label>
  <label>Fecha <input type="date" [(ngModel)]="fecha"></label>
  <button (click)="agenda()">Consultar agenda</button>
  <table>
    <tr><th>Paciente</th><th>Hora</th><th>Motivo</th><th>Acción</th></tr>
    <tr *ngFor="let c of citas">
      <td>{{c.pacienteNombre}}</td><td>{{c.hora}}</td><td>{{c.motivo}}</td>
      <td><button (click)="diagnosticar(c.id)" [disabled]="c.estado!=='PENDIENTE'">Diagnóstico</button></td>
    </tr>
  </table>
</section>
<!-- Citas e historial del paciente -->
<section *ngIf="token && rol==='ROLE_PATIENT'">
  <h2>Reservar cita</h2>
  <label>Médico
    <select [(ngModel)]="reservaDoctorId" (ngModelChange)="horarios=[];horaReserva=''">
      <option [ngValue]="0">Seleccione un médico</option>
      <option *ngFor="let d of doctores" [ngValue]="d.id">
        {{d.usuario?.nombre}} - {{d.especialidad?.nombre}}
      </option>
    </select>
  </label>
  <label>Fecha <input type="date" [(ngModel)]="fechaReserva" (ngModelChange)="horarios=[];horaReserva=''"></label>
  <button (click)="buscarHorarios()">Buscar horarios</button>
  <p *ngIf="horariosConsultados && horarios.length===0">No hay horarios disponibles para esa fecha.</p>
  <div *ngIf="horarios.length>0">
    <label>Horario
      <select [(ngModel)]="horaReserva">
        <option value="">Seleccione un horario</option>
        <option *ngFor="let h of horarios" [value]="h.horaInicio">{{h.horaInicio}} - {{h.horaFin}}</option>
      </select>
    </label>
    <label>Motivo <input [(ngModel)]="motivoReserva" placeholder="Motivo de consulta"></label>
    <button (click)="reservar()">Reservar cita</button>
  </div>
  <h2>Mis citas e historial</h2>
  <button (click)="historial()">Consultar mis citas</button>
  <table>
    <tr><th>Fecha</th><th>Hora</th><th>Doctor</th><th>Motivo</th><th>Estado</th><th>Diagnóstico</th><th>Receta</th><th>Acción</th></tr>
    <tr *ngFor="let c of misCitas">
      <td>{{c.fecha}}</td><td>{{c.hora}}</td><td>{{c.doctorNombre}}</td><td>{{c.motivo}}</td>
      <td>{{c.estado}}</td><td>{{c.diagnostico || '-'}}</td><td>{{c.receta || '-'}}</td>
      <td><button *ngIf="c.estado==='PENDIENTE'" (click)="cancelar(c.id)">Cancelar</button></td>
    </tr>
  </table>
</section>
  `
})
// Pantalla principal del sistema.
export class AppComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Formulario reactivo de registro de medicos.
  formularioDoctor = this.fb.nonNullable.group({
    usuarioId: [0, [Validators.required, Validators.min(1)]],
    especialidadId: [0, [Validators.required, Validators.min(1)]],
    numeroColegiado: ['', [Validators.required, Validators.minLength(4)]],
    biografia: ['']
  });

  // Formulario reactivo de registro de horarios.
  formularioHorario = this.fb.nonNullable.group({
    doctorId: [0, [Validators.required, Validators.min(1)]],
    fecha: ['', Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required]
  });
  
  correo = '';
  password = '';
  rol = '';
  token = sessionStorage.getItem('token') || '';
  error = '';
  mensaje = '';
  // Usuarios y sus formularios.
  usuarios: any[] = [];
  usuarioEditando: number | null = null;

datosEdicion = {
  nombre: '',
  correo: '',
  rol: 'ROLE_PATIENT'
};
  nuevoUsuario = {
  nombre: '',
  correo: '',
  password: '',
  rol: 'ROLE_PATIENT'
};
  // Medicos y datos profesionales.
  doctores: any[] = [];
doctorEditando: number | null = null;

datosDoctor = {
  usuarioId: 0,
  especialidadId: 0,
  numeroColegiado: '',
  biografia: ''
};
  // Especialidades y horarios.
  especialidades: any[] = [];

horariosAdmin: any[] = [];
filtroDoctorId = 0;
filtroFecha = '';
  horarioEditando: number | null = null;
  datosHorario = { fecha: '', horaInicio: '', horaFin: '', disponible: true };
  nuevaEspecialidad = {
  nombre: '',
  descripcion: ''
};
especialidadEditando: number | null = null;

datosEspecialidad = {
  nombre: '',
  descripcion: ''
};
  // Reservas y agenda medica.
  citas: any[] = [];
  doctorId = 1;
  fecha = new Date().toLocaleDateString('en-CA');
  reservaDoctorId = 0;
  fechaReserva = new Date().toLocaleDateString('en-CA');
  horarios: any[] = [];
  horariosConsultados = false;
  horaReserva = '';
  motivoReserva = '';
  misCitas: any[] = [];

  constructor() {
    this.rol = sessionStorage.getItem('rol') || '';
    if (this.token) this.cargar();
  }

  // Inicio de sesion con la API.
// Iniciar sesion y redirigir segun el rol
login() {
  this.http.post<any>(API + '/auth/login', {
    correo: this.correo,
    password: this.password
  }).subscribe({
    next: r => {
      this.token = r.token;
      this.rol = r.rol;

      sessionStorage.setItem('token', r.token);
      sessionStorage.setItem('rol', r.rol);

      this.error = '';
      this.mensaje = '';

      // Redirigir al panel correspondiente
      switch (r.rol) {
        case 'ROLE_ADMIN':
          this.router.navigate(['/admin']);
          break;

        case 'ROLE_DOCTOR':
          this.router.navigate(['/doctor']);
          break;

        case 'ROLE_PATIENT':
          this.router.navigate(['/paciente']);
          break;

        case 'ROLE_SECRETARY':
          this.router.navigate(['/secretaria']);
          break;

        default:
          this.error = 'El usuario no tiene un panel configurado';
          return;
      }

      this.cargar();
    },
    error: () => {
      this.error = 'No se pudo iniciar sesión';
    }
  });
}
 // Cerrar sesion y regresar al login
salir() {
  sessionStorage.clear();

  this.token = '';
  this.rol = '';
  this.usuarios = [];
  this.doctores = [];
  this.citas = [];
  this.misCitas = [];
  this.horarios = [];
  this.horariosAdmin = [];
  this.error = '';
  this.mensaje = '';

  this.router.navigate(['/login']);
}


// Abrir el nuevo módulo de reportes sin cambiar la administración actual.
irAReportes() {
  this.router.navigate(['/admin/reportes']);
}

// Consulta los datos del sistema segun el rol.
cargar() {
  this.http.get<any[]>(API + '/doctors').subscribe({
    next: x => this.doctores = x,
    error: () => this.error = 'No se pudieron cargar médicos'
  });

  if (this.rol === 'ROLE_ADMIN') {
    this.http.get<any[]>(API + '/users').subscribe({
      next: x => this.usuarios = x,
      error: () => this.error = 'No se pudieron cargar usuarios'
    });

    this.http.get<any[]>(API + '/specialties').subscribe({
      next: x => this.especialidades = x,
      error: () => this.error = 'No se pudieron cargar especialidades'
    });

    this.http.get<any[]>(API + '/schedules').subscribe({
      next: x => this.horariosAdmin = x,
      error: () => this.error = 'No se pudieron cargar los horarios médicos'
    });
  }

  if (this.rol === 'ROLE_PATIENT') this.historial();
}


  agenda() {
    this.error = '';
    this.http.get<any[]>(API + '/appointments/doctor/' + this.doctorId + '/agenda', { params: { fecha: this.fecha } }).subscribe({
      next: r => this.citas = r,
      error: () => this.error = 'No se pudo obtener agenda'
    });
  }

  diagnosticar(id: number) {
    const diagnostico = prompt('Diagnóstico');
    if (!diagnostico) return;
    const receta = prompt('Receta') || '';
    this.http.put(API + '/appointments/' + id + '/diagnosis', { diagnostico, receta }).subscribe({
      next: () => this.agenda(),
      error: () => this.error = 'No se guardó el diagnóstico'
    });
  }

  buscarHorarios() {
    this.error = '';
    this.mensaje = '';
    this.horarios = [];
    this.horaReserva = '';
    this.horariosConsultados = false;
    if (!this.reservaDoctorId || !this.fechaReserva) {
      this.error = 'Seleccione un médico y una fecha';
      return;
    }
    this.http.get<any[]>(API + '/schedules/available', {
      params: { doctorId: this.reservaDoctorId, fecha: this.fechaReserva }
    }).subscribe({
      next: x => { this.horarios = x; this.horariosConsultados = true; },
      error: () => this.error = 'No se pudieron consultar los horarios'
    });
  }

  reservar() {
    this.error = '';
    this.mensaje = '';
    if (!this.reservaDoctorId || !this.fechaReserva || !this.horaReserva || !this.motivoReserva.trim()) {
      this.error = 'Complete todos los datos de la cita';
      return;
    }
    this.http.post(API + '/appointments', {
      fecha: this.fechaReserva,
      hora: this.horaReserva,
      motivo: this.motivoReserva.trim()
    }, { params: { doctorId: this.reservaDoctorId } }).subscribe({
      next: () => {
        this.mensaje = 'Cita reservada correctamente';
        this.motivoReserva = '';
        this.horarios = [];
        this.horaReserva = '';
        this.horariosConsultados = false;
        this.historial();
      },
      error: e => this.error = 'No se pudo reservar la cita: ' + (e.error?.mensaje || e.status)
    });
  }

  historial() {
    this.http.get<any[]>(API + '/appointments/my-history').subscribe({
      next: x => this.misCitas = x,
      error: () => this.error = 'No se pudo consultar el historial'
    });
  }

  cancelar(id: number) {
    if (!confirm('¿Desea cancelar esta cita?')) return;
    this.error = '';
    this.mensaje = '';
    this.http.put(API + '/appointments/' + id + '/cancel', {}).subscribe({
      next: () => {
        this.mensaje = 'Cita cancelada correctamente';
        this.historial();
      },
      error: e => this.error = 'No se pudo cancelar la cita: ' + (e.error?.mensaje || e.status)
    });
  }
  crearUsuario() {
  this.error = '';
  this.mensaje = '';

  this.http.post<any>(API + '/users', this.nuevoUsuario).subscribe({
    next: () => {
      this.mensaje = 'Usuario registrado correctamente';
      this.nuevoUsuario = {
        nombre: '',
        correo: '',
        password: '',
        rol: 'ROLE_PATIENT'
      };
      this.cargar();
    },
   error: e => {
  console.error('Error al registrar usuario:', e);
  this.error = 'No se pudo registrar el usuario: ' +
    (e.error?.mensaje || e.error?.message || e.status);
}
  });
}
seleccionarUsuario(u: any) {
  this.usuarioEditando = u.id;
  this.datosEdicion = {
    nombre: u.nombre,
    correo: u.correo,
    rol: u.rol
  };
  this.error = '';
  this.mensaje = '';
}
guardarEdicion() {
  if (this.usuarioEditando === null) return;

  this.error = '';
  this.mensaje = '';

  const datos = {
    ...this.datosEdicion,
    password: ''
  };

  this.http.put(API + '/users/' + this.usuarioEditando, datos).subscribe({
    next: () => {
      this.mensaje = 'Usuario actualizado correctamente';
      this.usuarioEditando = null;
      this.cargar();
    },
    error: e => {
      this.error = 'No se pudo actualizar el usuario: ' +
        (e.error?.mensaje || e.status);
    }
  });
}
eliminarUsuario(u: any) {
  if (u.rol === 'ROLE_ADMIN' || u.rol === 'ROLE_DOCTOR') {
    this.error = 'Por seguridad, no se pueden eliminar administradores ni médicos desde esta opción';
    return;
  }

  if (!confirm('¿Estás seguro de eliminar al usuario ' + u.nombre + '?')) {
    return;
  }

  this.error = '';
  this.mensaje = '';

  this.http.delete(API + '/users/' + u.id).subscribe({
    next: () => {
      this.mensaje = 'Usuario eliminado correctamente';
      this.cargar();
    },
    error: e => {
      this.error = 'No se pudo eliminar el usuario: ' +
        (e.error?.mensaje || e.status);
    }
  });
}
crearEspecialidad() {
  this.error = '';
  this.mensaje = '';

  if (!this.nuevaEspecialidad.nombre.trim()) {
    this.error = 'Debe ingresar el nombre de la especialidad';
    return;
  }

  this.http.post(API + '/specialties', this.nuevaEspecialidad).subscribe({
    next: () => {
      this.mensaje = 'Especialidad registrada correctamente';

      this.nuevaEspecialidad = {
        nombre: '',
        descripcion: ''
      };

      this.cargar();
    },
    error: e => {
      this.error = 'No se pudo registrar la especialidad: ' +
        (e.error?.mensaje || e.error?.message || e.status);
    }
  });
}
seleccionarEspecialidad(e: any) {
  this.especialidadEditando = e.id;

  this.datosEspecialidad = {
    nombre: e.nombre,
    descripcion: e.descripcion || ''
  };

  this.error = '';
  this.mensaje = '';
}
guardarEspecialidad() {
  if (this.especialidadEditando === null) return;

  this.error = '';
  this.mensaje = '';

  if (!this.datosEspecialidad.nombre.trim()) {
    this.error = 'Debe ingresar el nombre de la especialidad';
    return;
  }

  this.http.put(
    API + '/specialties/' + this.especialidadEditando,
    this.datosEspecialidad
  ).subscribe({
    next: () => {
      this.mensaje = 'Especialidad actualizada correctamente';
      this.especialidadEditando = null;
      this.cargar();
    },
    error: e => {
      this.error = 'No se pudo actualizar la especialidad: ' +
        (e.error?.mensaje || e.error?.message || e.status);
    }
  });
}
eliminarEspecialidad(e: any) {
  if (!confirm('¿Estás seguro de eliminar la especialidad ' + e.nombre + '?')) {
    return;
  }

  this.error = '';
  this.mensaje = '';

  this.http.delete(API + '/specialties/' + e.id).subscribe({
    next: () => {
      this.mensaje = 'Especialidad eliminada correctamente';
      this.cargar();
    },
    error: err => {
      this.error = 'No se pudo eliminar la especialidad: ' +
        (err.error?.mensaje || err.error?.message || err.status);
    }
  });
}

crearDoctor() {
  this.error = '';
  this.mensaje = '';

  if (this.formularioDoctor.invalid) {
    this.formularioDoctor.markAllAsTouched();
    this.error = 'Complete los datos obligatorios del médico (colegiado mínimo 4 caracteres)';
    return;
  }

  const f = this.formularioDoctor.getRawValue();
  const usuario = this.usuarios.find(u => u.id === f.usuarioId);
  const especialidad = this.especialidades.find(e => e.id === f.especialidadId);

  if (!usuario || !especialidad) {
    this.error = 'Seleccione un usuario y una especialidad válidos';
    return;
  }

  if (usuario.rol !== 'ROLE_DOCTOR') {
    this.error = 'El usuario seleccionado debe tener el rol de doctor';
    return;
  }

  if (this.doctores.some(d => d.usuario?.id === usuario.id)) {
    this.error = 'Este usuario ya tiene un perfil médico';
    return;
  }

  const datos = {
    usuario: { id: usuario.id },
    especialidad: { id: especialidad.id },
    numeroColegiado: f.numeroColegiado.trim(),
    biografia: f.biografia.trim()
  };

  this.http.post(API + '/doctors', datos).subscribe({
    next: () => {
      this.mensaje = 'Médico registrado correctamente';
      this.formularioDoctor.reset();
      this.cargar();
    },
    error: e => {
      this.error = 'No se pudo registrar el médico: ' +
        (e.error?.mensaje || e.error?.message || e.status);
    }
  });
}

seleccionarDoctor(d: any) {
  this.doctorEditando = d.id;

  this.datosDoctor = {
    usuarioId: d.usuario?.id || 0,
    especialidadId: d.especialidad?.id || 0,
    numeroColegiado: d.numeroColegiado || '',
    biografia: d.biografia || ''
  };

  this.error = '';
  this.mensaje = '';
}
guardarDoctor() {
  if (this.doctorEditando === null) return;

  this.error = '';
  this.mensaje = '';

  const doctorActual = this.doctores.find(
    d => d.id === this.doctorEditando
  );

  if (!doctorActual) {
    this.error = 'No se encontró el médico seleccionado';
    return;
  }

  if (!this.datosDoctor.numeroColegiado.trim()) {
    this.error = 'Debe ingresar el número de colegiado';
    return;
  }

  const datos = {
    usuario: { id: doctorActual.usuario.id },
    especialidad: { id: this.datosDoctor.especialidadId },
    numeroColegiado: this.datosDoctor.numeroColegiado.trim(),
    biografia: this.datosDoctor.biografia.trim()
  };

  this.http.put(API + '/doctors/' + this.doctorEditando, datos).subscribe({
    next: () => {
      this.mensaje = 'Médico actualizado correctamente';
      this.doctorEditando = null;
      this.cargar();
    },
    error: e => {
      this.error = 'No se pudo actualizar el médico: ' +
        (e.error?.mensaje || e.error?.message || e.status);
    }
  });
}
eliminarDoctor(d: any) {
  this.error = '';
  this.mensaje = '';

  this.error = 'Por seguridad, todavía no se permite eliminar médicos. Debemos verificar que no tengan citas ni horarios asociados.';
}

crearHorario() {
  this.error = '';
  this.mensaje = '';

  if (this.formularioHorario.invalid) {
    this.formularioHorario.markAllAsTouched();
    this.error = 'Complete todos los datos del horario';
    return;
  }

  const h = this.formularioHorario.getRawValue();
  if (h.horaInicio >= h.horaFin) {
    this.error = 'La hora de inicio debe ser anterior a la hora final';
    return;
  }

  const datos = {
    fecha: h.fecha,
    horaInicio: h.horaInicio,
    horaFin: h.horaFin
  };

  this.http.post(API + '/schedules/doctor/' + h.doctorId, datos).subscribe({
    next: () => {
      this.mensaje = 'Horario registrado correctamente';
      this.formularioHorario.reset();
      this.cargar();
    },
    error: e => {
      this.error = 'No se pudo registrar el horario: ' +
        (e.error?.mensaje || e.error?.message || e.status);
    }
  });
}

  // Selecciona un horario para modificarlo.
  seleccionarHorario(h: any) {
    this.horarioEditando = h.id;
    this.datosHorario = {
      fecha: h.fecha,
      horaInicio: (h.horaInicio || '').substring(0, 5),
      horaFin: (h.horaFin || '').substring(0, 5),
      disponible: h.disponible === true
    };
    this.error = '';
    this.mensaje = '';
  }

  // Guarda cambios. Spring Boot protege horarios con citas.
  guardarHorario() {
    if (this.horarioEditando === null) return;
    const h = this.datosHorario;
    this.error = '';
    this.mensaje = '';

    if (!h.fecha || !h.horaInicio || !h.horaFin || h.horaInicio >= h.horaFin) {
      this.error = 'Revise la fecha y el rango de horas';
      return;
    }

    this.http.put(API + '/schedules/' + this.horarioEditando, {
      fecha: h.fecha,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
      disponible: h.disponible
    }).subscribe({
      next: () => {
        this.mensaje = 'Horario actualizado correctamente';
        this.horarioEditando = null;
        this.cargar();
      },
      error: e => this.error = 'No se pudo actualizar el horario: ' +
        (e.error?.mensaje || e.error?.message || e.status)
    });
  }

  // Elimina un horario solamente despues de confirmarlo.
  // El backend impide borrar horarios con citas no canceladas.
  eliminarHorario(h: any) {
    if (!confirm('¿Eliminar el horario de ' + (h.doctor?.usuario?.nombre || 'este médico') +
      ' del ' + h.fecha + ' a las ' + h.horaInicio + '?')) return;

    this.error = '';
    this.mensaje = '';
    this.http.delete(API + '/schedules/' + h.id).subscribe({
      next: () => {
        this.mensaje = 'Horario eliminado correctamente';
        if (this.horarioEditando === h.id) this.horarioEditando = null;
        this.cargar();
      },
      error: e => this.error = 'No se pudo eliminar el horario: ' +
        (e.error?.mensaje || e.error?.message || e.status)
    });
  }

}
