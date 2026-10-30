import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

const API = 'http://localhost:8080/api/v1';

type EstadoCita = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';

interface Cita {
  id: number;
  fecha: string;
  hora: string;
  pacienteNombre: string;
  doctorId: number;
  doctorNombre: string;
  motivo: string;
  estado: EstadoCita;
}

interface ResumenDoctor {
  id: number;
  nombre: string;
  total: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
}

@Component({
  selector: 'app-reportes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="reportes">
      <header class="encabezado">
        <div>
          <h1>Reportes administrativos</h1>
          <p>Resumen de citas y productividad médica</p>
        </div>
        <div class="botones">
          <button type="button" (click)="volver()">Volver al administrador</button>
          <button type="button" (click)="actualizar()" [disabled]="cargando">Actualizar datos</button>
          <button type="button" (click)="exportarCSV()" [disabled]="!citasFiltradas.length">Exportar CSV</button>
        </div>
      </header>

      <p class="error" role="alert" *ngIf="error">{{ error }}</p>
      <p *ngIf="cargando">Cargando reportes...</p>

      <section class="tarjeta">
        <h2>Filtros del reporte</h2>
        <div class="filtros">
          <label>Desde <input type="date" name="desde" [(ngModel)]="desde"></label>
          <label>Hasta <input type="date" name="hasta" [(ngModel)]="hasta"></label>
          <label>Médico
            <select name="doctor" [(ngModel)]="filtroDoctor">
              <option [ngValue]="0">Todos los médicos</option>
              <option *ngFor="let d of medicos" [ngValue]="d.id">{{ d.nombre }}</option>
            </select>
          </label>
          <button type="button" (click)="limpiar()">Limpiar filtros</button>
        </div>
        <p *ngIf="desde && hasta && desde > hasta" class="error">La fecha inicial no puede ser posterior a la fecha final.</p>
      </section>

      <section class="indicadores" aria-label="Indicadores de citas">
        <div class="indicador"><span>Total de citas</span><strong>{{ citasFiltradas.length }}</strong></div>
        <div class="indicador"><span>Pendientes</span><strong>{{ contar('PENDIENTE') }}</strong></div>
        <div class="indicador"><span>Completadas</span><strong>{{ contar('COMPLETADA') }}</strong></div>
        <div class="indicador"><span>Canceladas</span><strong>{{ contar('CANCELADA') }}</strong></div>
      </section>

      <section class="tarjeta">
        <h2>Resumen por médico</h2>
        <div class="tabla-contenedor">
          <table>
            <thead><tr><th>Médico</th><th>Citas</th><th>Pendientes</th><th>Completadas</th><th>Canceladas</th></tr></thead>
            <tbody>
              <tr *ngFor="let d of resumenPorDoctor">
                <td>{{ d.nombre }}</td><td>{{ d.total }}</td><td>{{ d.pendientes }}</td>
                <td>{{ d.completadas }}</td><td>{{ d.canceladas }}</td>
              </tr>
              <tr *ngIf="resumenPorDoctor.length === 0"><td colspan="5">Sin citas dentro de los filtros elegidos.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="tarjeta">
        <h2>Detalle de citas</h2>
        <div class="tabla-contenedor">
          <table>
            <thead><tr><th>ID</th><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Médico</th><th>Motivo</th><th>Estado</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of citasFiltradas">
                <td>{{ c.id }}</td><td>{{ c.fecha }}</td><td>{{ c.hora }}</td>
                <td>{{ c.pacienteNombre }}</td><td>{{ c.doctorNombre }}</td>
                <td>{{ c.motivo }}</td><td>{{ c.estado }}</td>
              </tr>
              <tr *ngIf="!citasFiltradas.length"><td colspan="7">No hay citas registradas en el período seleccionado.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display:block; }
    .reportes { max-width:1240px; margin:auto; padding:12px 18px 40px; }
    .encabezado { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
    .encabezado h1 { margin-bottom:4px; }
    .encabezado p { color:#526173; margin-top:0; }
    .botones { display:flex; flex-wrap:wrap; gap:8px; }
    .tarjeta { background:white; border:1px solid #d8e2eb; border-radius:12px; padding:20px; margin:18px 0; }
    .tarjeta h2 { margin:0 0 14px; }
    .filtros { display:flex; align-items:end; gap:14px; flex-wrap:wrap; }
    .filtros label { display:grid; gap:6px; font-weight:600; }
    input, select { padding:9px; border:1px solid #9dacbb; border-radius:6px; font:inherit; }
    button { padding:10px 14px; border-radius:7px; border:1px solid #6c84a4; cursor:pointer; }
    button[disabled] { opacity:.55; cursor:not-allowed; }
    .indicadores { display:grid; grid-template-columns:repeat(auto-fit,minmax(175px,1fr)); gap:14px; margin:18px 0; }
    .indicador { display:flex; flex-direction:column; gap:6px; background:#eef4fa; border:1px solid #c9d8e8; border-radius:10px; padding:18px; }
    .indicador span { font-weight:600; }
    .indicador strong { font-size:2rem; }
    .tabla-contenedor { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:9px; border-bottom:1px solid #d8e2eb; text-align:left; vertical-align:top; }
    th { background:#eef4fa; }
    .error { color:#a11616; background:#ffecec; padding:10px; border-radius:7px; }
  `]
})
export class ReportesPageComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  citas: Cita[] = [];
  desde = '';
  hasta = '';
  filtroDoctor = 0;
  error = '';
  cargando = false;

  ngOnInit(): void {
    this.actualizar();
  }

  get medicos(): { id: number; nombre: string }[] {
    const mapa = new Map<number, string>();
    for (const cita of this.citas) {
      if (cita.doctorId) mapa.set(cita.doctorId, cita.doctorNombre || 'Médico #' + cita.doctorId);
    }
    return [...mapa.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get citasFiltradas(): Cita[] {
    if (this.desde && this.hasta && this.desde > this.hasta) return [];
    return this.citas.filter(c =>
      (!this.desde || c.fecha >= this.desde) &&
      (!this.hasta || c.fecha <= this.hasta) &&
      (!this.filtroDoctor || c.doctorId === this.filtroDoctor)
    );
  }

  contar(estado: EstadoCita): number {
    return this.citasFiltradas.filter(c => c.estado === estado).length;
  }

  get resumenPorDoctor(): ResumenDoctor[] {
    const datos = new Map<number, ResumenDoctor>();
    for (const c of this.citasFiltradas) {
      if (!datos.has(c.doctorId)) {
        datos.set(c.doctorId, {
          id: c.doctorId, nombre: c.doctorNombre || 'Médico #' + c.doctorId,
          total: 0, pendientes: 0, completadas: 0, canceladas: 0
        });
      }
      const item = datos.get(c.doctorId)!;
      item.total++;
      if (c.estado === 'PENDIENTE') item.pendientes++;
      if (c.estado === 'COMPLETADA') item.completadas++;
      if (c.estado === 'CANCELADA') item.canceladas++;
    }
    return [...datos.values()].sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
  }

  actualizar(): void {
    this.error = '';
    this.cargando = true;
    this.http.get<Cita[]>(API + '/appointments').subscribe({
      next: datos => {
        this.citas = datos.slice().sort((a, b) =>
          b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        this.error = 'No se pudieron cargar los reportes: ' +
          (err?.error?.mensaje || err?.status || 'sin conexión');
      }
    });
  }

  limpiar(): void {
    this.desde = '';
    this.hasta = '';
    this.filtroDoctor = 0;
  }

  exportarCSV(): void {
    const columnas = ['ID', 'Fecha', 'Hora', 'Paciente', 'Médico', 'Motivo', 'Estado'];
    const lineas = [columnas, ...this.citasFiltradas.map(c => [
      String(c.id), c.fecha, c.hora, c.pacienteNombre, c.doctorNombre, c.motivo, c.estado
    ])];
    const escapar = (texto: string): string => {
      let valor = String(texto ?? '').replace(/\r|\n/g, ' ');
      if (/^[=+@\-]/.test(valor.trimStart())) valor = "'" + valor;
      return '"' + valor.replace(/"/g, '""') + '"';
    };
    const csv = '\uFEFF' + lineas.map(fila => fila.map(escapar).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'reporte_citas.csv';
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  volver(): void {
    this.router.navigate(['/admin']);
  }
}
