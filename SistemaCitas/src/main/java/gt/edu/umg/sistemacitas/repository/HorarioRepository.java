
package gt.edu.umg.sistemacitas.repository;

import gt.edu.umg.sistemacitas.entity.Horario;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HorarioRepository extends JpaRepository<Horario, Long> {

    List<Horario> findByDoctorIdAndFechaAndDisponibleTrue(
            Long doctorId,
            LocalDate fecha
    );

    boolean existsByDoctorIdAndFechaAndDisponibleTrueAndHoraInicioLessThanEqualAndHoraFinGreaterThan(
            Long doctorId,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin
    );

    List<Horario> findByDoctorIdAndFecha(
            Long doctorId,
            LocalDate fecha
    );
}
