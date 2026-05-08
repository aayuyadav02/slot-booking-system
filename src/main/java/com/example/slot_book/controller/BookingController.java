package com.example.slot_book.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.slot_book.model.Booking;
import com.example.slot_book.model.Game;
import com.example.slot_book.service.BookingService;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/games/available")
    public List<Game> getAvailableGames(
            @RequestParam String bookingDate,
            @RequestParam String timeSlot) {

        return bookingService.getAvailableGames(
                bookingDate,
                timeSlot
        );
    }

    @PostMapping("/bookings")
    public void bookSlot(@RequestBody Booking booking) {

        bookingService.bookSlot(booking);
    }

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {

        return bookingService.getAllBookings();
    }

    @GetMapping("/bookings/check")
    public boolean checkBooking(
            @RequestParam String bookingDate,
            @RequestParam String timeSlot,
            @RequestParam String gameName) {

        return bookingService.isSlotBooked(
                bookingDate,
                timeSlot,
                gameName
        );
    }
}