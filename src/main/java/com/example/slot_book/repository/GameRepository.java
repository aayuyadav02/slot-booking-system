package com.example.slot_book.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.slot_book.model.Game;

public interface GameRepository extends JpaRepository<Game, Long> {
    
}