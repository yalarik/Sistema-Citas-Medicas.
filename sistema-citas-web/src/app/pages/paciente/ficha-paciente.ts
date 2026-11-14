import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';

interface PerfilPaciente {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

@Component({
  selector: 'app-ficha-paciente',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="ficha">
      <header>
        <h2>Ficha del paciente</h2>
        <p>Datos personales de tu cuenta en el Sistema de Citas Médicas.</p>
      </header>
      <p *ngIf="cargando" role="status">Cargando datos del paciente...</p>
      <p *ngIf="error" role="alert" class="error">{{ error }}</p>
      <dl *ngIf="perfil as p">
        <dt>ID de usuario</dt><dd>{{ p.id }}</dd>
        <dt>Nombre completo</dt><dd>{{ p.nombre }}</dd>
        <dt>Correo electrónico</dt><dd>{{ p.correo }}</dd>
        <dt>Tipo de usuario</dt><dd>{{ p.rol === 'ROLE_PATIENT' ? 'Paciente' : p.rol }}</dd>
      </dl>
    </main>
  `,
  styles: [`
    .ficha { max-width: 700px; margin: 38px auto; padding: 28px; background: #fff; border: 1px solid #dbe3ed; border-radius: 12px; font-family: Arial, sans-serif; }
    h2 { color: #123657; margin: 0 0 8px; }
    header p { color: #536678; }
    dl { display: grid; grid-template-columns: 170px 1fr; gap: 12px 18px; border-top: 1px solid #e4eaf0; padding-top: 22px; }
    dt { font-weight: 700; color: #476177; }
    dd { margin: 0; overflow-wrap: anywhere; }
    .error { color: #ae1f2c; }
    @media(max-width:520px) { dl { grid-template-columns: 1fr; gap: 4px; } dd { margin-bottom: 12px; } }
  `]
})
export class FichaPacienteComponent implements OnInit {
  private readonly http = inject(HttpClient);
  perfil: PerfilPaciente | null = null;
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.http.get<PerfilPaciente>('http://localhost:8080/api/v1/profile/me').subscribe({
      next: (dato) => { this.perfil = dato; this.cargando = false; },
      error: () => { this.cargando = false; this.error = 'No se pudieron consultar tus datos. Iniciá sesión como paciente.'; }
    });
  }
}
