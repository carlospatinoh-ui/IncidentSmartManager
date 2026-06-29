/**
 * IncidentSmartManager - Base de Datos LocalStorage
 * Simula una base de datos con LocalStorage
 */

class Database {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('ism_initialized')) {
            this.seedData();
            localStorage.setItem('ism_initialized', 'true');
        }
    }

    seedData() {
        // Usuarios por defecto
        const usuarios = [
            {
                id: 1,
                nombre: 'Administrador',
                email: 'admin@ism.com',
                username: 'admin',
                password: 'admin',
                rol: 'admin',
                estado: 'activo',
                fechaCreacion: '2024-01-01'
            },
            {
                id: 2,
                nombre: 'Carlos Técnico',
                email: 'tecnico@ism.com',
                username: 'tecnico',
                password: 'tecnico',
                rol: 'tecnico',
                estado: 'activo',
                fechaCreacion: '2024-01-01'
            },
            {
                id: 3,
                nombre: 'María Usuario',
                email: 'usuario@ism.com',
                username: 'usuario',
                password: 'usuario',
                rol: 'usuario',
                estado: 'activo',
                fechaCreacion: '2024-01-15'
            },
            {
                id: 4,
                nombre: 'Juan Pérez',
                email: 'juan@ism.com',
                username: 'juan',
                password: 'juan123',
                rol: 'tecnico',
                estado: 'activo',
                fechaCreacion: '2024-02-01'
            },
            {
                id: 5,
                nombre: 'Ana López',
                email: 'ana@ism.com',
                username: 'ana',
                password: 'ana123',
                rol: 'tecnico',
                estado: 'activo',
                fechaCreacion: '2024-02-10'
            }
        ];

        // Incidentes de ejemplo
        const hoy = new Date();
        const incidentes = [
            {
                id: 1,
                titulo: 'Servidor principal caído',
                descripcion: 'El servidor principal de producción no responde a pings ni conexiones HTTP. Se requiere intervención inmediata.',
                categoria: 'hardware',
                prioridad: 'critica',
                estado: 'en_proceso',
                sistema: 'Servidor Principal PROD-01',
                asignado: 2,
                ubicacion: 'Data Center - Rack A3',
                evidencias: 'Logs de error: Connection timeout. LED de red parpadeando en rojo.',
                creadoPor: 1,
                fechaCreacion: new Date(hoy.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                fechaActualizacion: new Date(hoy.getTime() - 30 * 60 * 1000).toISOString(),
                historial: [
                    { fecha: new Date(hoy.getTime() - 2 * 60 * 60 * 1000).toISOString(), accion: 'Incidente creado', usuario: 'Administrador' },
                    { fecha: new Date(hoy.getTime() - 1.5 * 60 * 60 * 1000).toISOString(), accion: 'Asignado a Carlos Técnico', usuario: 'Administrador' },
                    { fecha: new Date(hoy.getTime() - 1 * 60 * 60 * 1000).toISOString(), accion: 'Estado cambiado a En Proceso', usuario: 'Carlos Técnico' },
                    { fecha: new Date(hoy.getTime() - 30 * 60 * 1000).toISOString(), accion: 'Comentario: Se está reiniciando el servidor', usuario: 'Carlos Técnico' }
                ]
            },
            {
                id: 2,
                titulo: 'Error en módulo de facturación',
                descripcion: 'El módulo de facturación presenta error 500 al intentar generar facturas mayores a $10,000.',
                categoria: 'software',
                prioridad: 'alta',
                estado: 'abierto',
                sistema: 'ERP - Módulo Facturación',
                asignado: 4,
                ubicacion: 'Sistema Central',
                evidencias: 'Screenshot del error adjunto. Ocurre consistentemente.',
                creadoPor: 3,
                fechaCreacion: new Date(hoy.getTime() - 5 * 60 * 60 * 1000).toISOString(),
                fechaActualizacion: new Date(hoy.getTime() - 5 * 60 * 60 * 1000).toISOString(),
                historial: [
                    { fecha: new Date(hoy.getTime() - 5 * 60 * 60 * 1000).toISOString(), accion: 'Incidente creado', usuario: 'María Usuario' },
                    { fecha: new Date(hoy.getTime() - 4 * 60 * 60 * 1000).toISOString(), accion: 'Asignado a Juan Pérez', usuario: 'Administrador' }
                ]
            },
            {
                id: 3,
                titulo: 'Lentitud en red del piso 3',
                descripcion: 'Los usuarios del piso 3 reportan lentitud extrema en la conexión a internet desde las 9:00 AM.',
                categoria: 'red',
                prioridad: 'media',
                estado: 'resuelto',
                sistema: 'Switch Piso 3 - SW-301',
                asignado: 5,
                ubicacion: 'Piso 3 - Oficina general',
                evidencias: 'Test de velocidad muestra 2 Mbps cuando debería ser 100 Mbps.',
                creadoPor: 3,
                fechaCreacion: new Date(hoy.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                fechaActualizacion: new Date(hoy.getTime() - 12 * 60 * 60 * 1000).toISOString(),
                historial: [
                    { fecha: new Date(hoy.getTime() - 24 * 60 * 60 * 1000).toISOString(), accion: 'Incidente creado', usuario: 'María Usuario' },
                    { fecha: new Date(hoy.getTime() - 23 * 60 * 60 * 1000).toISOString(), accion: 'Asignado a Ana López', usuario: 'Administrador' },
                    { fecha: new Date(hoy.getTime() - 20 * 60 * 60 * 1000).toISOString(), accion: 'Estado cambiado a En Proceso', usuario: 'Ana López' },
                    { fecha: new Date(hoy.getTime() - 12 * 60 * 60 * 1000).toISOString(), accion: 'Resuelto: Se reemplazó el cable del switch principal', usuario: 'Ana López' }
                ]
            },
            {
                id: 4,
                titulo: 'Intento de acceso no autorizado',
                descripcion: 'Se detectaron múltiples intentos de acceso fallidos desde IP externa al panel administrativo.',
                categoria: 'seguridad',
                prioridad: 'critica',
                estado: 'cerrado',
                sistema: 'Firewall Perimetral',
                asignado: 2,
                ubicacion: 'Perímetro de red',
                evidencias: 'Logs de firewall muestran 500 intentos en 10 minutos desde IP 203.0.113.45',
                creadoPor: 1,
                fechaCreacion: new Date(hoy.getTime() - 48 * 60 * 60 * 1000).toISOString(),
                fechaActualizacion: new Date(hoy.getTime() - 36 * 60 * 60 * 1000).toISOString(),
                historial: [
                    { fecha: new Date(hoy.getTime() - 48 * 60 * 60 * 1000).toISOString(), accion: 'Incidente creado', usuario: 'Administrador' },
                    { fecha: new Date(hoy.getTime() - 47 * 60 * 60 * 1000).toISOString(), accion: 'Asignado a Carlos Técnico', usuario: 'Administrador' },
                    { fecha: new Date(hoy.getTime() - 46 * 60 * 60 * 1000).toISOString(), accion: 'IP bloqueada en firewall', usuario: 'Carlos Técnico' },
                    { fecha: new Date(hoy.getTime() - 36 * 60 * 60 * 1000).toISOString(), accion: 'Cerrado: Amenaza neutralizada', usuario: 'Carlos Técnico' }
                ]
            },
            {
                id: 5,
                titulo: 'Impresora del piso 2 no funciona',
                descripcion: 'La impresora HP LaserJet del piso 2 no imprime. Los trabajos se quedan en cola.',
                categoria: 'hardware',
                prioridad: 'baja',
                estado: 'abierto',
                sistema: 'Impresora HP LJ-201',
                asignado: '',
                ubicacion: 'Piso 2 - Área de impresión',
                evidencias: 'Cola de impresión saturada con 15 trabajos pendientes.',
                creadoPor: 3,
                fechaCreacion: new Date(hoy.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                fechaActualizacion: new Date(hoy.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                historial: [
                    { fecha: new Date(hoy.getTime() - 1 * 60 * 60 * 1000).toISOString(), accion: 'Incidente creado', usuario: 'María Usuario' }
                ]
            },
            {
                id: 6,
                titulo: 'Actualización de Windows pendiente',
                descripcion: '15 equipos del departamento de contabilidad requieren actualización de Windows.',
                categoria: 'software',
                prioridad: 'media',
                estado: 'en_proceso',
                sistema: 'Workstations Contabilidad',
                asignado: 4,
                ubicacion: 'Piso 1 - Contabilidad',
                evidencias: 'Lista de equipos proporcionada por el jefe de contabilidad.',
                creadoPor: 1,
                fechaCreacion: new Date(hoy.getTime() - 72 * 60 * 60 * 1000).toISOString(),
                fechaActualizacion: new Date(hoy.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                historial: [
                    { fecha: new Date(hoy.getTime() - 72 * 60 * 60 * 1000).toISOString(), accion: 'Incidente creado', usuario: 'Administrador' },
                    { fecha: new Date(hoy.getTime() - 70 * 60 * 60 * 1000).toISOString(), accion: 'Asignado a Juan Pérez', usuario: 'Administrador' },
                    { fecha: new Date(hoy.getTime() - 48 * 60 * 60 * 1000).toISOString(), accion: 'Estado cambiado a En Proceso - 5/15 equipos actualizados', usuario: 'Juan Pérez' }
                ]
            },
            {
                id: 7,
                titulo: 'Correo electrónico lento',
                descripcion: 'El servidor de correo tarda más de 30 segundos en enviar emails.',
                categoria: 'red',
                prioridad: 'alta',
                estado: 'resuelto',
                sistema: 'Servidor de Correo SMTP',
                asignado: 5,
                ubicacion: 'Data Center',
                evidencias: 'Pruebas de envío muestran latencia de 35 segundos.',
                creadoPor: 3,
                fechaCreacion: new Date(hoy.getTime() - 96 * 60 * 60 * 1000).toISOString(),
                fechaActualizacion: new Date(hoy.getTime() - 72 * 60 * 60 * 1000).toISOString(),
                historial: [
                    { fecha: new Date(hoy.getTime() - 96 * 60 * 60 * 1000).toISOString(), accion: 'Incidente creado', usuario: 'María Usuario' },
                    { fecha: new Date(hoy.getTime() - 95 * 60 * 60 * 1000).toISOString(), accion: 'Asignado a Ana López', usuario: 'Administrador' },
                    { fecha: new Date(hoy.getTime() - 80 * 60 * 60 * 1000).toISOString(), accion: 'Se limpió la cola de correo', usuario: 'Ana López' },
                    { fecha: new Date(hoy.getTime() - 72 * 60 * 60 * 1000).toISOString(), accion: 'Resuelto: Problema de DNS corregido', usuario: 'Ana López' }
                ]
            },
            {
                id: 8,
                titulo: 'Solicitud de nuevo equipo',
                descripcion: 'El departamento de marketing solicita 3 laptops nuevas para los empleados recientes.',
                categoria: 'otro',
                prioridad: 'baja',
                estado: 'abierto',
                sistema: 'N/A',
                asignado: '',
                ubicacion: 'Piso 4 - Marketing',
                evidencias: 'Solicitud formal aprobada por el director de marketing.',
                creadoPor: 3,
                fechaCreacion: new Date(hoy.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                fechaActualizacion: new Date(hoy.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                historial: [
                    { fecha: new Date(hoy.getTime() - 3 * 60 * 60 * 1000).toISOString(), accion: 'Incidente creado', usuario: 'María Usuario' }
                ]
            }
        ];

        localStorage.setItem('ism_usuarios', JSON.stringify(usuarios));
        localStorage.setItem('ism_incidentes', JSON.stringify(incidentes));
        localStorage.setItem('ism_next_user_id', '6');
        localStorage.setItem('ism_next_incident_id', '9');
    }

    // Métodos genéricos
    getAll(collection) {
        const data = localStorage.getItem(`ism_${collection}`);
        return data ? JSON.parse(data) : [];
    }

    getById(collection, id) {
        const items = this.getAll(collection);
        return items.find(item => item.id === parseInt(id));
    }

    create(collection, item) {
        const items = this.getAll(collection);
        const nextIdKey = `ism_next_${collection.replace(/s$/, '')}_id`;
        let nextId = parseInt(localStorage.getItem(nextIdKey) || '1');
        item.id = nextId;
        items.push(item);
        localStorage.setItem(`ism_${collection}`, JSON.stringify(items));
        localStorage.setItem(nextIdKey, (nextId + 1).toString());
        return item;
    }

    update(collection, id, updates) {
        const items = this.getAll(collection);
        const index = items.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(`ism_${collection}`, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    delete(collection, id) {
        let items = this.getAll(collection);
        items = items.filter(item => item.id !== parseInt(id));
        localStorage.setItem(`ism_${collection}`, JSON.stringify(items));
        return true;
    }

    // Métodos específicos
    authenticate(username, password) {
        const usuarios = this.getAll('usuarios');
        return usuarios.find(u =>
            u.username === username &&
            u.password === password &&
            u.estado === 'activo'
        );
    }

    getTecnicos() {
        const usuarios = this.getAll('usuarios');
        return usuarios.filter(u => u.rol === 'tecnico' && u.estado === 'activo');
    }

    getIncidentesByStatus(estado) {
        const incidentes = this.getAll('incidentes');
        return incidentes.filter(i => i.estado === estado);
    }

    getStats() {
        const incidentes = this.getAll('incidentes');
        return {
            total: incidentes.length,
            abiertos: incidentes.filter(i => i.estado === 'abierto').length,
            enProceso: incidentes.filter(i => i.estado === 'en_proceso').length,
            resueltos: incidentes.filter(i => i.estado === 'resuelto').length,
            cerrados: incidentes.filter(i => i.estado === 'cerrado').length,
            criticos: incidentes.filter(i => i.prioridad === 'critica').length,
            porCategoria: this.groupBy(incidentes, 'categoria'),
            porPrioridad: this.groupBy(incidentes, 'prioridad')
        };
    }

    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key] || 'sin_categoria';
            result[group] = (result[group] || 0) + 1;
            return result;
        }, {});
    }

    reset() {
        localStorage.removeItem('ism_initialized');
        localStorage.removeItem('ism_usuarios');
        localStorage.removeItem('ism_incidentes');
        localStorage.removeItem('ism_next_usuario_id');
        localStorage.removeItem('ism_next_incidente_id');
        this.init();
    }
}

// Instancia global
const db = new Database();

// Función de logout global
function logout() {
    localStorage.removeItem('ism_current_user');
    window.location.href = 'index.html';
}

// Verificar sesión
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('ism_current_user') || 'null');
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// Configurar info de usuario en páginas
function setupUserInfo() {
    const user = checkAuth();
    if (user) {
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        if (userNameEl) userNameEl.textContent = user.nombre;
        if (userRoleEl) userRoleEl.textContent = user.rol;

        // Ocultar usuarios si no es admin
        const navUsuarios = document.getElementById('navUsuarios');
        if (navUsuarios && user.rol !== 'admin') {
            navUsuarios.style.display = 'none';
        }
    }
}

// Toggle sidebar
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });
    }
});