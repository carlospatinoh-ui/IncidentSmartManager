document.addEventListener('DOMContentLoaded', function () {
    setupUserInfo();
    loadUsers();
});

function loadUsers() {
    const usuarios = db.getAll('usuarios');
    const tbody = document.getElementById('usersTable');

    tbody.innerHTML = usuarios.map(user => `
        <tr>
            <td><strong>#${user.id}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width:35px;height:35px;font-size:0.8rem;">
                        ${user.nombre.charAt(0).toUpperCase()}
                    </div>
                    ${user.nombre}
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="badge bg-${getRoleColor(user.rol)}">${capitalize(user.rol)}</span></td>
            <td><span class="badge bg-${user.estado === 'activo' ? 'success' : 'secondary'}">${capitalize(user.estado)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser(${user.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openUserModal() {
    document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;
}

function editUser(id) {
    const user = db.getById('usuarios', id);
    if (!user) return;

    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    document.getElementById('userId').value = user.id;
    document.getElementById('userNombre').value = user.nombre;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = false;
    document.getElementById('userRol').value = user.rol;
    document.getElementById('userEstado').value = user.estado;

    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

function saveUser() {
    const id = document.getElementById('userId').value;
    const nombre = document.getElementById('userNombre').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const username = document.getElementById('userUsername').value.trim();
    const password = document.getElementById('userPassword').value;
    const rol = document.getElementById('userRol').value;
    const estado = document.getElementById('userEstado').value;

    // Validaciones
    if (!nombre || !email || !username) {
        showToast('Por favor complete todos los campos obligatorios', 'warning');
        return;
    }

    if (!id && !password) {
        showToast('La contraseña es obligatoria para nuevos usuarios', 'warning');
        return;
    }

    if (id) {
        // Editar
        const updates = { nombre, email, username, rol, estado };
        if (password) updates.password = password;
        db.update('usuarios', id, updates);
        showToast('Usuario actualizado correctamente', 'success');
    } else {
        // Crear
        db.create('usuarios', {
            nombre,
            email,
            username,
            password,
            rol,
            estado,
            fechaCreacion: new Date().toISOString()
        });
        showToast('Usuario creado correctamente', 'success');
    }

    // Cerrar modal y recargar
    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    loadUsers();
}

function deleteUser(id) {
    if (id === 1) {
        showToast('No se puede eliminar el usuario administrador principal', 'danger');
        return;
    }

    if (confirm('¿Está seguro de eliminar este usuario?')) {
        db.delete('usuarios', id);
        showToast('Usuario eliminado correctamente', 'success');
        loadUsers();
    }
}

function getRoleColor(rol) {
    const colors = {
        'admin': 'danger',
        'tecnico': 'primary',
        'usuario': 'info'
    };
    return colors[rol] || 'secondary';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, type) {
    // Crear toast container si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.style.cssText = 'min-width:300px;animation:fadeIn 0.3s ease;';
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}