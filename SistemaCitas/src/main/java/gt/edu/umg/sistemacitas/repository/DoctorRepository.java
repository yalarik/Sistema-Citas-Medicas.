package gt.edu.umg.sistemacitas.repository;

import gt.edu.umg.sistemacitas.entity.Doctor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByEspecialidadId(Long especialidadId);
}