import '@styles/modal.css';
import '@styles/prestamo-detalle.css';
import { visualizarActaFirmada } from '@services/documento.service';
import Swal from 'sweetalert2';

const PrestamoDetalleModal = ({ show, onClose, prestamo }) => {
    if (!show || !prestamo) return null;

    // Formatear fecha y hora
    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            const date = new Date(fecha);
            return date.toLocaleString('es-CL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            });
        } catch {
            return '-';
        }
    };

    const formatFechaHora = (fecha, hora) => {
        if (!fecha) return '-';
        try {
            const date = new Date(fecha);
            const fechaStr = date.toLocaleDateString('es-CL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            });
            // Si hay hora, formatearla a HH:MM (sin segundos)
            if (hora) {
                const horaFormateada = hora.substring(0, 5); // Toma solo HH:MM
                return `${fechaStr} - ${horaFormateada}`;
            }
            return fechaStr;
        } catch {
            return '-';
        }
    };

    const handleVerDocumento = async () => {
        try {
            const url = await visualizarActaFirmada(prestamo.prestamo.ID_Prestamo);
            const win = window.open(url, '_blank');
            if (!win) {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.click();
            }
        } catch (error) {
            console.error('Error al visualizar acta:', error);
            Swal.fire('Error', 'No se pudo visualizar el documento.', 'error');
        }
    };

    // Obtener datos del usuario
    const usuario = prestamo.usuario || {};

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-detalle-prestamo" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📋 Detalles de la Solicitud {prestamo.prestamo?.ID_Prestamo ? `#${prestamo.prestamo.ID_Prestamo}` : `#S-${prestamo.ID_Solicitud}`}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* Información del Solicitante */}
                    <div className="info-section">
                        <h3>👤 Información del Solicitante</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Nombre Completo:</span>
                                <span className="info-value">{usuario.Nombre_Completo || `${usuario.Nombre || ''} ${usuario.Apellido || ''}`.trim() || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">RUT:</span>
                                <span className="info-value">{usuario.Rut || prestamo.Rut || 'N/A'}</span>
                            </div>
                            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                <span className="info-label">Email:</span>
                                <span className="info-value" style={{ wordBreak: 'break-all' }}>{usuario.Correo || usuario.Email || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Tipo de Usuario:</span>
                                <span className="info-value">{usuario.tipoUsuario?.Descripcion || usuario.tipoUsuario?.Tipo_Usuario || 'N/A'}</span>
                            </div>
                            {usuario.tipoUsuario?.Descripcion !== 'Profesor' && (
                                <div className="info-item">
                                    <span className="info-label">Carrera:</span>
                                    <span className="info-value">{usuario.carrera?.Nombre_Carrera || usuario.carrera?.Carrera || 'N/A'}</span>
                                </div>
                            )}
                            {usuario.cargo && (
                                <div className="info-item">
                                    <span className="info-label">Cargo:</span>
                                    <span className="info-value">{usuario.cargo.Desc_Cargo || usuario.cargo.Nombre_Cargo || 'N/A'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del Equipo */}
                    <div className="info-section">
                        <h3>💻 Información del Equipo</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">N° Inventario:</span>
                                <span className="info-value">{prestamo.ID_Num_Inv}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Categoría:</span>
                                <span className="info-value">{prestamo.equipo?.categoria?.Descripcion || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Marca:</span>
                                <span className="info-value">{prestamo.equipo?.marca?.Descripcion || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Modelo:</span>
                                <span className="info-value">{prestamo.equipo?.Modelo || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Número de Serie:</span>
                                <span className="info-value">{prestamo.equipo?.Numero_Serie || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Estado del Equipo:</span>
                                <span className="info-value">{prestamo.equipo?.estado?.Descripcion || 'N/A'}</span>
                            </div>
                        </div>
                        {prestamo.equipo?.especificaciones && prestamo.equipo.especificaciones.length > 0 && (
                            <div className="especificaciones-list" style={{ marginTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Especificaciones:</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {prestamo.equipo.especificaciones.map((spec, idx) => (
                                        <li key={idx} style={{ padding: '0.3rem 0', fontSize: '0.9rem' }}>
                                            <strong>{spec.Tipo_Especificacion_HW}:</strong> {spec.Descripcion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {prestamo.equipo?.Comentarios && (
                            <div className="info-item" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                <span className="info-label">Comentarios:</span>
                                <span className="info-value">{prestamo.equipo.Comentarios}</span>
                            </div>
                        )}
                    </div>

                    {/* Información de Solicitud y Documentación */}
                    <div className="info-section">
                        <h3>📋 Información de la Solicitud</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Fecha de Solicitud:</span>
                                <span className="info-value">{formatFechaHora(prestamo.Fecha_Sol, prestamo.Hora_Sol)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Fecha Inicio Solicitada:</span>
                                <span className="info-value">{formatFecha(prestamo.Fecha_inicio_sol)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Fecha Término Solicitada:</span>
                                <span className="info-value">{formatFecha(prestamo.Fecha_termino_sol)}</span>
                            </div>
                            {prestamo.Motivo_Sol && (
                                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                    <span className="info-label">Motivo de la Solicitud:</span>
                                    <span className="info-value">{prestamo.Motivo_Sol}</span>
                                </div>
                            )}
                            
                            {/* DOCUMENTACIÓN ADJUNTA */}
                            {prestamo.prestamo?.Documento_Suscrito && (
                                <div className="info-item" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                    <span className="info-label">Documentación Adjunta:</span>
                                    <button 
                                        className="btn-ver-doc" 
                                        onClick={handleVerDocumento}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginTop: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            border: '1px solid #90caf9',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em',
                                            fontWeight: '600'
                                        }}
                                    >
                                        📄 Ver Acta de Prestamo Firmada
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline del Préstamo */}
                    <div className="info-section">
                        <h3>📊 Seguimiento de Estados</h3>
                        <div className="timeline-tracking">
                            {/* Solicitud Creada */}
                            <div className="tracking-item completado">
                                <div className="tracking-marker">
                                    <div className="tracking-dot">📝</div>
                                    <div className="tracking-line"></div>
                                </div>
                                <div className="tracking-content">
                                    <div className="tracking-header">
                                        <h4>Solicitud Creada</h4>
                                        <span className="tracking-date">{formatFechaHora(prestamo.Fecha_Sol, prestamo.Hora_Sol)}</span>
                                    </div>
                                    <p className="tracking-description">La solicitud de préstamo ha sido registrada en el sistema.</p>
                                </div>
                            </div>

                            {/* Estados del prestamo */}
                            {prestamo.prestamo?.tieneEstados && prestamo.prestamo.tieneEstados.length > 0 ? (
                                prestamo.prestamo.tieneEstados
                                    .sort((a, b) => new Date(a.Fecha_Estado) - new Date(b.Fecha_Estado))
                                    .map((estado, index) => {
                                        const iconos = {
                                            1: '⏳',
                                            2: '✅', 
                                            3: '📦',
                                            4: '✅',
                                            5: '❌'
                                        };
                                        const colores = {
                                            1: '#ff9800',
                                            2: '#4caf50',
                                            3: '#2196f3',
                                            4: '#9c27b0',
                                            5: '#f44336'
                                        };
                                        const nombres = {
                                            1: 'Pendiente',
                                            2: 'Aprobado',
                                            3: 'Entregado',
                                            4: 'Devuelto',
                                            5: 'Rechazado'
                                        };
                                        return (
                                            <div key={index} className="tracking-item completado">
                                                <div className="tracking-marker">
                                                    <div className="tracking-dot" style={{ backgroundColor: colores[estado.Cod_Estado] }}>
                                                        {iconos[estado.Cod_Estado]}
                                                    </div>
                                                    {index < prestamo.prestamo.tieneEstados.length - 1 && (
                                                        <div className="tracking-line" style={{ backgroundColor: colores[estado.Cod_Estado] }}></div>
                                                    )}
                                                </div>
                                                <div className="tracking-content">
                                                    <div className="tracking-header">
                                                        <h4>{nombres[estado.Cod_Estado] || estado.estadoPrestamo?.Estado_Prestamo || estado.estadoPrestamo?.Descripcion || 'Estado'}</h4>
                                                        <span className="tracking-date">{formatFechaHora(estado.Fecha_Estado, estado.Hora_Estado)}</span>
                                                    </div>
                                                    {estado.Obs_Estado && (
                                                        <p className="tracking-description">{estado.Obs_Estado}</p>
                                                    )}
                                                    {/* Información adicional según el estado */}
                                                    {estado.Cod_Estado === 2 && prestamo.prestamo?.autorizacion && (
                                                        <div className="tracking-extra">
                                                            <p><strong>Autorizado por:</strong> {prestamo.prestamo.autorizacion.usuario?.Nombre_Completo || `${prestamo.prestamo.autorizacion.usuario?.Nombre || ''} ${prestamo.prestamo.autorizacion.usuario?.Apellido || ''}`.trim()}</p>
                                                            {prestamo.prestamo.autorizacion.Obs_Aut && (
                                                                <p><strong>Observaciones:</strong> {prestamo.prestamo.autorizacion.Obs_Aut}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {estado.Cod_Estado === 5 && prestamo.prestamo?.autorizacion && (
                                                        <div className="tracking-extra">
                                                            <p><strong>Rechazado por:</strong> {prestamo.prestamo.autorizacion.usuario?.Nombre_Completo || `${prestamo.prestamo.autorizacion.usuario?.Nombre || ''} ${prestamo.prestamo.autorizacion.usuario?.Apellido || ''}`.trim()}</p>
                                                            {prestamo.prestamo.autorizacion.Obs_Aut && (
                                                                <p><strong>Motivo del rechazo:</strong> {prestamo.prestamo.autorizacion.Obs_Aut}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {estado.Cod_Estado === 4 && prestamo.prestamo?.devolucion && (
                                                        <div className="tracking-extra">
                                                            <p><strong>Recibido por:</strong> {prestamo.prestamo.devolucion.usuario?.Nombre_Completo || `${prestamo.prestamo.devolucion.usuario?.Nombre || ''} ${prestamo.prestamo.devolucion.usuario?.Apellido || ''}`.trim()}</p>
                                                            <p><strong>Estado del equipo:</strong> {prestamo.prestamo.devolucion.Estado_Equipo_Devolucion}</p>
                                                            {prestamo.prestamo.devolucion.Obs_Dev && (
                                                                <p><strong>Observaciones:</strong> {prestamo.prestamo.devolucion.Obs_Dev}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="tracking-item pendiente">
                                    <div className="tracking-marker">
                                        <div className="tracking-dot" style={{ backgroundColor: '#ff9800' }}>⏳</div>
                                    </div>
                                    <div className="tracking-content">
                                        <div className="tracking-header">
                                            <h4>Pendiente de Aprobación</h4>
                                        </div>
                                        <p className="tracking-description">La solicitud está esperando ser revisada y aprobada por un administrador.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrestamoDetalleModal;
