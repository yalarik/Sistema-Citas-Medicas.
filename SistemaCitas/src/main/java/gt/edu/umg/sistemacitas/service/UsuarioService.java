
package gt.edu.umg.sistemacitas.service;

import gt.edu.umg.sistemacitas.entity.Usuario;
import gt.edu.umg.sistemacitas.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    public Usuario guardar(Usuario usuario) {

        if (usuario.getPassword() == null
                || usuario.getPassword().isBlank()) {
            throw new IllegalArgumentException(
                    "La contraseña es obligatoria"
            );
        }

        if (usuario.getRol() == null) {
            throw new IllegalArgumentException(
                    "Debe seleccionar un rol"
            );
        }

        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new IllegalArgumentException(
                    "Ya existe un usuario registrado con ese correo"
            );
        }

        usuario.setPassword(
                passwordEncoder.encode(usuario.getPassword())
        );

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Long id, Usuario usuario) {

        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Usuario no encontrado"
                        )
                );

        if (usuario.getRol() == null) {
            throw new IllegalArgumentException(
                    "Debe seleccionar un rol"
            );
        }

        Optional<Usuario> usuarioConCorreo =
                usuarioRepository.findByCorreo(usuario.getCorreo());

        if (usuarioConCorreo.isPresent()
                && !usuarioConCorreo.get().getId().equals(id)) {
            throw new IllegalArgumentException(
                    "El correo ya pertenece a otro usuario"
            );
        }

        existente.setNombre(usuario.getNombre());
        existente.setCorreo(usuario.getCorreo());
        existente.setRol(usuario.getRol());

        if (usuario.getPassword() != null
                && !usuario.getPassword().isBlank()) {

            existente.setPassword(
                    passwordEncoder.encode(usuario.getPassword())
            );
        }

        return usuarioRepository.save(existente);
    }

    public void eliminar(Long id) {

        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Usuario no encontrado"
            );
        }

        usuarioRepository.deleteById(id);
    }
}
