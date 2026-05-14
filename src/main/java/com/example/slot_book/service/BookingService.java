package com.example.slot_book.service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.slot_book.model.Booking;
import com.example.slot_book.model.Game;
import com.example.slot_book.repository.BookingRepository;
import com.example.slot_book.repository.GameRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final GameRepository gameRepository;

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          GameRepository gameRepository) {

        this.bookingRepository = bookingRepository;
        this.gameRepository = gameRepository;
    }

    public boolean isSlotBooked(String bookingDate, String timeSlot, String gameName) {
        return bookingRepository.existsByBookingDateAndTimeSlotAndGameName(bookingDate, timeSlot, gameName);
    }

    // Get all available games
    public List<Game> getAvailableGames(String bookingDate, String timeSlot) {

        // Fetch all games from database
        List<Game> allGames = gameRepository.findAll();

        // Fetch all bookings for selected date and time
        List<Booking> bookedGames = bookingRepository
                .findByBookingDateAndTimeSlot(bookingDate, timeSlot);

        // Store booked game names in a Set
        Set<String> bookedGameNames = bookedGames.stream()
                .map(Booking::getGameName)
                .collect(Collectors.toSet());

        // Return only available games
        return allGames.stream()
                .filter(game -> !bookedGameNames.contains(game.getGameName()))
                .collect(Collectors.toList());
    }

    // Book a slot
    public void bookSlot(Booking booking) {

        // Check if game is already booked for same date and time
        boolean alreadyBooked = bookingRepository.existsByBookingDateAndTimeSlotAndGameName(
                booking.getBookingDate(),
                booking.getTimeSlot(),
                booking.getGameName()
        );

        // Prevent double booking
        if (alreadyBooked) {
            throw new RuntimeException("Game already booked for this slot!");
        }

        // Save booking
        bookingRepository.save(booking);
    }

    // Get all current and future bookings only
    public List<Booking> getAllBookings() {
        LocalDate today = LocalDate.now();

        return bookingRepository.findAll().stream()
                .filter(booking -> !isPastBooking(booking.getBookingDate(), today))
                .collect(Collectors.toList());
    }

    // Delete past bookings from the database
    public void deletePastBookings() {
        LocalDate today = LocalDate.now();

        List<Booking> expiredBookings = bookingRepository.findAll().stream()
                .filter(booking -> isPastBooking(booking.getBookingDate(), today))
                .collect(Collectors.toList());

        bookingRepository.deleteAll(expiredBookings);
    }

    // Delete a booking by id
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    private boolean isPastBooking(String bookingDate, LocalDate today) {
        if (bookingDate == null || bookingDate.isBlank()) {
            return false;
        }

        try {
            LocalDate bookingLocalDate = LocalDate.parse(bookingDate);
            return bookingLocalDate.isBefore(today);
        } catch (DateTimeParseException e) {
            return false;
        }
    }
}