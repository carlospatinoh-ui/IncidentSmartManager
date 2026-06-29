document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Autenticar
        const user = db.authenticate(username, password);

        if (user) {
            // Guardar sesión
            localStorage.setItem('ism_current_user', JSON.stringify(user));

            // Mostrar mensaje de éxito
            showAlert('success', '¡Bienvenido ' + user.nombre + '!');

            // Redirigir al dashboard
            setTimeout(function () {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showAlert('danger', 'Usuario o contraseña incorrectos');
        }
    });

    function showAlert(type, message) {
        // Remover alertas previas
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) existingAlert.remove();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${message}`;

        const form = document.getElementById('loginForm');
        form.parentNode.insertBefore(alert, form);

        if (type === 'success') {
            setTimeout(() => alert.remove(), 3000);
        }
    }
});