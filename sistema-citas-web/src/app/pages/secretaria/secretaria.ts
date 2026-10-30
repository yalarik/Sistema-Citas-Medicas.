import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

const API = 'http://localhost:8080/api/v1';

type EstadoCita = 'PENDIENTE' | 'CANCELADA' | 'COMPLETADA';

interface Paciente {
  id: number;
  nombre: string;
  correo: string;
}

interface Doctor {
  id: number;
  usuario?: { nombre: string };
  especialidad?: { nombre: string };
}

interface Horario {
  id: number;
  horaInicio: string;
  horaFin: string;
}

interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  doctorId: number;
  doctorNombre: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: EstadoCita;
}

@Component({
  selector: 'app-secretaria-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="secretaria">
      <header class="encabezado">
        <div>
          <h1>Recepción y Secretaría</h1>
          <p>Registro y seguimiento de citas médicas</p>
        </div>
        <button type="button" (click)="salir()">Cerrar sesión</button>
      </header>

      <p class="error" role="alert" *ngIf="error">{{ error }}</p>
      <p class="exito" role="status" *ngIf="mensaje">{{ mensaje }}</p>

      <section class="tarjeta">
        <h2>Agendar una cita para un paciente</h2>
        <div class="campos">
          <label>Paciente
            <select name="pacienteId" [(ngModel)]="pacienteId">
              <option [ngValue]="0">Seleccione un paciente</option>
              <option *ngFor="let p of pacientes" [ngValue]="p.id">{{ p.nombre }} — {{ p.correo }}</option>
            </select>
          </label>
          <label>Médico
            <select name="doctorId" [(ngModel)]="doctorId" (ngModelChange)="reiniciarHorarios()">
              <option [ngValue]="0">Seleccione un médico</option>
              <option *ngFor="let d of doctores" [ngValue]="d.id">{{ d.usuario?.nombre }} — {{ d.especialidad?.nombre }}</option>
            </select>
          </label>
          <label>Fecha
            <input type="date" name="fecha" [min]="fechaMinima" [(ngModel)]="fecha" (ngModelChange)="reiniciarHorarios()">
          </label>
          <div class="accion-horarios">
            <button type="button" (click)="consultarHorarios()" [disabled]="consultando">{{ consultando ? 'Consultando...' : 'Buscar horarios disponibles' }}</button>
          </div>
          <label>Horario
            <select name="hora" [(ngModel)]="hora" [disabled]="horarios.length === 0">
              <option value="">Seleccione un horario</option>
              <option *ngFor="let h of horarios" [value]="h.horaInicio">{{ h.horaInicio }} - {{ h.horaFin }}</option>
            </select>
          </label>
          <label class="campo-ancho">Motivo de consulta
            <textarea name="motivo" [(ngModel)]="motivo" maxlength="500" rows="2" placeholder="Describa brevemente el motivo"></textarea>
          </label>
        </div>
        <p *ngIf="horariosConsultados && horarios.length === 0" class="aviso">No existen horarios libres para la fecha y el médico seleccionados.</p>
        <button type="button" (click)="crearCita()" [disabled]="guardando || !pacienteId || !doctorId || !hora || !motivo.trim()">
          {{ guardando ? 'Guardando...' : 'Registrar cita médica' }}
        </button>
      </section>

      <section class="tarjeta">
        <div class="cabecera-tabla">
          <h2>Control de citas</h2>
          <button type="button" (click)="cargarCitas()" [disabled]="cargando">{{ cargando ? 'Actualizando...' : 'Actualizar citas' }}</button>
        </div>
        <div class="campos filtros">
          <label>Filtrar por fecha
            <input type="date" name="filtroFecha" [(ngModel)]="filtroFecha">
          </label>
          <label>Filtrar por estado
            <select name="filtroEstado" [(ngModel)]="filtroEstado">
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="COMPLETADA">Completadas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </label>
          <label>Buscar paciente o médico
            <input name="busqueda" [(ngModel)]="busqueda" placeholder="Nombre">
          </label>
          <div class="accion-horarios"><button type="button" (click)="limpiarFiltros()">Limpiar filtros</button></div>
        </div>
        <div class="tabla-contenedor">
          <table>
            <thead><tr><th>ID</th><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Médico</th><th>Motivo</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of citasFiltradas">
                <td>{{ c.id }}</td>
                <td>{{ c.fecha }}</td>
                <td>{{ c.hora }}</td>
                <td>{{ c.pacienteNombre }}</td>
                <td>{{ c.doctorNombre }}</td>
                <td>{{ c.motivo }}</td>
                <td>{{ c.estado }}</td>
                <td><button type="button" *ngIf="c.estado === 'PENDIENTE'" (click)="cancelarCita(c)" [disabled]="cancelandoId === c.id">Cancelar</button></td>
              </tr>
              <tr *ngIf="!citasFiltradas.length"><td colspan="8">No se encontraron citas.</td></tr>
            </tbody>
          </table>
        </div>
        <p class="pie">Mostrando {{ citasFiltradas.length }} de {{ citas.length }} citas.</p>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; }
    .secretaria { max-width: 1240px; padding: 12px 18px 40px; margin: auto; }
    .encabezado, .cabecera-tabla { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
    .encabezado h1 { margin-bottom: 4px; }
    .encabezado p { color:#526173; margin-top:0; }
    .tarjeta { background:white; border:1px solid #d8e2eb; border-radius:12px; padding:20px; margin:18px 0; }
    .tarjeta h2 { margin:0 0 16px; }
    .campos { display:grid; gap:14px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); align-items:end; margin-bottom:16px; }
    .campos label { display:grid; gap:6px; font-weight:600; }
    .campos input, .campos select, textarea { width:100%; min-width:0; box-sizing:border-box; padding:10px; border:1px solid #9dacbb; border-radius:6px; font:inherit; }
    .campo-ancho { grid-column: 1 / -1; }
    .accion-horarios { align-self:end; }
    button { padding:10px 14px; border-radius:7px; border:1px solid #6c84a4; cursor:pointer; }
    button[disabled] { opacity:.55; cursor:not-allowed; }
    .error, .exito, .aviso { padding:10px; border-radius:7px; }
    .error { color:#9e1717; background:#ffebeb; }
    .exito { color:#155c33; background:#e8f8eb; }
    .aviso { background:#fff5d8; }
    .tabla-contenedor { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:9px; border-bottom:1px solid #d8e2eb; text-align:left; vertical-align:top; }
    th { background:#eef4fa; }
    .pie { color:#526173; }
  `]
})
export class SecretariaPageComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  pacientes: Paciente[] = [];
  doctores: Doctor[] = [];
  citas: Cita[] = [];
  horarios: Horario[] = [];
  pacienteId = 0;
  doctorId = 0;
  fechaMinima = this.fechaLocal(new Date());
  fecha = this.fechaMinima;
  hora = '';
  motivo = '';
  filtroFecha = '';
  filtroEstado = 'TODOS';
  busqueda = '';
  error = '';
  mensaje = '';
  horariosConsultados = false;
  consultando = false;
  guardando = false;
  cargando = false;
  cancelandoId: number | null = null;

  ngOnInit(): void {
    this.http.get<Paciente[]>(API + '/secretary/patients').subscribe({
      next: datos => this.pacientes = datos,
      error: err => this.error = this.detalleError('No se pudieron cargar los pacientes', err)
    });
    this.http.get<Doctor[]>(API + '/doctors').subscribe({
      next: datos => this.doctores = datos,
      error: err => this.error = this.detalleError('No se pudieron cargar los médicos', err)
    });
    this.cargarCitas();
  }

  get citasFiltradas(): Cita[] {
    const texto = this.busqueda.trim().toLocaleLowerCase();
    return this.citas.filter(c =>
      (!this.filtroFecha || c.fecha === this.filtroFecha) &&
      (this.filtroEstado === 'TODOS' || c.estado === this.filtroEstado) &&
      (!texto || (c.pacienteNombre || '').toLocaleLowerCase().includes(texto)
              || (c.doctorNombre || '').toLocaleLowerCase().includes(texto))
    );
  }

  cargarCitas(): void {
    this.cargando = true;
    this.http.get<Cita[]>(API + '/appointments').subscribe({
      next: datos => {
        this.citas = datos.slice().sort((a, b) =>
          a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        this.error = this.detalleError('No se pudieron consultar las citas', err);
      }
    });
  }

  reiniciarHorarios(): void {
    this.horarios = [];
    this.hora = '';
    this.horariosConsultados = false;
  }

  consultarHorarios(): void {
    this.error = '';
    this.mensaje = '';
    this.reiniciarHorarios();
    if (!this.doctorId || !this.fecha || this.fecha < this.fechaMinima) {
      this.error = 'Seleccione un médico y una fecha válida de hoy en adelante.';
      return;
    }
    this.consultando = true;
    this.http.get<Horario[]>(API + '/schedules/available', {
      params: { doctorId: String(this.doctorId), fecha: this.fecha }
    }).subscribe({
      next: datos => {
        this.consultando = false;
        this.horariosConsultados = true;
        this.horarios = datos;
      },
      error: err => {
        this.consultando = false;
        this.error = this.detalleError('No se pudieron consultar los horarios', err);
      }
    });
  }

  crearCita(): void {
    this.error = '';
    this.mensaje = '';
    if (!this.pacienteId || !this.doctorId || !this.fecha || this.fecha < this.fechaMinima ||
        !this.hora || !this.horarios.some(h => h.horaInicio === this.hora) || !this.motivo.trim()) {
      this.error = 'Complete el paciente, médico, fecha, horario disponible y motivo.';
      return;
    }
    this.guardando = true;
    this.http.post<Cita>(API + '/secretary/appointments', {
      fecha: this.fecha, hora: this.hora, motivo: this.motivo.trim()
    }, {
      params: { pacienteId: String(this.pacienteId), doctorId: String(this.doctorId) }
    }).subscribe({
      next: cita => {
        this.guardando = false;
        this.mensaje = 'Cita #' + cita.id + ' registrada correctamente para el paciente.';
        this.motivo = '';
        this.reiniciarHorarios();
        this.cargarCitas();
      },
      error: err => {
        this.guardando = false;
        this.error = this.detalleError('No se pudo registrar la cita', err);
      }
    });
  }

  cancelarCita(cita: Cita): void {
    if (cita.estado !== 'PENDIENTE' ||
        !confirm('¿Cancelar la cita #' + cita.id + ' de ' + cita.pacienteNombre + '?')) return;
    this.cancelandoId = cita.id;
    this.error = '';
    this.mensaje = '';
    this.http.put<Cita>(API + '/secretary/appointments/' + cita.id + '/cancel', {}).subscribe({
      next: () => {
        this.cancelandoId = null;
        this.mensaje = 'Cita #' + cita.id + ' cancelada correctamente.';
        this.cargarCitas();
      },
      error: err => {
        this.cancelandoId = null;
        this.error = this.detalleError('No se pudo cancelar la cita', err);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroEstado = 'TODOS';
    this.busqueda = '';
  }

  salir(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  private detalleError(mensaje: string, error: any): string {
    return mensaje + ': ' + (error?.error?.mensaje || error?.error?.message || error?.status || 'error de conexión');
  }

  private fechaLocal(fecha: Date): string {
    const valor = (n: number) => String(n).padStart(2, '0');
    return fecha.getFullYear() + '-' + valor(fecha.getMonth() + 1) + '-' + valor(fecha.getDate());
  }
}
