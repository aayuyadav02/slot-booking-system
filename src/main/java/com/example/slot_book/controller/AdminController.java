package com.example.slot_book.controller;

import com.example.slot_book.model.User;
import com.example.slot_book.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/managers")
    public List<User> getManagers() {
        return userRepository.findByRole("MANAGER");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/managers")
    public User createManager(@RequestBody ManagerRequest request) {
        User manager = new User(
                request.username(),
                passwordEncoder.encode(request.password()),
                "MANAGER"
        );
        return userRepository.save(manager);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/managers/{id}")
    public void deleteManager(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    public static record ManagerRequest(String username, String password) {
    }
}
