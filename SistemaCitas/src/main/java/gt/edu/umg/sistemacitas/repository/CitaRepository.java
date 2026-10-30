//repository  = habla con la base de datos  se comunica con la base de datos.
// Aquí buscas, guardas, actualizas o eliminas registros.
package gt.edu.umg.sistemacitas.repository;

import gt.edu.umg.sistemacitas.entity.Cita;
import gt.edu.umg.sistemacitas.entity.EstadoCita;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByPacienteId(Long pacienteId);

    List<Cita> findByDoctorIdAndFecha(
            Long doctorId,
            LocalDate fecha
    );

    List<Cita> findByEstado(
            EstadoCita estado
    );

    boolean existsByDoctorIdAndFechaAndHoraAndEstadoNot(
            Long doctorId,
            LocalDate fecha,
            LocalTime hora,
            EstadoCita estado
    );
}