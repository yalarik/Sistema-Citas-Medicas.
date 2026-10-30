//dto         = controla los datos 
//controla los datos que entran y salen de la API.
//Ejemplo: CitaRequest, CitaResponse, CitaMapper. “En dto defino qué información
//recibe y devuelve la API sin exponer directamente toda la entidad.”
package gt.edu.umg.sistemacitas.dto;

import gt.edu.umg.sistemacitas.entity.Cita;

public class CitaMapper {

    private CitaMapper() {
    }

    public static Cita toEntity(CitaRequest request) {

        Cita cita = new Cita();

        cita.setFecha(request.getFecha());
        cita.setHora(request.getHora());
        cita.setMotivo(request.getMotivo());

        return cita;
    }

    public static CitaResponse toResponse(Cita cita) {

        CitaResponse response = new CitaResponse();

        response.setId(cita.getId());
        response.setFecha(cita.getFecha());
        response.setHora(cita.getHora());
        response.setMotivo(cita.getMotivo());
        response.setDiagnostico(cita.getDiagnostico());
        response.setReceta(cita.getReceta());
        response.setEstado(cita.getEstado());

        if (cita.getDoctor() != null) {
            response.setDoctorId(cita.getDoctor().getId());

            if (cita.getDoctor().getUsuario() != null) {
                response.setDoctorNombre(
                        cita.getDoctor()
                                .getUsuario()
                                .getNombre()
                );
            }
        }

        if (cita.getPaciente() != null) {
            response.setPacienteId(
                    cita.getPaciente().getId()
            );

            response.setPacienteNombre(
                    cita.getPaciente().getNombre()
            );
        }

        return response;
    }
}