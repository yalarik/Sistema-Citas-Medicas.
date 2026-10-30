/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package gt.edu.umg.sistemacitas.service;

import gt.edu.umg.sistemacitas.entity.Especialidad;
import gt.edu.umg.sistemacitas.repository.EspecialidadRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    public EspecialidadService(EspecialidadRepository especialidadRepository) {
        this.especialidadRepository = especialidadRepository;
    }

    public List<Especialidad> listarTodas() {
        return especialidadRepository.findAll();
    }

    public Especialidad buscarPorId(Long id) {
        return especialidadRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Especialidad no encontrada"));
    }

    public Especialidad guardar(Especialidad especialidad) {
        return especialidadRepository.save(especialidad);
    }

    public Especialidad actualizar(Long id, Especialidad especialidad) {

        Especialidad existente = buscarPorId(id);

        existente.setNombre(especialidad.getNombre());
        existente.setDescripcion(especialidad.getDescripcion());

        return especialidadRepository.save(existente);
    }

    public void eliminar(Long id) {

        if (!especialidadRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Especialidad no encontrada"
            );
        }

        especialidadRepository.deleteById(id);
    }
}
