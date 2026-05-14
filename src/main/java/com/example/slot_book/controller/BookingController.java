package com.example.slot_book.controller;

import com.example.slot_book.model.Booking;
import com.example.slot_book.model.Game;
import com.example.slot_book.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PreAuthorize("hasAnyRole('USER', 'MANAGER')")
    @GetMapping("/games/available")
    public List<Game> getAvailableGames(
            @RequestParam String bookingDate,
            @RequestParam String timeSlot) {

        return bookingService.getAvailableGames(
                bookingDate,
                timeSlot
        );
    }

    @PreAuthorize("hasAnyRole('USER', 'MANAGER')")
    @PostMapping("/bookings")
    public void bookSlot(@RequestBody Booking booking) {
        bookingService.bookSlot(booking);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/bookings/{id}")
    public void deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/bookings/past")
    public void deletePastBookings() {
        bookingService.deletePastBookings();
    }

    @PreAuthorize("hasAnyRole('USER', 'MANAGER')")
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
