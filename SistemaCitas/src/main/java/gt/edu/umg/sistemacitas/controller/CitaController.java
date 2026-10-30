package gt.edu.umg.sistemacitas.controller;

import gt.edu.umg.sistemacitas.dto.CitaMapper;
import gt.edu.umg.sistemacitas.dto.CitaRequest;
import gt.edu.umg.sistemacitas.dto.CitaResponse;
import gt.edu.umg.sistemacitas.entity.Cita;
import gt.edu.umg.sistemacitas.service.CitaService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/appointments")
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    // Listado general de citas
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'SECRETARY')")
    public ResponseEntity<List<CitaResponse>> listarTodas() {

        return ResponseEntity.ok(
                citaService.listarTodas()
                        .stream()
                        .map(CitaMapper::toResponse)
                        .toList()
        );
    }

    // Consultar una cita verificando los permisos
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT', 'SECRETARY')")
    public ResponseEntity<CitaResponse> buscarPorId(
            @PathVariable Long id,
            Authentication authentication) {

        Cita cita = citaService.buscarPorIdAutorizado(
                id,
                authentication.getName(),
                tieneRol(authentication, "ROLE_ADMIN"),
                tieneRol(authentication, "ROLE_SECRETARY")
        );

        return ResponseEntity.ok(
                CitaMapper.toResponse(cita)
        );
    }

    // Registrar una nueva cita
    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'SECRETARY', 'ADMIN')")
    public ResponseEntity<CitaResponse> crearCita(
            @RequestParam Long doctorId,
            @Valid @RequestBody CitaRequest request,
            Authentication authentication) {

        Cita cita = CitaMapper.toEntity(request);

        Cita nueva = citaService.crearCitaPaciente(
                authentication.getName(),
                doctorId,
                cita
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(CitaMapper.toResponse(nueva));
    }

    // Consultar el historial del paciente conectado
    @GetMapping("/my-history")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<CitaResponse>> miHistorial(
            Authentication authentication) {

        return ResponseEntity.ok(
                citaService.historialPacientePorCorreo(
                        authentication.getName()
                )
                        .stream()
                        .map(CitaMapper::toResponse)
                        .toList()
        );
    }

    // Consultar historial de un paciente
    @GetMapping("/patient/{pacienteId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<CitaResponse>> historialPaciente(
            @PathVariable Long pacienteId) {

        return ResponseEntity.ok(
                citaService.historialPaciente(pacienteId)
                        .stream()
                        .map(CitaMapper::toResponse)
                        .toList()
        );
    }

    // Consultar agenda y bloquear accesos no autorizados
    @GetMapping("/doctor/{doctorId}/agenda")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<CitaResponse>> agendaDoctor(
            @PathVariable Long doctorId,
            @RequestParam LocalDate fecha,
            Authentication authentication) {

        try {

            List<CitaResponse> respuestas = citaService.agendaDoctor(
                    doctorId,
                    fecha,
                    authentication.getName(),
                    tieneRol(authentication, "ROLE_ADMIN")
            )
                    .stream()
                    .map(CitaMapper::toResponse)
                    .toList();

            return ResponseEntity.ok(respuestas);

        } catch (AccessDeniedException ex) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }
    }

    // Cancelar cita del paciente autenticado
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT', 'SECRETARY', 'ADMIN')")
    public ResponseEntity<CitaResponse> cancelar(
            @PathVariable Long id,
            Authentication authentication) {

        Cita cita = citaService.cancelarCitaPaciente(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(
                CitaMapper.toResponse(cita)
        );
    }

    // Registrar diagnostico del medico responsable
    @PutMapping("/{id}/diagnosis")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<CitaResponse> registrarDiagnostico(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos,
            Authentication authentication) {

        Cita cita = citaService.registrarDiagnostico(
                id,
                datos.get("diagnostico"),
                datos.get("receta"),
                authentication.getName()
        );

        return ResponseEntity.ok(
                CitaMapper.toResponse(cita)
        );
    }

    // Comprobar el rol del usuario autenticado
    private boolean tieneRol(
            Authentication authentication,
            String rol) {

        return authentication.getAuthorities()
                .stream()
                .anyMatch(autoridad ->
                        rol.equals(autoridad.getAuthority())
                );
    }
}