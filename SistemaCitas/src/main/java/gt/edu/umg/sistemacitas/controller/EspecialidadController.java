/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package gt.edu.umg.sistemacitas.controller;

import gt.edu.umg.sistemacitas.entity.Especialidad;
import gt.edu.umg.sistemacitas.service.EspecialidadService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/specialties")
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    public EspecialidadController(EspecialidadService especialidadService) {
        this.especialidadService = especialidadService;
    }

    @GetMapping
    public ResponseEntity<List<Especialidad>> listarTodas() {
        return ResponseEntity.ok(
                especialidadService.listarTodas()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Especialidad> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                especialidadService.buscarPorId(id)
        );
    }

    @PostMapping
    public ResponseEntity<Especialidad> crear(
            @Valid @RequestBody Especialidad especialidad) {

        Especialidad nueva =
                especialidadService.guardar(especialidad);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nueva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Especialidad> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Especialidad especialidad) {

        return ResponseEntity.ok(
                especialidadService.actualizar(id, especialidad)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        especialidadService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}