import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { formatRut, cleanRut } from '../helpers/rutFormatter.js';
import { 
    getPenalizaciones, 
    updatePenalizacion, 
    getAsignadas, 
    asignarPenalizacion, 
    finalizarPenalizacion 
} from '../services/penalizacion.service.js';
import { getAllUsers } from '../services/user.service.js';
import { useAuth } from '../context/AuthContext';
import '../styles/gestion-penalizaciones.css';

const GestionPenalizaciones = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('usuarios'); // 'usuarios' | 'catalogo'
    
    // Estados de datos
    const [catalogo, setCatalogo] = useState([]);
    const [sanciones, setSanciones] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        const response = await getAllUsers();
        if (response.status === 'Success') {
            setUsuarios(response.data);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        if (activeTab === 'catalogo') {
            const [data, error] = await getPenalizaciones();
            if (!error) setCatalogo(data);
            else Swal.fire('Error', error, 'error');
        } else {
            const [data, error] = await getAsignadas();
            if (!error) setSanciones(data);
            else Swal.fire('Error', error, 'error');
        }
        setLoading(false);
    };

    // === GESTIÓN CATÁLOGO ===
    const handleEditDias = async (penalizacion) => {
        const { value: dias } = await Swal.fire({
            title: 'Editar Días de Sanción',
            input: 'number',
            inputLabel: `Penalización: ${penalizacion.Descripcion}`,
            inputValue: penalizacion.Dias_Sancion,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value || value < 0) {
                    return 'Debes ingresar un número válido de días';
                }
            }
        });

        if (dias) {
            const [updated, error] = await updatePenalizacion(penalizacion.ID_Penalizaciones, { Dias_Sancion: parseInt(dias) });
            if (!error) {
                Swal.fire('Actualizado', 'La configuración ha sido guardada', 'success');
                fetchData();
            } else {
                Swal.fire('Error', error, 'error');
            }
        }
    };

    // === GESTIÓN SANCIONES USUARIOS ===
    
    const handleFinalizar = async (sancion) => {
        const result = await Swal.fire({
            title: '¿Levantar sanción?',
            text: `Se finalizará la sanción para el usuario ${sancion.usuario.Nombre_Completo}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, finalizar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const [updated, error] = await finalizarPenalizacion(sancion.ID);
            if (!error) {
                Swal.fire('Sanción Finalizada', 'El usuario ha sido habilitado nuevamente.', 'success');
                fetchData();
            } else {
                Swal.fire('Error', error, 'error');
            }
        }
    };

    const handleNuevaSancion = async () => {
        // Necesitamos el catálogo para el dropdown
        let listaPenalizaciones = catalogo;
        if (listaPenalizaciones.length === 0) {
            const [data] = await getPenalizaciones();
            listaPenalizaciones = data || [];
        }

        const options = {};
        listaPenalizaciones.forEach(p => {
            options[p.ID_Penalizaciones] = `${p.Descripcion} (${p.Dias_Sancion} días)`;
        });

        const { value: formValues } = await Swal.fire({
            title: 'Nueva Sanción Manual',
            html: `
                <div style="text-align: left; margin-bottom: 10px;">
                    <label for="swal-rut" style="font-weight: 600; display: block; margin-bottom: 5px;">Buscar Usuario (RUT o Nombre):</label>
                    <input id="swal-rut" list="usuarios-list" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Escriba para buscar...">
                    <datalist id="usuarios-list">
                        ${usuarios.map(u => `<option value="${formatRut(u.Rut)}">${u.Nombre_Completo}</option>`).join('')}
                    </datalist>
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label for="swal-obs" style="font-weight: 600; display: block; margin-bottom: 5px;">Observación:</label>
                    <textarea id="swal-obs" class="swal2-textarea" style="margin: 0; width: 100%;" placeholder="Indique el motivo detallado..."></textarea>
                </div>
            `,
            input: 'select',
            inputOptions: options,
            inputPlaceholder: 'Seleccione tipo de sanción',
            showCancelButton: true,
            didOpen: () => {
                const rutInput = document.getElementById('swal-rut');
                rutInput.addEventListener('input', (e) => {
                    // Si el usuario está borrando, no formatear para no entorpecer
                    if (e.inputType && e.inputType.includes('delete')) return;
                    
                    let val = e.target.value;
                    // Solo si parece un inicio de RUT (número o ya tiene puntos)
                    if (/^[0-9.]/.test(val)) {
                        const cursor = e.target.selectionStart;
                        const formatted = formatRut(val);
                        
                        if (formatted !== val) {
                            e.target.value = formatted;
                            // Ajustar cursor solo si el cambio fue en el formato
                            const diff = formatted.length - val.length;
                            const newPos = Math.max(0, cursor + diff);
                            e.target.setSelectionRange(newPos, newPos);
                        }
                    }
                });
            },
            preConfirm: (idPenalizacion) => {
                const inputValue = document.getElementById('swal-rut').value.trim();
                
                // Intentar encontrar el usuario en la lista por RUT (formateado o limpio) o por Nombre
                const foundUser = usuarios.find(u => 
                    u.Rut === inputValue || 
                    formatRut(u.Rut) === inputValue || 
                    u.Rut.replace(/-/g, '') === inputValue.replace(/[-\.]/g, '') ||
                    u.Nombre_Completo.toLowerCase() === inputValue.toLowerCase()
                );
                
                if (!foundUser) {
                    // Si no está en la lista pero parece un RUT ingresado manualmente, dejar pasar
                    if (/^\d{7,8}-[\dkK]$/.test(inputValue.replace(/\./g, ''))) {
                        return [
                            inputValue.replace(/\./g, ''),
                            idPenalizacion,
                            document.getElementById('swal-obs').value
                        ];
                    }
                    Swal.showValidationMessage('Debe seleccionar un usuario válido de la lista o ingresar un RUT correcto (ej: 12.345.678-x)');
                    return false;
                }

                return [
                    foundUser.Rut, // Usar el RUT exacto del sistema
                    idPenalizacion,
                    document.getElementById('swal-obs').value
                ]
            }
        });

        if (formValues) {
            const [rut, idPenalizacion, obs] = formValues;
            
            if (!rut || !idPenalizacion) {
                Swal.fire('Error', 'Debe ingresar RUT y Tipo de Sanción', 'error');
                return;
            }

            // Calcular días por defecto para fecha fin
            const penalizacionSelect = listaPenalizaciones.find(p => p.ID_Penalizaciones == idPenalizacion);
            const dias = penalizacionSelect ? penalizacionSelect.Dias_Sancion : 0;
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + dias);

            const [created, error] = await asignarPenalizacion({
                Rut: rut,
                ID_Penalizaciones: parseInt(idPenalizacion),
                Fecha_Inicio: new Date(),
                Motivo_Obs: obs || 'Sanción manual',
                Fecha_Fin: fechaFin
            });

            if (!error) {
                Swal.fire('Sanción Aplicada', 'El usuario ha sido sancionado correctamente.', 'success');
                fetchData();
            } else {
                Swal.fire('Error', error, 'error');
            }
        }
    };

    // Filtrado de sanciones
    const filteredSanciones = sanciones.filter(s => {
        const search = searchTerm.toLowerCase();
        const rutLimpio = (s.usuario?.Rut || '').toLowerCase();
        const rutFormateado = formatRut(rutLimpio).toLowerCase();
        
        return (
            s.usuario?.Nombre_Completo.toLowerCase().includes(search) ||
            rutLimpio.includes(search.replace(/\./g, '')) || // Búsqueda flexible
            rutFormateado.includes(search) ||
            s.penalizacion?.Descripcion.toLowerCase().includes(search)
        );
    });

    const isVigente = (fechaFin) => {
        if (!fechaFin) return true;
        return new Date(fechaFin) > new Date();
    };

    return (
        <div className="gestion-penalizaciones-container main-container">
            {/* Header Principal - Igual que Solicitudes */}
            <div className="penalizaciones-header">
                <h1>Gestión de Penalizaciones</h1>
            </div>

            <div className="tabs-container">
                <button 
                    className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
                    onClick={() => setActiveTab('usuarios')}
                >
                    👥 Usuarios Sancionados
                </button>
                <button 
                    className={`tab-button ${activeTab === 'catalogo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('catalogo')}
                >
                    ⚙️ Catálogo de Sanciones
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'usuarios' && (
                    <>
                        {/* Section Header con botón y badge */}
                        <div className="section-header-with-button">
                             <h2>
                                👥 Usuarios Sancionados
                                <span className="count-badge" style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #006edf 0%, #003366 100%)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75em',
                                    fontWeight: '600',
                                    boxShadow: '0 2px 6px rgba(0, 110, 223, 0.3)',
                                    minWidth: '40px'
                                }}>({filteredSanciones.length})</span>
                            </h2>
                            <button className="btn-create" onClick={handleNuevaSancion}>
                                + Nueva Sanción Manual
                            </button>
                        </div>

                        {/* Filtros Container */}
                        <div className="filters-section">
                            <div className="search-container">
                                <input 
                                    type="text" 
                                    className="search-input" 
                                    placeholder="Buscar por nombre, RUT o motivo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="penalizaciones-table-container">
                            <table className="penalizaciones-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>RUT</th>
                                        <th>Motivo</th>
                                        <th>Inicio</th>
                                        <th>Término</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Cargando...</td></tr>
                                    ) : filteredSanciones.length === 0 ? (
                                        <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No hay sanciones registradas.</td></tr>
                                    ) : (
                                        filteredSanciones.map(s => (
                                            <tr key={s.ID}>
                                                <td>{s.usuario?.Nombre_Completo}</td>
                                                <td>{formatRut(s.usuario?.Rut)}</td>
                                                <td>
                                                    <strong>{s.penalizacion?.Descripcion}</strong>
                                                    <br/>
                                                    <small>{s.Motivo_Obs}</small>
                                                </td>
                                                <td>{new Date(s.Fecha_Inicio).toLocaleDateString('es-CL')}</td>
                                                <td>{s.Fecha_Fin ? new Date(s.Fecha_Fin).toLocaleDateString('es-CL') : 'Indefinido'}</td>
                                                <td>
                                                    {isVigente(s.Fecha_Fin) ? (
                                                        <span className="status-badge status-active">Activa</span>
                                                    ) : (
                                                        <span className="status-badge status-inactive">Finalizada</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {isVigente(s.Fecha_Fin) && (
                                                        <button 
                                                            className="btn-action btn-finalize"
                                                            onClick={() => handleFinalizar(s)}
                                                            title="Levantar sanción anticipadamente"
                                                        >
                                                            ✓ Levantar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'catalogo' && (
                    <div className="penalizaciones-table-container">
                        <table className="penalizaciones-table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Días de Sanción (Automático)</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>Cargando...</td></tr>
                                ) : (
                                    catalogo.map(p => (
                                        <tr key={p.ID_Penalizaciones}>
                                            <td>{p.Descripcion}</td>
                                            <td>{p.Dias_Sancion} días</td>
                                            <td>
                                                <button 
                                                    className="btn-action btn-edit"
                                                    onClick={() => handleEditDias(p)}
                                                >
                                                    ✏️ Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionPenalizaciones;
