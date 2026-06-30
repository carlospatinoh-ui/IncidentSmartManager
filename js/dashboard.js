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
    // Gráfica Estado - Compacta
    new Chart(document.getElementById('chartEstado'), {
        type: 'doughnut',
        data: {
            labels: ['Abiertos', 'Proceso', 'Resueltos', 'Cerrados'],
            datasets: [{
                data: [stats.abiertos, stats.enProceso, stats.resueltos, stats.cerrados],
                backgroundColor: ['#e74a3b', '#f6c23e', '#1cc88a', '#858796'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        font: { size: 10 },
                        padding: 8,
                        boxWidth: 12
                    }
                }
            },
            layout: {
                padding: { top: 10, bottom: 10 }
            }
        }
    });

    // Gráfica Prioridad - Compacta
    new Chart(document.getElementById('chartPrioridad'), {
        type: 'bar',
        data: {
            labels: ['Crítica', 'Alta', 'Media', 'Baja'],
            datasets: [{
                data: [
                    stats.porPrioridad['critica'] || 0,
                    stats.porPrioridad['alta'] || 0,
                    stats.porPrioridad['media'] || 0,
                    stats.porPrioridad['baja'] || 0
                ],
                backgroundColor: ['#e74a3b', '#f6c23e', '#36b9cc', '#1cc88a'],
                borderRadius: 4
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
                    ticks: { stepSize: 1, font: { size: 9 } },
                    grid: { display: false }
                },
                x: {
                    ticks: { font: { size: 9 } },
                    grid: { display: false }
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
        <tr onclick="window.location.href='detalle.html?id=${inc.id}'" style="cursor:pointer">
            <td><strong>#${inc.id}</strong></td>
            <td>${inc.titulo.substring(0, 30)}${inc.titulo.length > 30 ? '...' : ''}</td>
            <td><span class="badge badge-${inc.prioridad}">${inc.prioridad}</span></td>
            <td><span class="badge badge-${inc.estado}">${formatEstado(inc.estado)}</span></td>
            <td>${formatDate(inc.fechaCreacion)}</td>
        </tr>
    `).join('');
}

function formatEstado(estado) {
    return {
        'abierto': 'Abierto',
        'en_proceso': 'Proceso',
        'resuelto': 'Resuelto',
        'cerrado': 'Cerrado'
    }[estado] || estado;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}
