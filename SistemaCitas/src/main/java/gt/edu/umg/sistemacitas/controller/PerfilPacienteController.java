package gt.edu.umg.sistemacitas.controller;

import gt.edu.umg.sistemacitas.entity.Usuario;
import gt.edu.umg.sistemacitas.repository.UsuarioRepository;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Devuelve solo el perfil del usuario autenticado. Nunca la contrasena.
 * Solo el paciente puede consultar esta ficha (no recibe datos de terceros).
 */
@RestController
@RequestMapping("/api/v1/profile")
public class PerfilPacienteController {

    private final UsuarioRepository usuarioRepository;

    public PerfilPacienteController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<FichaPaciente> miFicha(Principal principal) {
        Usuario u = usuarioRepository.findByCorreo(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return ResponseEntity.ok(new FichaPaciente(
                u.getId(), u.getNombre(), u.getCorreo(), u.getRol().name()));
    }

    public record FichaPaciente(Long id, String nombre, String correo, String rol) { }
}
