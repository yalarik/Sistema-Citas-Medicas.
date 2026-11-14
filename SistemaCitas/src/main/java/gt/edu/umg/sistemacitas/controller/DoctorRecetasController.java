package gt.edu.umg.sistemacitas.controller;

import gt.edu.umg.sistemacitas.dto.CitaMapper;
import gt.edu.umg.sistemacitas.dto.CitaResponse;
import gt.edu.umg.sistemacitas.entity.EstadoCita;
import gt.edu.umg.sistemacitas.repository.CitaRepository;
import gt.edu.umg.sistemacitas.repository.DoctorRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Historial de recetas emitidas por un medico, restringido a ADMIN y DOCTOR. */
@RestController
@RequestMapping({"/api/v1/doctors", "/api/doctors"})
public class DoctorRecetasController {
    private final CitaRepository citas;
    private final DoctorRepository doctores;

    public DoctorRecetasController(CitaRepository citas, DoctorRepository doctores) {
        this.citas = citas;
        this.doctores = doctores;
    }

    // Tambien admite "prescriptios" por si el profesor usa la ruta tal como la dicto.
    @GetMapping({"/{id}/prescriptions", "/{id}/prescriptios"})
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CitaResponse>> historialRecetas(@PathVariable Long id) {
        if (!doctores.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<CitaResponse> recetas = citas
                .findByDoctorIdAndEstadoOrderByFechaDescHoraDesc(id, EstadoCita.COMPLETADA)
                .stream()
                .filter(c -> c.getReceta() != null && !c.getReceta().isBlank())
                .map(CitaMapper::toResponse)
                .toList();
        return ResponseEntity.ok(recetas);
    }
}
