package com.example.slot_book;

import com.example.slot_book.model.Game;
import com.example.slot_book.model.User;
import com.example.slot_book.repository.GameRepository;
import com.example.slot_book.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (gameRepository.count() == 0) {
            gameRepository.save(new Game("Volleyball"));
            gameRepository.save(new Game("Basketball"));
            gameRepository.save(new Game("Tennis"));
            gameRepository.save(new Game("Badminton"));
            gameRepository.save(new Game("Chess"));
            System.out.println("Sample games inserted into database!");
        }

        if (userRepository.count() == 0) {
            userRepository.save(new User("admin", passwordEncoder.encode("adminpass"), "ADMIN"));
            userRepository.save(new User("manager", passwordEncoder.encode("managerpass"), "MANAGER"));
            userRepository.save(new User("user", passwordEncoder.encode("userpass"), "USER"));
            System.out.println("Sample users inserted into database!");
        }
    }
}
