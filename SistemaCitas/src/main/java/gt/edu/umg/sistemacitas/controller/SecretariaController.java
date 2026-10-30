package gt.edu.umg.sistemacitas.controller;

import gt.edu.umg.sistemacitas.dto.CitaMapper;
import gt.edu.umg.sistemacitas.dto.CitaRequest;
import gt.edu.umg.sistemacitas.dto.CitaResponse;
import gt.edu.umg.sistemacitas.entity.Rol;
import gt.edu.umg.sistemacitas.entity.Usuario;
import gt.edu.umg.sistemacitas.repository.UsuarioRepository;
import gt.edu.umg.sistemacitas.service.CitaService;
import jakarta.validation.Valid;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Funciones de recepción; no modifica los flujos actuales del paciente. */
@RestController
@RequestMapping("/api/v1/secretary")
@PreAuthorize("hasRole('SECRETARY')")
public class SecretariaController {

    private final UsuarioRepository usuarios;
    private final CitaService citas;

    public SecretariaController(UsuarioRepository usuarios, CitaService citas) {
        this.usuarios = usuarios;
        this.citas = citas;
    }

    public record PacienteBasico(Long id, String nombre, String correo) { }

    @GetMapping("/patients")
    public List<PacienteBasico> pacientes() {
        return usuarios.findAll().stream()
                .filter(u -> u.getRol() == Rol.ROLE_PATIENT)
                .sorted(Comparator.comparing(Usuario::getNombre, String.CASE_INSENSITIVE_ORDER))
                .map(u -> new PacienteBasico(u.getId(), u.getNombre(), u.getCorreo()))
                .toList();
    }

    @PostMapping("/appointments")
    public ResponseEntity<CitaResponse> registrarCita(
            @RequestParam Long pacienteId,
            @RequestParam Long doctorId,
            @Valid @RequestBody CitaRequest solicitud) {

        Usuario paciente = usuarios.findById(pacienteId)
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));
        if (paciente.getRol() != Rol.ROLE_PATIENT) {
            throw new IllegalArgumentException("El usuario seleccionado no es un paciente");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                CitaMapper.toResponse(citas.crearCita(
                        pacienteId, doctorId, CitaMapper.toEntity(solicitud))));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<CitaResponse> cancelarCita(@PathVariable Long id) {
        return ResponseEntity.ok(CitaMapper.toResponse(citas.cancelarCita(id)));
    }
}
