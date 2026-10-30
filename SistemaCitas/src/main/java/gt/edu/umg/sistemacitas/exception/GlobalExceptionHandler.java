package gt.edu.umg.sistemacitas.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Errores de permisos y acceso denegado
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> manejarAccesoDenegado(
            AccessDeniedException ex) {

        return crearRespuesta(
                HttpStatus.FORBIDDEN,
                "Acceso denegado",
                ex.getMessage()
        );
    }

    // Errores por datos incorrectos
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarIllegalArgument(
            IllegalArgumentException ex) {

        return crearRespuesta(
                HttpStatus.BAD_REQUEST,
                "Solicitud inválida",
                ex.getMessage()
        );
    }

    // Errores de validacion
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidaciones(
            MethodArgumentNotValidException ex) {

        Map<String, Object> errores = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errores.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        Map<String, Object> respuesta = new HashMap<>();

        respuesta.put("fecha", LocalDateTime.now());
        respuesta.put("estado", HttpStatus.BAD_REQUEST.value());
        respuesta.put("error", "Error de validación");
        respuesta.put("campos", errores);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(respuesta);
    }

    // Errores generales del servidor
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarGeneral(
            Exception ex) {

        // Detectar accesos denegados dentro de excepciones generales
        Throwable causa = ex;

        while (causa != null) {

            if (causa instanceof AccessDeniedException) {

                return crearRespuesta(
                        HttpStatus.FORBIDDEN,
                        "Acceso denegado",
                        causa.getMessage()
                );
            }

            causa = causa.getCause();
        }

        return crearRespuesta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del servidor",
                "Ocurrió un error inesperado"
        );
    }

    // Crear respuestas HTTP con un formato uniforme
    private ResponseEntity<Map<String, Object>> crearRespuesta(
            HttpStatus estado,
            String error,
            String mensaje) {

        Map<String, Object> respuesta = new HashMap<>();

        respuesta.put("fecha", LocalDateTime.now());
        respuesta.put("estado", estado.value());
        respuesta.put("error", error);
        respuesta.put("mensaje", mensaje);

        return ResponseEntity
                .status(estado)
                .body(respuesta);
    }
}