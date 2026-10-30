
package gt.edu.umg.sistemacitas.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    // La clave JWT se obtiene de una variable de entorno.
    // No guardar claves privadas directamente en el codigo.
    private static final String SECRET_KEY = System.getenv("JWT_SECRET");

    // Duracion del token: 24 horas.
    private static final long EXPIRATION_TIME = 1000L * 60 * 60 * 24;

    // Generar token cuando el usuario inicia sesion.
    public String generarToken(UserDetails userDetails) {

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(
                        System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();
    }

    // Obtener el correo almacenado en el token.
    public String extraerCorreo(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    // Obtener la fecha de vencimiento del token.
    public Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    // Obtener un dato especifico del token.
    public <T> T extraerClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        Claims claims = extraerTodosLosClaims(token);

        return claimsResolver.apply(claims);
    }

    // Verificar que el token corresponda al usuario.
    public boolean esTokenValido(
            String token,
            UserDetails userDetails) {

        String correo = extraerCorreo(token);

        return correo.equals(userDetails.getUsername())
                && !estaExpirado(token);
    }

    // Comprobar si el token ha vencido.
    private boolean estaExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    // Leer y verificar los datos del token.
    private Claims extraerTodosLosClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Obtener la clave privada desde Windows.
    private SecretKey getSigningKey() {

        if (SECRET_KEY == null || SECRET_KEY.isBlank()) {
            throw new IllegalStateException(
                    "Falta configurar la variable de entorno JWT_SECRET"
            );
        }

        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY.trim());

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET debe contener al menos 32 bytes"
            );
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
