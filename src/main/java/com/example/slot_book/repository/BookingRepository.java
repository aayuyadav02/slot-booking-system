package com.example.slot_book.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.example.slot_book.model.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    
    List<Booking> findByBookingDateAndTimeSlot(String bookingDate, String timeSlot);

    boolean existsByBookingDateAndTimeSlotAndGameName(String bookingDate, String timeSlot, String gameName);
}