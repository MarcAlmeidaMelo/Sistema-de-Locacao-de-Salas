// =====================================================================
// FRONTEND APP - CAJUHUB (CORRIGIDO)
// =====================================================================

// =====================================================================
// FUNÇÕES DE UTILIDADE
// =====================================================================

function showAlert(message, type = 'info') {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.marginBottom = '1rem';
    alertDiv.textContent = message;

    container.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatShift(shift) {
    const shifts = {
        'morning': 'Manhã (08:00 - 12:00)',
        'afternoon': 'Tarde (13:00 - 17:00)',
        'evening': 'Noite (18:00 - 22:00)'
    };
    return shifts[shift] || shift;
}

// =====================================================================
// FUNÇÕES DE API - AUTENTICAÇÃO
// =====================================================================

async function checkSession() {
    try {
        const response = await fetch('/api/auth/session', {
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return { authenticated: false };
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// =====================================================================
// FUNÇÕES DE API - SALAS
// =====================================================================

async function getSpaces() {
    try {
        const response = await fetch('/api/spaces', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar salas');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar salas:', error);
        showAlert('Erro ao carregar salas', 'danger');
        throw error;
    }
}

async function getSpace(spaceId) {
    try {
        const response = await fetch(`/api/spaces/${spaceId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar sala');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar sala:', error);
        showAlert('Erro ao carregar sala', 'danger');
        throw error;
    }
}

async function createSpace(spaceData) {
    try {
        const response = await fetch('/api/spaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(spaceData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao criar sala');
        }

        showAlert('Sala criada com sucesso!', 'success');
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        showAlert(error.message || 'Erro ao criar sala', 'danger');
        throw error;
    }
}

async function updateSpace(spaceId, spaceData) {
    try {
        const response = await fetch(`/api/spaces/${spaceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(spaceData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao atualizar sala');
        }

        showAlert('Sala atualizada com sucesso!', 'success');
        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar sala:', error);
        showAlert(error.message || 'Erro ao atualizar sala', 'danger');
        throw error;
    }
}

// =====================================================================
// FUNÇÕES DE API - RESERVAS
// =====================================================================

async function getReservations() {
    try {
        const response = await fetch('/api/reservations', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar reservas');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar reservas:', error);
        showAlert('Erro ao carregar reservas', 'danger');
        throw error;
    }
}

async function createReservation(reservationData) {
    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(reservationData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao criar reserva');
        }

        showAlert('Reserva criada com sucesso!', 'success');
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar reserva:', error);
        showAlert(error.message || 'Erro ao criar reserva', 'danger');
        throw error;
    }
}

async function cancelReservation(reservationId) {
    try {
        const response = await fetch(`/api/reservations/${reservationId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao cancelar reserva');
        }

        showAlert('Reserva cancelada com sucesso!', 'success');
        return await response.json();
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        showAlert(error.message || 'Erro ao cancelar reserva', 'danger');
        throw error;
    }
}

async function confirmCancelReservation(reservationId) {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
        await cancelReservation(reservationId);
        // Recarregar a página ou atualizar a lista
        location.reload();
    }
}

// =====================================================================
// FUNÇÕES DE RENDERIZAÇÃO
// =====================================================================

function renderReservationCard(reservation) {
    const statusClass = reservation.status === 'confirmed' ? 'success' : 'danger';
    const statusText = reservation.status === 'confirmed' ? 'Confirmada' : 'Cancelada';

    return `
    <div class="card" style="margin-bottom: 1rem;">
      <div class="card-header">
        <strong>${reservation.space_name}</strong>
        <span class="reservation-status ${statusClass}" style="float: right;">
          ${statusText}
        </span>
      </div>
      <div class="card-body">
        <p><strong>Data:</strong> ${formatDate(reservation.reservation_date)}</p>
        <p><strong>Turno:</strong> ${formatShift(reservation.shift)}</p>
        <p><strong>Valor:</strong> ${formatCurrency(reservation.price)}</p>
        ${reservation.notes ? `<p><strong>Observações:</strong> ${reservation.notes}</p>` : ''}
      </div>
      <div class="card-footer">
        ${reservation.status === 'confirmed' ? `
          <button class="btn btn-danger btn-small" onclick="confirmCancelReservation(${reservation.id})">
            Cancelar Reserva
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// =====================================================================
// INICIALIZAÇÃO DO LOGIN
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Cajuhub frontend carregado');

    // =========================
    // LOGIN USUÁRIO
    // =========================
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || 'Erro ao fazer login');
                    return;
                }

                window.location.href = '/user-dashboard.html';
            } catch (error) {
                console.error(error);
                alert('Erro de conexão com o servidor');
            }
        });
    }

    // =========================
    // REGISTRO USUÁRIO
    // =========================
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('As senhas não correspondem');
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || 'Erro ao criar conta');
                    return;
                }

                alert('Conta criada com sucesso! Você será redirecionado para o login.');
                window.location.href = '/login.html';
            } catch (error) {
                console.error(error);
                alert('Erro de conexão com o servidor');
            }
        });
    }

    // =========================
    // LOGIN ADMIN
    // =========================
    const adminLoginForm = document.getElementById('adminLoginForm');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/admin-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || 'Erro ao fazer login admin');
                    return;
                }

                window.location.href = '/admin-dashboard.html';
            } catch (error) {
                console.error(error);
                alert('Erro de conexão com o servidor');
            }
        });
    }

    // =========================
    // LOGOUT
    // =========================
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/login.html';
        });
    }

    // =========================
    // CARREGAR SALAS NA INDEX
    // =========================
    const spacesContainer = document.getElementById('spaces-container');

    if (spacesContainer) {
        loadSpacesForIndex();
    }
});

async function loadSpacesForIndex() {
    const container = document.getElementById('spaces-container');

    try {
        const spaces = await getSpaces();

        if (spaces.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">Nenhuma sala disponível no momento.</p>';
            return;
        }

        container.innerHTML = spaces
            .map(space => `
        <div class="card">
          <div class="card-header">${space.name}</div>
          <div class="card-body">
            <p><strong>Descrição:</strong> ${space.description || 'N/A'}</p>
            <p><strong>Capacidade:</strong> ${space.capacity} pessoas</p>
            <p><strong>Tamanho:</strong> ${space.size || 'N/A'}</p>
            <p><strong>Valor:</strong> ${formatCurrency(space.price_per_shift)}/turno</p>
            ${space.amenities && space.amenities.length > 0 ? `
              <p><strong>Comodidades:</strong> ${space.amenities.join(', ')}</p>
            ` : ''}
          </div>
          <div class="card-footer">
            <button class="btn btn-primary" onclick="selectSpaceForReservation(${space.id})">
              Reservar
            </button>
          </div>
        </div>
      `)
            .join('');
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Erro ao carregar salas</div>';
    }
}

function selectSpaceForReservation(spaceId) {
    localStorage.setItem('selectedSpaceId', spaceId);
    window.location.href = '/login.html';
}