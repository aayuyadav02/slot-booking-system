document.addEventListener('DOMContentLoaded', function () {

    document
        .getElementById('bookForm')
        .addEventListener('submit', handleBookFormSubmit);

    loadBookings();
});

function handleBookFormSubmit(event) {

    event.preventDefault();

    const button = document.getElementById('actionButton');
    const date = document.getElementById('date').value;
    const timeSlot = document.getElementById('timeSlot').value;

    if (!date || !timeSlot) {
        alert('Please fill date and time slot');
        return;
    }

    if (button.textContent === 'Check Available Games') {
        // Fetch available games
        fetch(`/api/games/available?bookingDate=${date}&timeSlot=${timeSlot}`)
            .then(response => response.json())
            .then(games => {
                const gameSelect = document.getElementById('gameSelect');
                gameSelect.innerHTML = '<option value="">Select a game</option>';
                games.forEach(game => {
                    const option = document.createElement('option');
                    option.value = game.gameName;
                    option.textContent = game.gameName;
                    gameSelect.appendChild(option);
                });
                document.getElementById('gameSelection').style.display = 'block';
                button.textContent = 'Book Slot';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Something went wrong fetching games');
            });
    } else {
        // Book the slot
        const gameName = document.getElementById('gameSelect').value;
        if (!gameName) {
            alert('Please select a game');
            return;
        }

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
            resetForm();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong');
        });
    }
}

function resetForm() {
    document.getElementById('bookForm').reset();
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('actionButton').textContent = 'Check Available Games';
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
