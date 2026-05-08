document.addEventListener('DOMContentLoaded', function () {

    document
        .getElementById('bookForm')
        .addEventListener('submit', handleBookFormSubmit);

    loadBookings();
});

function handleBookFormSubmit(event) {

    event.preventDefault();

    const date =
        document.getElementById('date').value;

    const timeSlot =
        document.getElementById('timeSlot').value;

    const gameName =
        document.getElementById('gameName').value;

    if (!date || !timeSlot || !gameName) {

        alert('Please fill all fields');

        return;
    }

    fetch(
        `/api/bookings/check?bookingDate=${date}&timeSlot=${timeSlot}&gameName=${gameName}`
    )

    .then(response => response.json())

    .then(isBooked => {

        if (isBooked) {

            alert('Slot already booked!');

        } else {

            fetch('/api/bookings', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    gameName: gameName,
                    bookingDate: date,
                    timeSlot: timeSlot

                })
            })

            .then(() => {

                alert('Booking Successful');

                loadBookings();

                document.getElementById('bookForm').reset();
            });
        }
    })

    .catch(error => {

        console.error('Error:', error);

        alert('Something went wrong');
    });
}

function loadBookings() {

    fetch('/api/bookings')

    .then(response => response.json())

    .then(data => {

        const bookingsContainer =
            document.getElementById('bookingsContainer');

        bookingsContainer.innerHTML = '';

        if (data.length === 0) {

            bookingsContainer.innerHTML =
                '<p>No bookings yet</p>';

            return;
        }

        data.forEach(booking => {

            const div = document.createElement('div');

            div.classList.add('booking-card');

            div.innerHTML = `
                <h3>${booking.gameName}</h3>
                <p>Date: ${booking.bookingDate}</p>
                <p>Time: ${booking.timeSlot}</p>
            `;

            bookingsContainer.appendChild(div);
        });
    })

    .catch(error => {

        console.error('Load Booking Error:', error);
    });
}
