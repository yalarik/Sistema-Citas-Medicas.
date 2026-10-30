
package gt.edu.umg.sistemacitas.config;

import gt.edu.umg.sistemacitas.entity.Rol;
import gt.edu.umg.sistemacitas.entity.Usuario;
import gt.edu.umg.sistemacitas.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner inicializarUsuarios(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String correoAdmin = "admin@citas.com";

            // No modificar administradores existentes
            if (usuarioRepository.findByCorreo(correoAdmin).isPresent()) {
                return;
            }

            // Obtener la contraseña desde Windows
            String clave = System.getenv("ADMIN_BOOTSTRAP_PASSWORD");

            if (clave == null || clave.length() < 12) {
                System.out.println(
                        "Administrador inicial no creado: configure ADMIN_BOOTSTRAP_PASSWORD con al menos 12 caracteres."
                );
                return;
            }

            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setCorreo(correoAdmin);
            admin.setPassword(passwordEncoder.encode(clave));
            admin.setRol(Rol.ROLE_ADMIN);

            usuarioRepository.save(admin);

            System.out.println("Administrador inicial creado.");
        };
    }
}
