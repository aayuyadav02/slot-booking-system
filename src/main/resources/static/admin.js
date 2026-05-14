const createManagerForm = document.getElementById('createManagerForm');
const managerMessage = document.getElementById('managerMessage');
const managersContainer = document.getElementById('managersContainer');

function showManagerMessage(message, type = 'info') {
    managerMessage.textContent = message;
    managerMessage.className = `message message-${type}`;
}

async function loadManagers() {
    try {
        const response = await fetch('/api/admin/managers');
        if (!response.ok) {
            throw new Error('Unable to load managers.');
        }

        const managers = await response.json();
        managersContainer.innerHTML = '';

        if (!Array.isArray(managers) || managers.length === 0) {
            managersContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
                    <p>No managers available yet.</p>
                </div>`;
            return;
        }

        managers.forEach(manager => {
            const card = document.createElement('div');
            card.className = 'booking-card animate-in';
            card.innerHTML = `
                <h3>${manager.username}</h3>
                <p><strong>Role:</strong> ${manager.role}</p>
                <button class="btn-primary" data-id="${manager.id}">Remove</button>
            `;
            card.querySelector('button').addEventListener('click', () => deleteManager(manager.id));
            managersContainer.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        managersContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #b91c1c;">
                <p>Failed to load manager accounts.</p>
            </div>`;
    }
}

async function deleteManager(managerId) {
    try {
        const response = await fetch(`/api/admin/managers/${managerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete manager.');
        }

        showManagerMessage('Manager deleted successfully.', 'success');
        loadManagers();
    } catch (error) {
        console.error(error);
        showManagerMessage('Unable to delete manager.', 'error');
    }
}

createManagerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    managerMessage.textContent = '';

    const username = document.getElementById('managerUsername').value.trim();
    const password = document.getElementById('managerPassword').value.trim();

    if (!username || !password) {
        showManagerMessage('Username and password are required.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/admin/managers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Unable to create manager.');
        }

        showManagerMessage('Manager created successfully.', 'success');
        createManagerForm.reset();
        loadManagers();
    } catch (error) {
        console.error(error);
        showManagerMessage(error.message || 'Manager creation failed.', 'error');
    }
});

loadManagers();
