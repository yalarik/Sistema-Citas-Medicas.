
package gt.edu.umg.sistemacitas.service;

import gt.edu.umg.sistemacitas.entity.Doctor;
import gt.edu.umg.sistemacitas.entity.EstadoCita;
import gt.edu.umg.sistemacitas.entity.Horario;
import gt.edu.umg.sistemacitas.repository.CitaRepository;
import gt.edu.umg.sistemacitas.repository.DoctorRepository;
import gt.edu.umg.sistemacitas.repository.HorarioRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final DoctorRepository doctorRepository;
    private final CitaRepository citaRepository;

    public HorarioService(
            HorarioRepository horarioRepository,
            DoctorRepository doctorRepository,
            CitaRepository citaRepository) {

        this.horarioRepository = horarioRepository;
        this.doctorRepository = doctorRepository;
        this.citaRepository = citaRepository;
    }

    public List<Horario> listarTodos() {
        return horarioRepository.findAll();
    }

    public Horario buscarPorId(Long id) {
        return horarioRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Horario no encontrado"
                        ));
    }

    public List<Horario> buscarDisponibles(
            Long doctorId,
            LocalDate fecha) {

        List<Horario> horarios = horarioRepository
                .findByDoctorIdAndFechaAndDisponibleTrue(
                        doctorId,
                        fecha
                );

        return horarios.stream()
                .filter(horario -> {

                    boolean ocupado = citaRepository
                            .existsByDoctorIdAndFechaAndHoraAndEstadoNot(
                                    doctorId,
                                    fecha,
                                    horario.getHoraInicio(),
                                    EstadoCita.CANCELADA
                            );

                    return !ocupado;
                })
                .toList();
    }

    @Transactional
    public Horario crearHorario(
            Long doctorId,
            Horario horario) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Doctor no encontrado"
                        ));

        validarHorario(horario);
        validarSuperposicion(doctorId, horario, null);

        horario.setDoctor(doctor);
        horario.setDisponible(true);

        return horarioRepository.save(horario);
    }

    @Transactional
    public Horario actualizar(
            Long id,
            Horario horario) {

        Horario existente = buscarPorId(id);

        validarHorario(horario);

        Long doctorId = existente.getDoctor().getId();

        boolean tieneCita = citaRepository
                .existsByDoctorIdAndFechaAndHoraAndEstadoNot(
                        doctorId,
                        existente.getFecha(),
                        existente.getHoraInicio(),
                        EstadoCita.CANCELADA
                );

        if (tieneCita) {
            throw new IllegalArgumentException(
                    "No se puede modificar un horario con una cita registrada"
            );
        }

        validarSuperposicion(doctorId, horario, id);

        existente.setFecha(horario.getFecha());
        existente.setHoraInicio(horario.getHoraInicio());
        existente.setHoraFin(horario.getHoraFin());
        existente.setDisponible(horario.getDisponible());

        return horarioRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {

        Horario horario = buscarPorId(id);

        boolean tieneCita = citaRepository
                .existsByDoctorIdAndFechaAndHoraAndEstadoNot(
                        horario.getDoctor().getId(),
                        horario.getFecha(),
                        horario.getHoraInicio(),
                        EstadoCita.CANCELADA
                );

        if (tieneCita) {
            throw new IllegalArgumentException(
                    "No se puede eliminar un horario con una cita registrada"
            );
        }

        horarioRepository.delete(horario);
    }

    private void validarSuperposicion(
            Long doctorId,
            Horario horario,
            Long horarioActualId) {

        List<Horario> horariosExistentes = horarioRepository
                .findByDoctorIdAndFecha(
                        doctorId,
                        horario.getFecha()
                );

        boolean superpuesto = horariosExistentes.stream()
                .filter(h -> horarioActualId == null
                        || !h.getId().equals(horarioActualId))
                .anyMatch(h ->
                        horario.getHoraInicio().isBefore(h.getHoraFin())
                        && horario.getHoraFin().isAfter(h.getHoraInicio())
                );

        if (superpuesto) {
            throw new IllegalArgumentException(
                    "El médico ya tiene un horario que se superpone"
            );
        }
    }

    private void validarHorario(Horario horario) {

        if (horario.getFecha() == null
                || horario.getHoraInicio() == null
                || horario.getHoraFin() == null) {

            throw new IllegalArgumentException(
                    "La fecha y las horas son obligatorias"
            );
        }

        LocalTime inicio = horario.getHoraInicio();
        LocalTime fin = horario.getHoraFin();

        if (!inicio.isBefore(fin)) {
            throw new IllegalArgumentException(
                    "La hora de inicio debe ser anterior a la hora de finalización"
            );
        }

        if (horario.getFecha().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "No se pueden crear horarios en fechas anteriores"
            );
        }
    }
}
