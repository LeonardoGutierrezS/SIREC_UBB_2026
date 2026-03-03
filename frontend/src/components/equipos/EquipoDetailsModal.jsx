import { useEffect } from 'react';
import '@styles/modal.css';

const EquipoDetailsModal = ({ equipo, onClose }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!equipo) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Detalles del Equipo</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="details-container">
                        <div className="detail-section">
                            <h3 className="section-title">Información General</h3>
                            <div className="detail-grid">
                                <div className="detail-row">
                                    <span className="detail-label">N° Inventario:</span>
                                    <span className="detail-value">{equipo.ID_Num_Inv}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Modelo:</span>
                                    <span className="detail-value">{equipo.Modelo}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">N° Serie:</span>
                                    <span className="detail-value">{equipo.Numero_Serie}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Marca:</span>
                                    <span className="detail-value">{equipo.marca?.Descripcion || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Categoría:</span>
                                    <span className="detail-value">{equipo.categoria?.Descripcion || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Estado:</span>
                                    <span className="detail-value">{equipo.estado?.Descripcion || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Disponibilidad:</span>
                                    <span className={`status-badge ${equipo.Disponible ? 'status-active' : 'status-inactive'}`}>
                                        {equipo.Disponible ? '✓ Disponible' : '✕ No Disponible'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {equipo.especificaciones && equipo.especificaciones.length > 0 && (
                            <div className="detail-section">
                                <h3 className="section-title">Especificaciones de Hardware</h3>
                                <div className="spec-card">
                                    <div className="detail-grid">
                                        {equipo.especificaciones.map((spec, index) => (
                                            <div key={index} className="detail-row">
                                                <span className="detail-label">{spec.Tipo_Especificacion_HW}:</span>
                                                <span className="detail-value">{spec.Descripcion}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {equipo.Comentarios && (
                            <div className="detail-section">
                                <h3 className="section-title">Comentarios Adicionales</h3>
                                <div className="comentarios-box">
                                    {equipo.Comentarios}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipoDetailsModal;
