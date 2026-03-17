import '@styles/styles.css';
import '@styles/estado-solicitud.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getMisPrestamos } from '@services/prestamo.service';
import { descargarPDFAutorizacion } from '@services/solicitud.service';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert';
import PrestamoDetalleModal from '@components/prestamos/PrestamoDetalleModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

const EstadoSolicitud = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [prestamos, setPrestamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrestamo, setSelectedPrestamo] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('en-curso'); // 'en-curso' o 'finalizadas'

    useEffect(() => {
        const fetchMisPrestamos = async () => {
            try {
                setLoading(true);
                const response = await getMisPrestamos();
                
                if (response.status === 'Success' && response.data) {
                    setPrestamos(response.data);
                } else {
                    setPrestamos([]);
                }
            } catch (error) {
                console.error('Error al obtener préstamos:', error);
                showErrorAlert('Error', 'No se pudieron cargar tus solicitudes');
                setPrestamos([]);
            } finally {
                setLoading(false);
            }
        };

        if (user?.rut) {
            fetchMisPrestamos();
        }
    }, [user?.rut, location.key]); // Agregar location.key para recargar cuando navegue a esta página

    // Función para descargar PDF
    const handleDescargarPDF = async (solicitud) => {
        try {
            if (!solicitud.ID_Prestamo) {
                showErrorAlert('No disponible', 'El PDF solo está disponible después de la aprobación');
                return;
            }

            const response = await descargarPDFAutorizacion(solicitud.ID_Solicitud);
            
            if (response && response.data) {
                // Crear un Blob desde los datos
                const blob = new Blob([response.data], { type: 'application/pdf' });
                
                // Crear URL temporal para el blob
                const url = window.URL.createObjectURL(blob);
                
                // Crear elemento <a> temporal para la descarga
                const link = document.createElement('a');
                link.href = url;
                link.download = `Autorizacion_Prestamo_${solicitud.ID_Prestamo}.pdf`;
                
                // Ejecutar descarga
                document.body.appendChild(link);
                link.click();
                
                // Limpiar
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                showSuccessAlert('Descarga exitosa', 'El PDF ha sido descargado');
            }
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            if (error.response?.status === 404) {
                showErrorAlert('No disponible', 'No se encontró el PDF de autorización');
            } else {
                showErrorAlert('Error', 'No se pudo descargar el PDF');
            }
        }
    };

    // Verificar si la solicitud es de largo plazo
    const esLargoPlazo = (item) => {
        return item.Fecha_inicio_sol && item.Fecha_termino_sol;
    };

    // Función auxiliar para obtener el estado de una solicitud/prestamo
    const getEstado = (item) => {
        // Si no tiene prestamo, es una solicitud pendiente
        if (!item.ID_Prestamo || !item.prestamo) {
            return { Cod_Estado: 1, Descripcion: 'Pendiente' };
        }

        // Si tiene prestamo, obtener el estado más reciente
        if (item.prestamo?.tieneEstados && item.prestamo.tieneEstados.length > 0) {
            // Ordenar por fecha y obtener el último estado (más reciente)
            const estadosOrdenados = [...item.prestamo.tieneEstados].sort(
                (a, b) => new Date(b.Fecha_Estado) - new Date(a.Fecha_Estado)
            );
            const ultimoEstado = estadosOrdenados[0];
            return {
                Cod_Estado: ultimoEstado.Cod_Estado,
                Descripcion: ultimoEstado.estadoPrestamo?.Descripcion || 'Desconocido'
            };
        }
        
        return { Cod_Estado: 1, Descripcion: 'Pendiente' };
    };

    // Filtrar préstamos en curso (pendientes: 1, aprobados: 2, entregados: 3)
    const prestamosEnCurso = prestamos.filter(item => {
        const estado = getEstado(item);
        // En curso: Pendiente (1), Listo para Entregar (2), Entregado (3)
        return estado.Cod_Estado >= 1 && estado.Cod_Estado <= 3;
    });

    // Filtrar préstamos finalizados (devueltos: 4, rechazados: 5)
    const prestamosFinalizados = prestamos.filter(item => {
        const estado = getEstado(item);
        // Finalizados: Devuelto (4) o Rechazado (5)
        return estado.Cod_Estado === 4 || estado.Cod_Estado === 5;
    });

    const handleVerDetalle = (prestamo) => {
        setSelectedPrestamo(prestamo);
        setShowModal(true);
    };

    const getEstadoBadgeClass = (codEstado) => {
        const clases = {
            1: 'badge-pendiente',    // Pendiente
            2: 'badge-aprobado',     // Listo para Entregar
            3: 'badge-entregado',    // Entregado
            4: 'badge-devuelto',     // Devuelto
            5: 'badge-rechazado'     // Rechazado
        };
        return clases[codEstado] || 'badge-default';
    };

    // Función para parsear fecha "YYYY-MM-DD" como local para evitar desfase UTC
    const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr.includes('T') || dateStr.includes(':')) return new Date(dateStr);
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            const date = parseLocalDate(fecha);
            return date.toLocaleString('es-CL', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    const renderTablasPrestamos = (lista, tipo) => {
        return (
            <>
                <div className="section-header-with-button">
                    <h2>
                        {tipo === 'en-curso' ? '⏳ Solicitudes En Curso' : '✅ Solicitudes Finalizadas'}
                        <span className="count-badge">({lista.length})</span>
                    </h2>
                </div>

                <div className="solicitudes-table-container">
                    <table className="solicitudes-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha Solicitud</th>
                                <th>Estado</th>
                                <th>Equipo</th>
                                <th>Categoría</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Término</th>
                                {tipo === 'finalizadas' && <th>Fecha Devolución</th>}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lista.length === 0 ? (
                                <tr>
                                    <td colSpan={tipo === 'finalizadas' ? 9 : 8} className="no-data">
                                        No tienes {tipo === 'en-curso' ? 'solicitudes en curso' : 'solicitudes finalizadas'}
                                    </td>
                                </tr>
                            ) : (
                                lista.map((item) => {
                                    const estado = getEstado(item);
                                    const idMostrar = item.prestamo?.ID_Prestamo || `S-${item.ID_Solicitud}`;
                                    
                                    return (
                                        <tr key={item.ID_Solicitud}>
                                            <td>{idMostrar}</td>
                                            <td>{formatFecha(item.Fecha_Sol)}</td>
                                            <td>
                                                <span className={`estado-badge ${getEstadoBadgeClass(estado.Cod_Estado)}`}>
                                                    {estado.Descripcion}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>{item.ID_Num_Inv}</strong>
                                                <div className="equipo-modelo">{item.equipo?.Modelo || 'N/A'}</div>
                                            </td>
                                            <td>{item.equipo?.categoria?.Descripcion || 'N/A'}</td>
                                            <td>{formatFecha(item.Fecha_inicio_sol || item.prestamo?.Fecha_inicio_prestamo || item.Fecha_Sol)}</td>
                                            <td>{formatFecha(item.Fecha_termino_sol || item.prestamo?.Fecha_fin_prestamo || item.Fecha_Sol)}</td>
                                            {tipo === 'finalizadas' && (
                                                <td>{formatFecha(item.prestamo?.devolucion?.Fecha_Dev)}</td>
                                            )}
                                            <td>
                                                <div className="actions-buttons">
                                                    <button 
                                                        className="btn-detail"
                                                        title="Ver detalles"
                                                        onClick={() => handleVerDetalle(item)}
                                                    >
                                                        📋
                                                    </button>
                                                    {/* Botón PDF solo para solicitudes de largo plazo aprobadas */}
                                                    {esLargoPlazo(item) && item.ID_Prestamo && (
                                                        <button 
                                                            className="btn-pdf"
                                                            title="Descargar PDF de Autorización"
                                                            onClick={() => handleDescargarPDF(item)}
                                                        >
                                                            <FontAwesomeIcon icon={faFilePdf} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    if (loading) {
        return (
            <div className="main-container">
                <div className="loading-message">
                    <p>Cargando tus solicitudes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div className="solicitudes-header">
                <h1>Estado de Mis Solicitudes</h1>
            </div>

            <div className="tabs-container">
                <button 
                    className={`tab-button ${activeTab === 'en-curso' ? 'active' : ''}`}
                    onClick={() => setActiveTab('en-curso')}
                >
                    ⏳ En Curso
                </button>
                <button 
                    className={`tab-button ${activeTab === 'finalizadas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('finalizadas')}
                >
                    ✅ Finalizadas
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'en-curso' && renderTablasPrestamos(prestamosEnCurso, 'en-curso')}
                {activeTab === 'finalizadas' && renderTablasPrestamos(prestamosFinalizados, 'finalizadas')}
            </div>

            {showModal && selectedPrestamo && (
                <PrestamoDetalleModal
                    show={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedPrestamo(null);
                    }}
                    prestamo={selectedPrestamo}
                />
            )}
        </div>
    );
};

export default EstadoSolicitud;
