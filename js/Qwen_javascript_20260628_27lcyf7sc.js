document.addEventListener('DOMContentLoaded', function () {
    setupUserInfo();

    // Detectar qué página estamos
    const path = window.location.pathname;

    if (path.includes('incidentes.html')) {
        loadIncidents();
        setupFilters();
    } else if (path.includes('registrar.html')) {
        loadTechnicians();
        setupIncidentForm();
    } else if (path.includes('detalle.html')) {
        loadIncidentDetail();
        loadTechniciansForDetail();
    }
});

// === PÁGINA DE INCIDENTES ===
function loadIncidents() {
    const incidentes = db.getAll('incidentes');
    renderIncidents(incidentes);
}

function renderIncidents(incidentes) {
    const tbody = document.getElementById('incidentsTable');
    if (!tbody) return;

    const usuarios = db.getAll('usuarios');

    tbody.innerHTML = incidentes.map(inc => {
        const asignado = usuarios.find(u => u.id === inc.asignado);
        return `
            <tr>
                <td><strong>#${inc.id}</strong></td>
                <td><a href="detalle.html?id=${inc.id}" class="text-decoration-none">${inc.titulo}</a></td>
                <td><span class="badge bg-secondary">${capitalize(inc.categoria)}</span></td>
                <td><span class="badge badge-${inc.prioridad}">${capitalize(inc.prioridad)}</span></td>
                <td><span class="badge badge-${inc.estado}">${formatEstado(inc.estado)}</span></td>
                <td>${asignado ? asignado.nombre : '<span class="text-muted">Sin asignar</span>'}</td>
                <td>${formatDate(inc.fechaCreacion)}</td>
                <td>
                    <a href="detalle.html?id=${inc.id}" class="btn btn-sm btn-outline-primary me-1" title="Ver detalle">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteIncident(${inc.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if (incidentes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No se encontraron incidentes</td></tr>';
    }
}

function setupFilters() {
    const filterSearch = document.getElementById('filterSearch');
    const filterEstado = document.getElementById('filterEstado');
    const filterPrioridad = document.getElementById('filterPrioridad');
    const filterCategoria = document.getElementById('filterCategoria');

    [filterSearch, filterEstado, filterPrioridad, filterCategoria].forEach(el => {
        if (el) {
            el.addEventListener('change', filterIncidents);
            el.addEventListener('input', filterIncidents);
        }
    });
}

function filterIncidents() {
    let incidentes = db.getAll('incidentes');

    const search = document.getElementById('filterSearch').value.toLowerCase();
    const estado = document.getElementById('filterEstado').value;
    const prioridad = document.getElementById('filterPrioridad').value;
    const categoria = document.getElementById('filterCategoria').value;

    if (search) {
        incidentes = incidentes.filter(i =>
            i.titulo.toLowerCase().includes(search) ||
            i.descripcion.toLowerCase().includes(search) ||
            i.sistema.toLowerCase().includes(search)
        );
    }
    if (estado) {
        incidentes = incidentes.filter(i => i.estado === estado);
    }
    if (prioridad) {
        incidentes = incidentes.filter(i => i.prioridad === prioridad);
    }
    if (categoria) {
        incidentes = incidentes.filter(i => i.categoria === categoria);
    }

    renderIncidents(incidentes);
}

function deleteIncident(id) {
    if (confirm('¿Está seguro de eliminar este incidente?')) {
        db.delete('incidentes', id);
        showToast('Incidente eliminado correctamente', 'success');
        loadIncidents();
    }
}

// === PÁGINA DE REGISTRO ===
function loadTechnicians() {
    const tecnicos = db.getTecnicos();
    const select = document.getElementById('incAssigned');
    if (!select) return;

    tecnicos.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.nombre;
        select.appendChild(option);
    });
}

function setupIncidentForm() {
    const form = document.getElementById('incidentForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const currentUser = JSON.parse(localStorage.getItem('ism_current_user'));

        const incidente = {
            titulo: document.getElementById('incTitle').value.trim(),
            descripcion: document.getElementById('incDescription').value.trim(),
            categoria: document.getElementById('incCategory').value,
            prioridad: document.getElementById('incPriority').value,
            sistema: document.getElementById('incSystem').value.trim(),
            asignado: document.getElementById('incAssigned').value || '',
            ubicacion: document.getElementById('incLocation').value.trim(),
            evidencias: document.getElementById('incEvidence').value.trim(),
            estado: 'abierto',
            creadoPor: currentUser.id,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            historial: [
                {
                    fecha: new Date().toISOString(),
                    accion: 'Incidente creado',
                    usuario: currentUser.nombre
                }
            ]
        };

        // Validación
        if (!incidente.titulo || !incidente.descripcion || !incidente.categoria || !incidente.prioridad || !incidente.sistema) {
            showToast('Por favor complete todos los campos obligatorios', 'warning');
            return;
        }

        // Si se asignó, agregar al historial
        if (incidente.asignado) {
            const tecnicos = db.getTecnicos();
            const tecnico = tecnicos.find(t => t.id === parseInt(incidente.asignado));
            if (tecnico) {
                incidente.historial.push({
                    fecha: new Date().toISOString(),
                    accion: `Asignado a ${tecnico.nombre}`,
                    usuario: currentUser.nombre
                });
            }
        }

        db.create('incidentes', incidente);
        showToast('Incidente registrado exitosamente', 'success');

        setTimeout(() => {
            window.location.href = 'incidentes.html';
        }, 1500);
    });
}

// === PÁGINA DE DETALLE ===
function loadIncidentDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'incidentes.html';
        return;
    }

    const incidente = db.getById('incidentes', id);
    if (!incidente) {
        window.location.href = 'incidentes.html';
        return;
    }

    const usuarios = db.getAll('usuarios');
    const asignado = usuarios.find(u => u.id === incidente.asignado);

    // Llenar datos
    document.getElementById('detailTitle').textContent = incidente.titulo;
    document.getElementById('detailCategory').textContent = capitalize(incidente.categoria);
    document.getElementById('detailPriority').innerHTML = `<span class="badge badge-${incidente.prioridad}">${capitalize(incidente.prioridad)}</span>`;
    document.getElementById('detailSystem').textContent = incidente.sistema;
    document.getElementById('detailAssigned').textContent = asignado ? asignado.nombre : 'Sin asignar';
    document.getElementById('detailLocation').textContent = incidente.ubicacion || 'No especificada';
    document.getElementById('detailDate').textContent = formatDate(incidente.fechaCreacion);
    document.getElementById('detailDescription').textContent = incidente.descripcion;
    document.getElementById('detailEvidence').textContent = incidente.evidencias || 'Sin evidencias';

    const statusBadge = document.getElementById('detailStatus');
    statusBadge.textContent = formatEstado(incidente.estado);
    statusBadge.className = `badge badge-${incidente.estado}`;

    // Setear select de actualización
    document.getElementById('updateStatus').value = incidente.estado;

    // Cargar historial
    loadTimeline(incidente.historial);
}

function loadTechniciansForDetail() {
    const tecnicos = db.getTecnicos();
    const select = document.getElementById('updateAssigned');
    if (!select) return;

    tecnicos.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.nombre;
        select.appendChild(option);
    });

    // Seleccionar técnico actual
    const params = new URLSearchParams(window.location.search);
    const incidente = db.getById('incidentes', params.get('id'));
    if (incidente && incidente.asignado) {
        select.value = incidente.asignado;
    }
}

function loadTimeline(historial) {
    const container = document.getElementById('incidentTimeline');
    if (!container) return;

    container.innerHTML = historial.map(h => `
        <div class="timeline-item">
            <div class="time">${formatDate(h.fecha)}</div>
            <div><strong>${h.accion}</strong></div>
            <div class="text-muted small">Por: ${h.usuario}</div>
        </div>
    `).join('');
}

function updateIncidentStatus() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) return;

    const incidente = db.getById('incidentes', id);
    if (!incidente) return;

    const currentUser = JSON.parse(localStorage.getItem('ism_current_user'));
    const newStatus = document.getElementById('updateStatus').value;
    const newAssigned = document.getElementById('updateAssigned').value;
    const comment = document.getElementById('updateComment').value.trim();

    const updates = {
        fechaActualizacion: new Date().toISOString()
    };

    // Agregar al historial
    const historial = [...incidente.historial];

    if (newStatus !== incidente.estado) {
        updates.estado = newStatus;
        historial.push({
            fecha: new Date().toISOString(),
            accion: `Estado cambiado a ${formatEstado(newStatus)}`,
            usuario: currentUser.nombre
        });
    }

    if (newAssigned && parseInt(newAssigned) !== incidente.asignado) {
        updates.asignado = parseInt(newAssigned);
        const usuarios = db.getAll('usuarios');
        const tecnico = usuarios.find(u => u.id === parseInt(newAssigned));
        historial.push({
            fecha: new Date().toISOString(),
            accion: `Reasignado a ${tecnico ? tecnico.nombre : 'desconocido'}`,
            usuario: currentUser.nombre
        });
    }

    if (comment) {
        historial.push({
            fecha: new Date().toISOString(),
            accion: `Comentario: ${comment}`,
            usuario: currentUser.nombre
        });
    }

    updates.historial = historial;

    db.update('incidentes', id, updates);
    showToast('Incidente actualizado correctamente', 'success');

    setTimeout(() => {
        loadIncidentDetail();
    }, 500);
}

// === UTILIDADES ===
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}