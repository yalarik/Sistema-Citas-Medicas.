/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
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

            // Evita crear el administrador más de una vez
            if (usuarioRepository.findByCorreo(correoAdmin).isEmpty()) {

                Usuario admin = new Usuario();

                admin.setNombre("Administrador");
                admin.setCorreo(correoAdmin);


                admin.setPassword(
                        passwordEncoder.encode("Admin123*")
                );

                admin.setRol(Rol.ROLE_ADMIN);

                usuarioRepository.save(admin);

                System.out.println(
                        "Usuario administrador de prueba creado correctamente."
                );
            }
        };
    }
}