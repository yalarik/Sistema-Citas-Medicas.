
package gt.edu.umg.sistemacitas.config;

import gt.edu.umg.sistemacitas.security.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // Seguridad general de la API
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                // Activar CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // API sin sesiones en el servidor
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Permisos de los usuarios
                .authorizeHttpRequests(auth -> auth

                        // LOGIN
                        .requestMatchers(
                                "/api/v1/auth/**"
                        ).permitAll()

                        // SWAGGER
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // USUARIOS
                        .requestMatchers(
                                "/api/v1/users/**"
                        ).hasRole("ADMIN")

                        // DOCTORES - CONSULTAR
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/doctors",
                                "/api/v1/doctors/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "PATIENT",
                                "SECRETARY"
                        )

                        // DOCTORES - CREAR
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/doctors",
                                "/api/v1/doctors/**"
                        ).hasRole("ADMIN")

                        // DOCTORES - ACTUALIZAR
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/doctors/**"
                        ).hasRole("ADMIN")

                        // DOCTORES - ELIMINAR
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/v1/doctors/**"
                        ).hasRole("ADMIN")

                        // ESPECIALIDADES - CONSULTAR
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/specialties",
                                "/api/v1/specialties/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "PATIENT",
                                "SECRETARY"
                        )

                        // ESPECIALIDADES - CREAR
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/specialties",
                                "/api/v1/specialties/**"
                        ).hasRole("ADMIN")

                        // ESPECIALIDADES - ACTUALIZAR
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/specialties/**"
                        ).hasRole("ADMIN")

                        // ESPECIALIDADES - ELIMINAR
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/v1/specialties/**"
                        ).hasRole("ADMIN")

                        // HORARIOS DISPONIBLES
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/schedules/available"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "PATIENT",
                                "SECRETARY"
                        )

                        // CONSULTAR HORARIOS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/schedules",
                                "/api/v1/schedules/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "SECRETARY"
                        )

                        // CREAR HORARIOS
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/schedules",
                                "/api/v1/schedules/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR"
                        )

                        // ACTUALIZAR HORARIOS
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/schedules/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR"
                        )

                        // ELIMINAR HORARIOS
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/v1/schedules/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR"
                        )

                        // HISTORIAL PROPIO DEL PACIENTE
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/appointments/my-history"
                        ).hasRole("PATIENT")

                        // CREAR CITA
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/appointments"
                        ).hasAnyRole(
                                "PATIENT",
                                "SECRETARY",
                                "ADMIN"
                        )

                        // CANCELAR CITA
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/appointments/*/cancel"
                        ).hasAnyRole(
                                "PATIENT",
                                "SECRETARY",
                                "ADMIN"
                        )

                        // REGISTRAR DIAGNOSTICO
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/appointments/*/diagnosis"
                        ).hasRole("DOCTOR")

                        // AGENDA DEL DOCTOR
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/appointments/doctor/**"
                        ).hasAnyRole(
                                "DOCTOR",
                                "ADMIN"
                        )

                        // HISTORIAL DE PACIENTE
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/appointments/patient/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR"
                        )

                        // LISTADO GENERAL DE CITAS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/appointments"
                        ).hasAnyRole(
                                "ADMIN",
                                "DOCTOR",
                                "SECRETARY"
                        )

                        // CUALQUIER OTRA PETICION
                        .anyRequest().authenticated()
                )

                // Validar el token JWT
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // Origenes permitidos para Angular e Ionic
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:4200",
                "http://localhost:8100",
                "http://localhost",
                "capacitor://localhost"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept"
        ));

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // Encriptar contraseñas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Autenticacion del usuario
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}
