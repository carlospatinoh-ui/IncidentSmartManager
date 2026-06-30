document.addEventListener('DOMContentLoaded', function () {
    setupUserInfo();
    loadDashboard();
});

function loadDashboard() {
    const stats = db.getStats();

    document.getElementById('kpiTotal').textContent = stats.total;
    document.getElementById('kpiAbiertos').textContent = stats.abiertos;
    document.getElementById('kpiProceso').textContent = stats.enProceso;
    document.getElementById('kpiCerrados').textContent = stats.resueltos + stats.cerrados;

    loadCharts(stats);
    loadRecentIncidents();
}

function loadCharts(stats) {
    // Gráfica de estados
    const ctxEstado = document.getElementById('chartEstado').getContext('2d');
    new Chart(ctxEstado, {
        type: 'doughnut',
        data: {
            labels: ['Abiertos', 'En Proceso', 'Resueltos', 'Cerrados'],
            datasets: [{
                data: [stats.abiertos, stats.enProceso, stats.resueltos, stats.cerrados],
                backgroundColor: ['#e74a3b', '#f6c23e', '#1cc88a', '#858796'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 11 }, padding: 10 }
                }
            }
        }
    });

    // Gráfica de prioridades
    const ctxPrioridad = document.getElementById('chartPrioridad').getContext('2d');
    new Chart(ctxPrioridad, {
        type: 'bar',
        data: {
            labels: ['Crítica', 'Alta', 'Media', 'Baja'],
            datasets: [{
                label: 'Incidentes',
                data: [
                    stats.porPrioridad['critica'] || 0,
                    stats.porPrioridad['alta'] || 0,
                    stats.porPrioridad['media'] || 0,
                    stats.porPrioridad['baja'] || 0
                ],
                backgroundColor: ['#e74a3b', '#f6c23e', '#36b9cc', '#1cc88a'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 10 } }
                },
                x: {
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

function loadRecentIncidents() {
    const incidentes = db.getAll('incidentes');
    const tbody = document.getElementById('recentIncidents');

    const recientes = incidentes
        .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
        .slice(0, 5);

    tbody.innerHTML = recientes.map(inc => `
        <tr style="cursor:pointer" onclick="window.location.href='detalle.html?id=${inc.id}'">
            <td><strong>#${inc.id}</strong></td>
            <td>${inc.titulo}</td>
            <td><span class="badge badge-${inc.prioridad}">${capitalize(inc.prioridad)}</span></td>
            <td><span class="badge badge-${inc.estado}">${formatEstado(inc.estado)}</span></td>
            <td>${formatDate(inc.fechaCreacion)}</td>
        </tr>
    `).join('');
}

function formatEstado(estado) {
    const estados = {
        'abierto': 'Abierto',
        'en_proceso': 'En Proceso',
        'resuelto': 'Resuelto',
        'cerrado': 'Cerrado'
    };
    return estados[estado] || estado;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}
