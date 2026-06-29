document.addEventListener('DOMContentLoaded', function () {
    setupUserInfo();
    loadReports();
});

function loadReports() {
    const incidentes = db.getAll('incidentes');
    const stats = db.getStats();

    // KPIs de reportes
    const hoy = new Date().toDateString();
    const resueltosHoy = incidentes.filter(i =>
        i.estado === 'resuelto' &&
        new Date(i.fechaActualizacion).toDateString() === hoy
    ).length;

    document.getElementById('reportResueltos').textContent = resueltosHoy;

    // Tiempo promedio de resolución (simulado)
    const resueltos = incidentes.filter(i => i.estado === 'resuelto' || i.estado === 'cerrado');
    let tiempoPromedio = 0;
    if (resueltos.length > 0) {
        const tiempos = resueltos.map(i => {
            const creacion = new Date(i.fechaCreacion);
            const actualizacion = new Date(i.fechaActualizacion);
            return (actualizacion - creacion) / (1000 * 60 * 60); // horas
        });
        tiempoPromedio = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
    }
    document.getElementById('reportTiempoProm').textContent = tiempoPromedio + 'h';

    document.getElementById('reportCriticos').textContent = stats.criticos;

    // SLA (simulado - % de incidentes resueltos a tiempo)
    const sla = incidentes.length > 0 ? Math.round((resueltos.length / incidentes.length) * 100) : 0;
    document.getElementById('reportSLA').textContent = sla + '%';

    // Cargar gráficas
    loadReportCharts(incidentes, stats);

    // Cargar tabla de resumen
    loadReportTable(stats, incidentes);
}

function loadReportCharts(incidentes, stats) {
    // 1. Tendencia de incidentes (últimos 7 días)
    const ctxTendencia = document.getElementById('chartTendencia').getContext('2d');
    const labels7dias = [];
    const data7dias = [];

    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toDateString();
        labels7dias.push(fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));

        const count = incidentes.filter(inc =>
            new Date(inc.fechaCreacion).toDateString() === fechaStr
        ).length;
        data7dias.push(count);
    }

    new Chart(ctxTendencia, {
        type: 'line',
        data: {
            labels: labels7dias,
            datasets: [{
                label: 'Incidentes creados',
                data: data7dias,
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4e73df',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });

    // 2. Incidentes por categoría (Doughnut)
    const ctxCategoria = document.getElementById('chartCategoria').getContext('2d');
    const categorias = stats.porCategoria;
    new Chart(ctxCategoria, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categorias).map(c => capitalize(c)),
            datasets: [{
                data: Object.values(categorias),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // 3. Incidentes por técnico (Bar)
    const ctxTecnico = document.getElementById('chartTecnico').getContext('2d');
    const usuarios = db.getAll('usuarios');
    const tecnicos = usuarios.filter(u => u.rol === 'tecnico');
    const tecnicosLabels = tecnicos.map(t => t.nombre.split(' ')[0]);
    const tecnicosData = tecnicos.map(t => {
        return incidentes.filter(i => parseInt(i.asignado) === t.id).length;
    });

    new Chart(ctxTecnico, {
        type: 'bar',
        data: {
            labels: tecnicosLabels,
            datasets: [{
                label: 'Incidentes asignados',
                data: tecnicosData,
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });

    // 4. Distribución por prioridad (Pie)
    const ctxPrioridad = document.getElementById('chartPrioridadReport').getContext('2d');
    new Chart(ctxPrioridad, {
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
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadReportTable(stats, incidentes) {
    const tbody = document.getElementById('reportTable');

    const resueltos = incidentes.filter(i => i.estado === 'resuelto' || i.estado === 'cerrado');
    const sla = incidentes.length > 0 ? Math.round((resueltos.length / incidentes.length) * 100) : 0;

    const metrics = [
        { metrica: 'Total de incidentes', valor: stats.total, estado: 'info' },
        { metrica: 'Incidentes abiertos', valor: stats.abiertos, estado: stats.abiertos > 3 ? 'danger' : 'success' },
        { metrica: 'Incidentes en proceso', valor: stats.enProceso, estado: 'warning' },
        { metrica: 'Incidentes resueltos', valor: stats.resueltos, estado: 'success' },
        { metrica: 'Incidentes cerrados', valor: stats.cerrados, estado: 'secondary' },
        { metrica: 'Incidentes críticos', valor: stats.criticos, estado: stats.criticos > 0 ? 'danger' : 'success' },
        { metrica: 'Tasa de resolución', valor: sla + '%', estado: sla >= 70 ? 'success' : 'warning' },
        { metrica: 'Categoría con más incidentes', valor: getMostCommon(incidentes, 'categoria'), estado: 'info' },
        { metrica: 'Prioridad más frecuente', valor: getMostCommon(incidentes, 'prioridad'), estado: 'info' }
    ];

    tbody.innerHTML = metrics.map(m => `
        <tr>
            <td><strong>${m.metrica}</strong></td>
            <td>${m.valor}</td>
            <td><span class="badge bg-${m.estado}">${getEstadoLabel(m.estado)}</span></td>
        </tr>
    `).join('');
}

function getMostCommon(incidentes, key) {
    const counts = {};
    incidentes.forEach(i => {
        const val = i[key];
        counts[val] = (counts[val] || 0) + 1;
    });
    const max = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return max ? capitalize(max[0]) : 'N/A';
}

function getEstadoLabel(estado) {
    const labels = {
        'success': 'Óptimo',
        'warning': 'Atención',
        'danger': 'Crítico',
        'info': 'Informativo',
        'secondary': 'Normal'
    };
    return labels[estado] || estado;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function exportReport() {
    const incidentes = db.getAll('incidentes');
    const usuarios = db.getAll('usuarios');

    let csv = 'ID,Titulo,Categoria,Prioridad,Estado,Sistema,Asignado,Ubicacion,Fecha Creacion,Fecha Actualizacion\n';

    incidentes.forEach(inc => {
        const asignado = usuarios.find(u => u.id === inc.asignado);
        csv += `${inc.id},"${inc.titulo}",${inc.categoria},${inc.prioridad},${inc.estado},"${inc.sistema}","${asignado ? asignado.nombre : 'Sin asignar'}","${inc.ubicacion || ''}",${inc.fechaCreacion},${inc.fechaActualizacion}\n`;
    });

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_incidentes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('Reporte exportado correctamente', 'success');
}

function showToast(message, type) {
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
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'times-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}