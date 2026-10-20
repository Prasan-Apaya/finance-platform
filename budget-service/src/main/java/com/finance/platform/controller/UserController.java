package com.finance.platform.controller;

import com.finance.platform.dto.LoginRequest;
import com.finance.platform.dto.UserResponse;
import com.finance.platform.dto.RegisterRequest;
import com.finance.platform.entity.User;
import com.finance.platform.repository.UserRepository;
import com.finance.platform.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(JwtTokenProvider jwtTokenProvider,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest authRequest) {
        System.out.println("HIT LOGIN CONTROLLER WITH EMAIL: " + authRequest.email());
        User user = userRepository.findByEmail(authRequest.email())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        System.out.println("FOUND USER: " + user.getEmail() + ", HASH: " + user.getPasswordHash());
        if (!passwordEncoder.matches(authRequest.password(), user.getPasswordHash())) {
            System.out.println("PASSWORD MATCH FAILED!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = jwtTokenProvider.generateToken(user.getId().toString(), user.getEmail());

        UserResponse response = new UserResponse(token, user.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.email())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User user = new User(registerRequest.email(), registerRequest.displayName(),
                passwordEncoder.encode(registerRequest.password()));
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId().toString(), user.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("email", registerRequest.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}