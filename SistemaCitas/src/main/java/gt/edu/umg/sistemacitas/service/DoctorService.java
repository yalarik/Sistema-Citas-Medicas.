
package gt.edu.umg.sistemacitas.service;

import gt.edu.umg.sistemacitas.entity.Doctor;
import gt.edu.umg.sistemacitas.entity.Especialidad;
import gt.edu.umg.sistemacitas.entity.Rol;
import gt.edu.umg.sistemacitas.entity.Usuario;
import gt.edu.umg.sistemacitas.repository.DoctorRepository;
import gt.edu.umg.sistemacitas.repository.EspecialidadRepository;
import gt.edu.umg.sistemacitas.repository.UsuarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UsuarioRepository usuarioRepository;
    private final EspecialidadRepository especialidadRepository;

    public DoctorService(
            DoctorRepository doctorRepository,
            UsuarioRepository usuarioRepository,
            EspecialidadRepository especialidadRepository) {

        this.doctorRepository = doctorRepository;
        this.usuarioRepository = usuarioRepository;
        this.especialidadRepository = especialidadRepository;
    }

    public List<Doctor> listarTodos() {
        return doctorRepository.findAll();
    }

    public List<Doctor> listarPorEspecialidad(Long especialidadId) {
        return doctorRepository.findByEspecialidadId(especialidadId);
    }

    public Doctor buscarPorId(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Doctor no encontrado"));
    }

    @Transactional
    public Doctor guardar(Doctor doctor) {

        Usuario usuario = validarUsuario(doctor);
        Especialidad especialidad = validarEspecialidad(doctor);

        if (doctor.getNumeroColegiado() == null
                || doctor.getNumeroColegiado().isBlank()) {
            throw new IllegalArgumentException(
                    "El número de colegiado es obligatorio");
        }

        boolean yaEsDoctor = doctorRepository.findAll().stream()
                .anyMatch(d -> d.getUsuario().getId().equals(usuario.getId()));

        if (yaEsDoctor) {
            throw new IllegalArgumentException(
                    "Este usuario ya tiene un perfil médico");
        }

        doctor.setUsuario(usuario);
        doctor.setEspecialidad(especialidad);
        doctor.setNumeroColegiado(doctor.getNumeroColegiado().trim());

        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor actualizar(Long id, Doctor doctor) {

        Doctor existente = buscarPorId(id);

        Usuario usuario = validarUsuario(doctor);
        Especialidad especialidad = validarEspecialidad(doctor);

        if (doctor.getNumeroColegiado() == null
                || doctor.getNumeroColegiado().isBlank()) {
            throw new IllegalArgumentException(
                    "El número de colegiado es obligatorio");
        }

        boolean usuarioOcupado = doctorRepository.findAll().stream()
                .anyMatch(d ->
                        !d.getId().equals(id)
                        && d.getUsuario().getId().equals(usuario.getId()));

        if (usuarioOcupado) {
            throw new IllegalArgumentException(
                    "Este usuario ya pertenece a otro médico");
        }

        existente.setNumeroColegiado(doctor.getNumeroColegiado().trim());
        existente.setBiografia(doctor.getBiografia());
        existente.setUsuario(usuario);
        existente.setEspecialidad(especialidad);

        return doctorRepository.save(existente);
    }

    private Usuario validarUsuario(Doctor doctor) {

        if (doctor.getUsuario() == null
                || doctor.getUsuario().getId() == null) {
            throw new IllegalArgumentException(
                    "Debe seleccionar un usuario");
        }

        Usuario usuario = usuarioRepository.findById(
                doctor.getUsuario().getId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Usuario no encontrado"));

        if (usuario.getRol() != Rol.ROLE_DOCTOR) {
            throw new IllegalArgumentException(
                    "El usuario debe tener el rol de doctor");
        }

        return usuario;
    }

    private Especialidad validarEspecialidad(Doctor doctor) {

        if (doctor.getEspecialidad() == null
                || doctor.getEspecialidad().getId() == null) {
            throw new IllegalArgumentException(
                    "Debe seleccionar una especialidad");
        }

        return especialidadRepository.findById(
                doctor.getEspecialidad().getId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Especialidad no encontrada"));
    }

    public void eliminar(Long id) {

        if (!doctorRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Doctor no encontrado");
        }

        doctorRepository.deleteById(id);
    }
}
