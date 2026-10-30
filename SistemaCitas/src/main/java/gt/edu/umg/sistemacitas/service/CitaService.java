package gt.edu.umg.sistemacitas.service;

import gt.edu.umg.sistemacitas.entity.Cita;
import gt.edu.umg.sistemacitas.entity.Doctor;
import gt.edu.umg.sistemacitas.entity.EstadoCita;
import gt.edu.umg.sistemacitas.entity.Usuario;
import gt.edu.umg.sistemacitas.repository.CitaRepository;
import gt.edu.umg.sistemacitas.repository.DoctorRepository;
import gt.edu.umg.sistemacitas.repository.HorarioRepository;
import gt.edu.umg.sistemacitas.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final DoctorRepository doctorRepository;
    private final UsuarioRepository usuarioRepository;
    private final HorarioRepository horarioRepository;

    public CitaService(
            CitaRepository citaRepository,
            DoctorRepository doctorRepository,
            UsuarioRepository usuarioRepository,
            HorarioRepository horarioRepository) {

        this.citaRepository = citaRepository;
        this.doctorRepository = doctorRepository;
        this.usuarioRepository = usuarioRepository;
        this.horarioRepository = horarioRepository;
    }

    // Consultas de citas

    public List<Cita> listarTodas() {
        return citaRepository.findAll();
    }

    public Cita buscarPorId(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Cita no encontrada"
                        )
                );
    }

    // Verificar permisos para consultar una cita

    public Cita buscarPorIdAutorizado(
            Long id,
            String correo,
            boolean administrador,
            boolean secretaria) {

        Cita cita = buscarPorId(id);

        if (administrador
                || secretaria
                || esPacienteDeCita(cita, correo)
                || esDoctorDeCita(cita, correo)) {

            return cita;
        }

        throw new AccessDeniedException(
                "No tienes permiso para consultar esta cita"
        );
    }

    // Historial de citas de un paciente

    public List<Cita> historialPaciente(Long pacienteId) {
        return citaRepository.findByPacienteId(pacienteId);
    }

    // Historial del paciente autenticado

    public List<Cita> historialPacientePorCorreo(String correo) {

        Usuario paciente = buscarUsuario(correo);

        return citaRepository.findByPacienteId(
                paciente.getId()
        );
    }

    // Agenda medica con verificacion de permisos

    @Transactional(readOnly = true)
    public List<Cita> agendaDoctor(
            Long doctorId,
            LocalDate fecha,
            String correo,
            boolean administrador) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Doctor no encontrado"
                        )
                );

        if (!administrador
                && (doctor.getUsuario() == null
                || !correo.equalsIgnoreCase(
                        doctor.getUsuario().getCorreo()))) {

            throw new AccessDeniedException(
                    "No tienes permiso para consultar esta agenda"
            );
        }

        return citaRepository.findByDoctorIdAndFecha(
                doctorId,
                fecha
        );
    }

    // Registro de citas

    @Transactional
    public Cita crearCita(
            Long pacienteId,
            Long doctorId,
            Cita cita) {

        Usuario paciente = usuarioRepository.findById(pacienteId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Paciente no encontrado"
                        )
                );

        return guardarNuevaCita(
                paciente,
                doctorId,
                cita
        );
    }

    // Registro de citas desde el paciente autenticado

    @Transactional
    public Cita crearCitaPaciente(
            String correo,
            Long doctorId,
            Cita cita) {

        return guardarNuevaCita(
                buscarUsuario(correo),
                doctorId,
                cita
        );
    }

    // Guardar cita con sus validaciones

    private Cita guardarNuevaCita(
            Usuario paciente,
            Long doctorId,
            Cita cita) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Doctor no encontrado"
                        )
                );

        validarDatosCita(cita);

        validarHorarioDoctor(
                doctorId,
                cita
        );

        validarDisponibilidadDoctor(
                doctorId,
                cita
        );

        cita.setPaciente(paciente);
        cita.setDoctor(doctor);
        cita.setEstado(EstadoCita.PENDIENTE);

        return citaRepository.save(cita);
    }

    // Cancelacion de citas

    @Transactional
    public Cita cancelarCita(Long id) {

        Cita cita = buscarPorId(id);

        validarCancelacion(cita);

        cita.setEstado(EstadoCita.CANCELADA);

        return citaRepository.save(cita);
    }

    // Cancelar solamente citas del paciente autenticado

    @Transactional
    public Cita cancelarCitaPaciente(
            Long id,
            String correo) {

        Cita cita = buscarPorId(id);

        if (!esPacienteDeCita(cita, correo)) {

            throw new AccessDeniedException(
                    "No tienes permiso para cancelar esta cita"
            );
        }

        validarCancelacion(cita);

        cita.setEstado(EstadoCita.CANCELADA);

        return citaRepository.save(cita);
    }

    // Validar estado antes de cancelar

    private void validarCancelacion(Cita cita) {

        if (cita.getEstado() == EstadoCita.COMPLETADA) {

            throw new IllegalArgumentException(
                    "Una cita completada no puede cancelarse"
            );
        }

        if (cita.getEstado() == EstadoCita.CANCELADA) {

            throw new IllegalArgumentException(
                    "La cita ya se encuentra cancelada"
            );
        }
    }

    // Registrar diagnostico del medico responsable

    @Transactional
    public Cita registrarDiagnostico(
            Long id,
            String diagnostico,
            String receta,
            String correo) {

        Cita cita = buscarPorId(id);

        if (!esDoctorDeCita(cita, correo)) {

            throw new AccessDeniedException(
                    "No tienes permiso para diagnosticar esta cita"
            );
        }

        if (cita.getEstado() != EstadoCita.PENDIENTE) {

            throw new IllegalArgumentException(
                    "Solo se pueden diagnosticar citas pendientes"
            );
        }

        if (diagnostico == null || diagnostico.isBlank()) {

            throw new IllegalArgumentException(
                    "El diagnostico es obligatorio"
            );
        }

        cita.setDiagnostico(diagnostico.trim());
        cita.setReceta(receta);
        cita.setEstado(EstadoCita.COMPLETADA);

        return citaRepository.save(cita);
    }

    // Buscar usuario por correo

    private Usuario buscarUsuario(String correo) {

        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Usuario no encontrado"
                        )
                );
    }

    // Comprobar que la cita pertenece al paciente

    private boolean esPacienteDeCita(
            Cita cita,
            String correo) {

        return cita.getPaciente() != null
                && cita.getPaciente().getCorreo() != null
                && cita.getPaciente()
                        .getCorreo()
                        .equalsIgnoreCase(correo);
    }

    // Comprobar que la cita pertenece al medico

    private boolean esDoctorDeCita(
            Cita cita,
            String correo) {

        return cita.getDoctor() != null
                && cita.getDoctor().getUsuario() != null
                && cita.getDoctor().getUsuario().getCorreo() != null
                && cita.getDoctor()
                        .getUsuario()
                        .getCorreo()
                        .equalsIgnoreCase(correo);
    }

    // Validaciones de fecha, hora y motivo

    private void validarDatosCita(Cita cita) {

        if (cita.getFecha() == null
                || cita.getHora() == null) {

            throw new IllegalArgumentException(
                    "La fecha y la hora son obligatorias"
            );
        }

        if (cita.getFecha().isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "No se puede crear una cita en una fecha anterior"
            );
        }

        if (cita.getMotivo() == null
                || cita.getMotivo().isBlank()) {

            throw new IllegalArgumentException(
                    "El motivo de la cita es obligatorio"
            );
        }
    }

    // Validar que el medico tenga horario disponible

    private void validarHorarioDoctor(
            Long doctorId,
            Cita cita) {

        boolean dentroDelHorario = horarioRepository
                .existsByDoctorIdAndFechaAndDisponibleTrueAndHoraInicioLessThanEqualAndHoraFinGreaterThan(
                        doctorId,
                        cita.getFecha(),
                        cita.getHora(),
                        cita.getHora()
                );

        if (!dentroDelHorario) {

            throw new IllegalArgumentException(
                    "El doctor no tiene disponibilidad en esa fecha y hora"
            );
        }
    }

    // Evitar reservas duplicadas en el mismo horario

    private void validarDisponibilidadDoctor(
            Long doctorId,
            Cita cita) {

        boolean existeCita = citaRepository
                .existsByDoctorIdAndFechaAndHoraAndEstadoNot(
                        doctorId,
                        cita.getFecha(),
                        cita.getHora(),
                        EstadoCita.CANCELADA
                );

        if (existeCita) {

            throw new IllegalArgumentException(
                    "El doctor ya tiene una cita programada en esa fecha y hora"
            );
        }
    }
}