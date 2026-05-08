package com.example.slot_book;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.slot_book.model.Game;
import com.example.slot_book.repository.GameRepository;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private GameRepository gameRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Check if games already exist
        if (gameRepository.count() == 0) {
            // Insert sample games
            gameRepository.save(new Game("Volleyball"));
            gameRepository.save(new Game("Basketball"));
            gameRepository.save(new Game("Tennis"));
            gameRepository.save(new Game("Badminton"));
            gameRepository.save(new Game("Chess"));
            System.out.println("Sample games inserted into database!");
        }
    }
}
