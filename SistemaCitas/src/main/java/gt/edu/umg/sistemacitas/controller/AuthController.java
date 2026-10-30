//controller  = recibe peticiones
//crea los endpoints que usa Swagger.
//Aquí aparecen los GET, POST, PUT, etc.
//Frase: “En controller expongo las funciones del sistema como una API REST.”
/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package gt.edu.umg.sistemacitas.controller;

import gt.edu.umg.sistemacitas.dto.LoginRequest;
import gt.edu.umg.sistemacitas.dto.LoginResponse;
import gt.edu.umg.sistemacitas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}