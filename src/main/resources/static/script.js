const dateInput = document.getElementById('date');
const timeInput = document.getElementById('timeSlot');
const gameSelection = document.getElementById('gameSelection');
const gameSelect = document.getElementById('gameSelect');
const actionButton = document.getElementById('actionButton');
const bookForm = document.getElementById('bookForm');
const formMessage = document.getElementById('formMessage');

let hasLoadedAvailableGames = false;

function showMessage(message, type = 'info') {
    if (!formMessage) {
        alert(message);
        return;
    }

    formMessage.textContent = message;
    formMessage.className = `message message-${type}`;
}

function clearMessage() {
    if (formMessage) {
        formMessage.textContent = '';
        formMessage.className = 'message';
    }
}

function resetGameSelection() {
    gameSelect.innerHTML = '<option value="">Choose a game...</option>';
    gameSelection.style.display = 'none';
    hasLoadedAvailableGames = false;
    actionButton.textContent = 'Check Available Games';
}

function handleBookFormSubmit(event) {
    event.preventDefault();
    clearMessage();

    const bookingDate = dateInput.value;
    const timeSlot = timeInput.value;

    if (!bookingDate || !timeSlot) {
        showMessage('Please select both a date and a time.', 'error');
        return;
    }

    if (!hasLoadedAvailableGames) {
        fetchAvailableGames(bookingDate, timeSlot);
    } else {
        const selectedGame = gameSelect.value;

        if (!selectedGame) {
            showMessage('Please select an available game to book.', 'error');
            return;
        }

        bookGame(bookingDate, timeSlot, selectedGame);
    }
}

function fetchAvailableGames(bookingDate, timeSlot) {
    fetch(`/api/games/available?bookingDate=${encodeURIComponent(bookingDate)}&timeSlot=${encodeURIComponent(timeSlot)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load available games.');
            }
            return response.json();
        })
        .then(games => {
            if (!Array.isArray(games) || games.length === 0) {
                resetGameSelection();
                showMessage('No games are available for the selected date and time.', 'warning');
                return;
            }

            gameSelect.innerHTML = '<option value="">Choose a game...</option>' +
                games.map(game => `<option value="${game.gameName}">${game.gameName}</option>`).join('');

            gameSelection.style.display = 'block';
            hasLoadedAvailableGames = true;
            actionButton.textContent = 'Book Selected Game';
            showMessage(`Found ${games.length} available game(s). Select one to book.`, 'success');
        })
        .catch(error => {
            console.error('Fetch Available Games Error:', error);
            showMessage('Unable to load available games at this time.', 'error');
        });
}

function bookGame(bookingDate, timeSlot, gameName) {
    fetch('/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            bookingDate,
            timeSlot,
            gameName
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Unable to book the selected game.');
                });
            }
            return response.text();
        })
        .then(() => {
            showMessage('Booking confirmed! Your slot has been reserved.', 'success');
            resetGameSelection();
            bookForm.reset();
            loadBookings();
        })
        .catch(error => {
            console.error('Book Game Error:', error);
            showMessage(error.message || 'Booking failed. Please try again.', 'error');
        });
}

function loadBookings() {
    fetch('/api/bookings')
        .then(response => response.json())
        .then(data => {
            const bookingsContainer = document.getElementById('bookingsContainer');
            bookingsContainer.innerHTML = '';

            if (data.length === 0) {
                bookingsContainer.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
                        <p>No bookings found. Start by checking available games!</p>
                    </div>`;
                return;
            }

            data.forEach(booking => {
                const div = document.createElement('div');
                div.classList.add('booking-card', 'animate-in');
                div.innerHTML = `
                    <h3>${booking.gameName}</h3>
                    <p><strong>📅 Date:</strong> ${booking.bookingDate}</p>
                    <p><strong>⏰ Time:</strong> ${booking.timeSlot}</p>
                `;
                bookingsContainer.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Load Booking Error:', error);
        });
}

function initialize() {
    resetGameSelection();
    bookForm.addEventListener('submit', handleBookFormSubmit);
    dateInput.addEventListener('change', () => {
        if (hasLoadedAvailableGames) {
            resetGameSelection();
            clearMessage();
        }
    });
    timeInput.addEventListener('change', () => {
        if (hasLoadedAvailableGames) {
            resetGameSelection();
            clearMessage();
        }
    });

    loadBookings();
}

initialize();
