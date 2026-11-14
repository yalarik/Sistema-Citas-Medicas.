import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

const API = 'http://localhost:8080/api/v1';

@Component({
  selector: 'app-cancel-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="cancelacion">
      <h2>Motivo de cancelación</h2>
      <p>Explicá brevemente por qué necesitás cancelar tu cita.</p>
      <textarea
        aria-label="Motivo de cancelación"
        name="motivoCancelacion"
        [(ngModel)]="motivoCancelacion"
        rows="5"
        maxlength="499"
        placeholder="Escribí aquí el motivo de la cancelación"
        required></textarea>
      <button type="button" (click)="confirmar()" [disabled]="enviando || !motivoCancelacion.trim()">
        {{ enviando ? 'Confirmando...' : 'Confirmar' }}
      </button>
      <p role="status" *ngIf="mensaje">{{ mensaje }}</p>
      <p role="alert" class="error" *ngIf="error">{{ error }}</p>
    </main>
  `,
  styles: [`
    .cancelacion { max-width: 540px; margin: 38px auto; padding: 25px; border: 1px solid #dbe3ed; background: #fff; border-radius: 12px; font-family: Arial, sans-serif; }
    textarea { display: block; box-sizing: border-box; width: 100%; padding: 12px; border: 1px solid #aebdcd; border-radius: 8px; resize: vertical; }
    button { margin-top: 16px; border: 0; border-radius: 8px; padding: 11px 20px; background: #1860a5; color: white; cursor: pointer; }
    button:disabled { background: #a9b5c1; cursor: not-allowed; }
    .error { color: #a41e22; }
  `]
})
export class CancelAppointmentComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  motivoCancelacion = '';
  mensaje = '';
  error = '';
  enviando = false;

  confirmar(): void {
    this.error = '';
    this.mensaje = '';
    const motivo = this.motivoCancelacion.trim();
    if (!motivo) {
      this.error = 'El motivo de cancelación es obligatorio.';
      return;
    }

    // La vista es pública para que se pueda presentar sin iniciar sesión.
    // Una cancelación real SIEMPRE requiere la cita y JWT de paciente.
    const citaId = Number(this.route.snapshot.queryParamMap.get('citaId'));
    const tieneSesionPaciente = !!sessionStorage.getItem('token') &&
      sessionStorage.getItem('rol') === 'ROLE_PATIENT';
    if (!Number.isInteger(citaId) || citaId <= 0 || !tieneSesionPaciente) {
      this.mensaje = 'Motivo completado. Para cancelar una cita real, iniciá sesión como paciente y abrí la opción Cancelar desde Mis citas.';
      return;
    }

    this.enviando = true;
    // El endpoint actual cancela la cita, pero aún NO almacena el motivo en MySQL.
    this.http.put(API + '/appointments/' + citaId + '/cancel', {}).subscribe({
      next: () => {
        this.mensaje = 'Cita cancelada correctamente. El motivo se utilizó como confirmación en esta vista y no se guardó en la base de datos.';
        this.enviando = false;
      },
      error: (e) => {
        this.error = 'No fue posible cancelar la cita: ' + (e.error?.mensaje || e.status);
        this.enviando = false;
      }
    });
  }
}
