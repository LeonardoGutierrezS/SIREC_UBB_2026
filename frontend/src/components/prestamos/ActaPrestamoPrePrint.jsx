import React from 'react';
import '@styles/acta-prestamo.css';

const ActaPrestamoPrePrint = ({ data, adminName, onClose }) => {
    if (!data) return null;

    const { usuario, equipo, plazo, autorizacion, idSolicitud, idPrestamo } = data;
    const fechaActual = new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const handlePrint = () => {
        window.print();
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-CL');
    };

    return (
        <div className="acta-container print-only">
            {/* Panel de Control Superior (No portable a la impresión) */}
            <div className="no-print acta-controls">
                <div className="control-info">
                    <span>Viendo Borrador del Acta</span>
                </div>
                <div className="control-actions">
                    <button onClick={handlePrint} className="btn-print-acta">
                        🖨️ Imprimir Acta
                    </button>
                    <button onClick={onClose} className="btn-close-acta">
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Encabezado Institucional Rediseñado */}
            <div className="acta-header-new">
                <div className="logos-top-row">
                    <img src="/images/sirec-logo.png" alt="SIREC Logo" className="logo-top-left" />
                    <img src="/images/Face_azul_2.png" alt="FACE Logo" className="logo-top-right" />
                </div>
                <div className="title-block">
                    <h1>ACTA DE PRÉSTAMO DE EQUIPOS COMPUTACIONALES</h1>
                    <p className="subtitle">Facultad de Ciencias Empresariales - Universidad del Bío-Bío</p>
                    <div className="title-divider"></div>
                </div>
                
                <div className="acta-meta">
                    <div className="meta-item">
                        <span className="meta-label">ID SOLICITUD:</span>
                        <span className="meta-value">#{idSolicitud}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">ID PRÉSTAMO:</span>
                        <span className="meta-value">#{idPrestamo}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">FECHA EMISIÓN:</span>
                        <span className="meta-value">{fechaActual}</span>
                    </div>
                </div>
            </div>

            <div className="acta-body">
                <p className="acta-intro">
                    En Chillán, a {fechaActual}, se procede a la entrega del equipo computacional detallado a continuación, 
                    bajo la modalidad de préstamo institucional del Sistema de Reserva de Equipos Computacionales (SIREC).
                </p>

                {/* Datos del Solicitante */}
                <section className="acta-section">
                    <h3>1. DATOS DEL SOLICITANTE</h3>
                    <table className="acta-table">
                        <tbody>
                            <tr>
                                <td><strong>Nombre Completo:</strong></td>
                                <td>{usuario.nombre}</td>
                                <td><strong>RUT:</strong></td>
                                <td>{usuario.rut}</td>
                            </tr>
                            <tr>
                                <td><strong>Correo:</strong></td>
                                <td>{usuario.correo}</td>
                                <td><strong>Tipo Usuario:</strong></td>
                                <td>{usuario.tipo}</td>
                            </tr>
                            <tr>
                                <td><strong>Carrera/Cargo:</strong></td>
                                <td colSpan="3">{usuario.carrera}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Datos del Equipo */}
                <section className="acta-section">
                    <h3>2. IDENTIFICACIÓN DEL EQUIPO</h3>
                    <table className="acta-table">
                        <tbody>
                            <tr>
                                <td><strong>N° Inventario:</strong></td>
                                <td>{equipo.inv}</td>
                                <td><strong>Marca/Categoría:</strong></td>
                                <td>{equipo.marca} / {equipo.categoria}</td>
                            </tr>
                            <tr>
                                <td><strong>Modelo:</strong></td>
                                <td colSpan="3">{equipo.modelo}</td>
                            </tr>
                        </tbody>
                    </table>
                    {equipo.specs && equipo.specs.length > 0 && (
                        <div className="specs-box">
                            <strong>Especificaciones Técnicas:</strong>
                            <ul>
                                {equipo.specs.map((spec, index) => (
                                    <li key={index}>{spec.Tipo_Especificacion_HW}: {spec.Descripcion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* Detalles del Préstamo */}
                <section className="acta-section">
                    <h3>3. CONDICIONES Y VIGENCIA</h3>
                    <table className="acta-table">
                        <tbody>
                            <tr>
                                <td><strong>Fecha Inicio:</strong></td>
                                <td>{formatFecha(plazo.inicio)}</td>
                                <td><strong>Fecha Devolución:</strong></td>
                                <td>{formatFecha(plazo.fin)}</td>
                            </tr>
                            <tr>
                                <td><strong>Autorizado por:</strong></td>
                                <td colSpan="3">{autorizacion?.director ? `${autorizacion.director} (${autorizacion.cargoDirector})` : 'Administración'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="obligaciones-box">
                        <p><strong>Obligaciones del Usuario:</strong></p>
                        <ol>
                            <li>El equipo debe ser utilizado exclusivamente para fines académicos o institucionales.</li>
                            <li>Es responsabilidad del usuario el cuidado, integridad y correcto funcionamiento del equipo.</li>
                            <li>No está permitido intervenir el hardware ni instalar software que vulnere la seguridad del equipo.</li>
                            <li>En caso de pérdida, robo o daño, el usuario debe informar de inmediato a la administración.</li>
                            <li>El retraso en la devolución generará sanciones automáticas en el sistema SIREC.</li>
                        </ol>
                    </div>
                </section>

                {/* Firmas */}
                <div className="firmas-container">
                    <div className="firma-box">
                        <div className="firma-line"></div>
                        <p><strong>Firma {usuario.tipo}</strong></p>
                        <p>{usuario.nombre}</p>
                        <p>RUT: {usuario.rut}</p>
                    </div>
                    <div className="firma-box">
                        <div className="firma-line"></div>
                        <p><strong>Firma Encargado</strong></p>
                        <p>{adminName || '____________________'}</p>
                        <p>Facultad de Ciencias Empresariales</p>
                    </div>
                    <div className="firma-box">
                        <div className="firma-line"></div>
                        <p><strong>Firma y Timbre Bodega</strong></p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                    </div>
                </div>
            </div>

            <div className="acta-footer">
                <p>Documento generado automáticamente por SIREC UBB</p>
                <p>Copia para: Administración de Laboratorios / Usuario Solicitante</p>
            </div>
        </div>
    );
};

export default ActaPrestamoPrePrint;
