const dateInput = document.getElementById('date');
const timeInput = document.getElementById('timeSlot');
const gameSelection = document.getElementById('gameSelection');
const gameSelect = document.getElementById('gameSelect');
const actionButton = document.getElementById('actionButton');
const bookForm = document.getElementById('bookForm');
const formMessage = document.getElementById('formMessage');
const userBadge = document.getElementById('userBadge');
const bookingsContainer = document.getElementById('bookingsContainer');
const adminLinkContainer = document.getElementById('adminLinkContainer');
const managerActions = document.getElementById('managerActions');
const deletePastButton = document.getElementById('deletePastButton');
const managerActionMessage = document.getElementById('managerActionMessage');

let hasLoadedAvailableGames = false;
let currentRole = null;

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

                if (currentRole === 'MANAGER') {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete Booking';
                    deleteBtn.className = 'btn-primary';
                    deleteBtn.style.marginTop = '12px';
                    deleteBtn.addEventListener('click', () => deleteBooking(booking.id));
                    div.appendChild(deleteBtn);
                }

                bookingsContainer.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Load Booking Error:', error);
        });
}

function deleteBooking(id) {
    fetch(`/api/bookings/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete booking.');
            }
            loadBookings();
        })
        .catch(error => {
            console.error('Delete Booking Error:', error);
            showMessage('Unable to delete booking.', 'error');
        });
}

function handleDeletePastBookings() {
    fetch('/api/bookings/past', { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete past bookings.');
            }
            managerActionMessage.textContent = 'Past bookings deleted successfully.';
            managerActionMessage.className = 'message message-success';
            loadBookings();
        })
        .catch(error => {
            console.error('Delete Past Bookings Error:', error);
            managerActionMessage.textContent = 'Unable to delete past bookings.';
            managerActionMessage.className = 'message message-error';
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

    fetchUserInfo();
}

function fetchUserInfo() {
    fetch('/api/auth/me')
        .then(response => {
            if (!response.ok) {
                window.location.href = '/login.html';
                return;
            }
            return response.json();
        })
        .then(user => {
            if (!user) {
                return;
            }

            currentRole = user.role;
            userBadge.textContent = `${user.username} (${user.role})`;

            if (currentRole === 'MANAGER' || currentRole === 'ADMIN') {
                loadBookings();
            } else {
                bookingsContainer.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
                        <p>Your current role is <strong>${user.role}</strong>. Booking overview is available for managers only.</p>
                    </div>`;
            }

            if (currentRole === 'MANAGER' && managerActions) {
                managerActions.style.display = 'block';
                deletePastButton.addEventListener('click', handleDeletePastBookings);
            }

            if (currentRole === 'ADMIN' && adminLinkContainer) {
                adminLinkContainer.style.display = 'inline-flex';
            }
        })
        .catch(() => {
            window.location.href = '/login.html';
        });
}

initialize();
