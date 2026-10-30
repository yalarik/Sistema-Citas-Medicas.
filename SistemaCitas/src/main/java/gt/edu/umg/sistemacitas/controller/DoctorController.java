package gt.edu.umg.sistemacitas.controller;

import gt.edu.umg.sistemacitas.entity.Doctor;
import gt.edu.umg.sistemacitas.service.DoctorService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> listarTodos(
            @RequestParam(required = false) Long especialidadId) {

        if (especialidadId != null) {
            return ResponseEntity.ok(
                    doctorService.listarPorEspecialidad(
                            especialidadId
                    )
            );
        }

        return ResponseEntity.ok(
                doctorService.listarTodos()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                doctorService.buscarPorId(id)
        );
    }

    @PostMapping
    public ResponseEntity<Doctor> crear(
            @Valid @RequestBody Doctor doctor) {

        Doctor nuevo = doctorService.guardar(doctor);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Doctor doctor) {

        return ResponseEntity.ok(
                doctorService.actualizar(
                        id,
                        doctor
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        doctorService.eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}