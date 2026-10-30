/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package gt.edu.umg.sistemacitas.controller;

import gt.edu.umg.sistemacitas.entity.Horario;
import gt.edu.umg.sistemacitas.service.HorarioService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/schedules")
public class HorarioController {

    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @GetMapping
    public ResponseEntity<List<Horario>> listarTodos() {
        return ResponseEntity.ok(
                horarioService.listarTodos()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Horario> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                horarioService.buscarPorId(id)
        );
    }

    @GetMapping("/available")
    public ResponseEntity<List<Horario>> buscarDisponibles(
            @RequestParam Long doctorId,
            @RequestParam LocalDate fecha) {

        return ResponseEntity.ok(
                horarioService.buscarDisponibles(doctorId, fecha)
        );
    }

    @PostMapping("/doctor/{doctorId}")
    public ResponseEntity<Horario> crear(
            @PathVariable Long doctorId,
            @Valid @RequestBody Horario horario) {

        Horario nuevo =
                horarioService.crearHorario(doctorId, horario);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Horario> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Horario horario) {

        return ResponseEntity.ok(
                horarioService.actualizar(id, horario)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        horarioService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}
