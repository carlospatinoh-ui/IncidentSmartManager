
document.addEventListener('DOMContentLoaded', function () {
    setupUserInfo();
    loadReports();
});

function loadReports() {
    const incidentes = db.getAll('incidentes');
    const stats = db.getStats();

    const hoy = new Date().toDateString();
    const resueltosHoy = incidentes.filter(i =>
        i.estado === 'resuelto' && new Date(i.fechaActualizacion).toDateString() === hoy
    ).length;
    document.getElementById('reportResueltos').textContent = resueltosHoy;

    const resueltos = incidentes.filter(i => i.estado === 'resuelto' || i.estado === 'cerrado');
    let tiempoPromedio = 0;
    if (resueltos.length > 0) {
        const tiempos = resueltos.map(i => {
            return (new Date(i.fechaActualizacion) - new Date(i.fechaCreacion)) / (1000 * 60 * 60);
        });
        tiempoPromedio = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
    }
    document.getElementById('reportTiempoProm').textContent = tiempoPromedio + 'h';
    document.getElementById('reportCriticos').textContent = stats.criticos;
    
    const sla = incidentes.length > 0 ? Math.round((resueltos.length / incidentes.length) * 100) : 0;
    document.getElementById('reportSLA').textContent = sla + '%';

    loadReportCharts(incidentes, stats);
    loadReportTable(stats, incidentes);
}

function loadReportCharts(incidentes, stats) {
    // Tendencia 7 días
    const labels7dias = [];
    const data7dias = [];
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        labels7dias.push(fecha.toLocaleDateString('es-ES', { weekday: 'short' }));
        data7dias.push(incidentes.filter(inc =>
            new Date(inc.fechaCreacion).toDateString() === fecha.toDateString()
        ).length);
    }

    new Chart(document.getElementById('chartTendencia'), {
        type: 'line',
        data: {
            labels: labels7dias,
            datasets: [{
                label: 'Incidentes',
                data: data7dias,
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78,115,223,0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 } } },
                x: { ticks: { font: { size: 9 } } }
            }
        }
    });

    // Por Categoría
    new Chart(document.getElementById('chartCategoria'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats.porCategoria).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [{
                data: Object.values(stats.porCategoria),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 9 }, padding: 8, boxWidth: 10 } }
            }
        }
    });

    // Por Técnico
    const usuarios = db.getAll('usuarios');
    const tecnicos = usuarios.filter(u => u.rol === 'tecnico');
    new Chart(document.getElementById('chartTecnico'), {
        type: 'bar',
        data: {
            labels: tecnicos.map(t => t.nombre.split(' ')[0]),
            datasets: [{
                label: 'Asignados',
                data: tecnicos.map(t => incidentes.filter(i => parseInt(i.asignado) === t.id).length),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 } } },
                y: { ticks: { font: { size: 9 } } }
            }
        }
    });

    // Por Prioridad
    new Chart(document.getElementById('chartPrioridadReport'), {
        type: 'pie',
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
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 9 }, padding: 8, boxWidth: 10 } }
            }
        }
    });
}

function loadReportTable(stats, incidentes) {
    const resueltos = incidentes.filter(i => i.estado === 'resuelto' || i.estado === 'cerrado');
    const sla = incidentes.length > 0 ? Math.round((resueltos.length / incidentes.length) * 100) : 0;
    
    const metrics = [
        { m: 'Total incidentes', v: stats.total, e: 'info' },
        { m: 'Abiertos', v: stats.abiertos, e: stats.abiertos > 3 ? 'danger' : 'success' },
        { m: 'En proceso', v: stats.enProceso, e: 'warning' },
        { m: 'Resueltos', v: stats.resueltos, e: 'success' },
        { m: 'Críticos', v: stats.criticos, e: stats.criticos > 0 ? 'danger' : 'success' },
        { m: 'Tasa resolución', v: sla + '%', e: sla >= 70 ? 'success' : 'warning' }
    ];

    document.getElementById('reportTable').innerHTML = metrics.map(m => `
        <tr>
            <td><strong>${m.m}</strong></td>
            <td>${m.v}</td>
            <td><span class="badge bg-${m.e}">${m.e}</span></td>
        </tr>
    `).join('');
}

function exportReport() {
    const incidentes = db.getAll('incidentes');
    let csv = 'ID,Titulo,Categoria,Prioridad,Estado,Sistema,Fecha Creacion\n';
    incidentes.forEach(inc => {
        csv += `${inc.id},"${inc.titulo}",${inc.categoria},${inc.prioridad},${inc.estado},"${inc.sistema}",${inc.fechaCreacion}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}
