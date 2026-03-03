import '@styles/styles.css';
import '@styles/gestion-solicitudes.css';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSolicitudes, visualizarPDFAutorizacion, entregarPrestamo, devolverPrestamo } from '@services/solicitud.service';
import { aprobarSolicitud, rechazarSolicitud } from '@services/autorizacion.service';
import { registrarDevolucion } from '@services/devolucion.service';
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from '@helpers/sweetAlert';
import { useAuth } from '@context/AuthContext';
import Search from '@components/Search';
import Swal from 'sweetalert2';
import PrestamoDetalleModal from '@components/prestamos/PrestamoDetalleModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faEye, faFileAlt, faCheckCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import * as documentoService from '@services/documento.service';
import ActaPrestamoPrePrint from '@components/prestamos/ActaPrestamoPrePrint';
import SubirActaModal from '@components/prestamos/SubirActaModal';

const GestionSolicitudes = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('pendientes');
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('diaria'); // 'diaria' o 'largo_plazo'
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actaData, setActaData] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [solicitudToUpload, setSolicitudToUpload] = useState(null);
    const location = useLocation();

    // Verificar si el usuario es director de escuela o administrador
    const esDirectorEscuela = user?.esDirectorEscuela || false;
    const isAdmin = user?.tipoUsuario === 'Administrador';

    // Determinar texto del director según carrera
    const getDirectorText = (solicitud) => {
        const carrera = solicitud.usuario?.carrera?.Nombre_Carrera || '';
        if (carrera.includes('Civil')) return 'Requiere aprobación del Director/a de Escuela ICI';
        if (carrera.includes('Ejecución')) return 'Requiere aprobación del Director/a de Escuela IECI';
        return 'Requiere aprobación del Director'; // Fallback
    };

    // Determinar tipo de solicitud basado en fechas (ignora la hora)
    const getTipoSolicitud = (solicitud) => {
        if (!solicitud.Fecha_inicio_sol || !solicitud.Fecha_termino_sol) return 'diaria';
        
        const start = new Date(solicitud.Fecha_inicio_sol).setHours(0,0,0,0);
        const end = new Date(solicitud.Fecha_termino_sol).setHours(0,0,0,0);
        
        // Si las fechas son diferentes (diferente día), es largo plazo
        if (start !== end) {
            return 'largo_plazo';
        }
        return 'diaria';
    };

    // Obtener estado de una solicitud basado en su préstamo y relaciones
    const getEstadoSolicitud = (solicitud) => {
        if (!solicitud.ID_Prestamo || !solicitud.prestamo) {
            return 'Pendiente';
        }

        const prestamo = solicitud.prestamo;
        
        // Si tiene devolución, está devuelto
        if (prestamo.devolucion) {
            return 'Devuelto';
        }

        // Verificar estados en tieneEstados (ordenar por más reciente)
        if (prestamo.tieneEstados && prestamo.tieneEstados.length > 0) {
            const estadoMasReciente = prestamo.tieneEstados
                .sort((a, b) => new Date(b.Fecha_Estado) - new Date(a.Fecha_Estado))[0];
            
            if (estadoMasReciente.estadoPrestamo) {
                const codEstado = estadoMasReciente.Cod_Estado;
                // Mapear estados por código
                if (codEstado === 1) return 'Pendiente';
                if (codEstado === 2) return 'Listo para Entregar';
                if (codEstado === 3) return 'Listo para recepcionar';
                if (codEstado === 4) return 'Devuelto';
                if (codEstado === 5) return 'Rechazado';
                
                // Fallback a descripción si existe
                const descripcion = estadoMasReciente.estadoPrestamo.Descripcion;
                if (descripcion === 'Listo para Entregar') return 'Listo para Entregar';
                if (descripcion === 'Entregado') return 'Listo para recepcionar';
                if (descripcion === 'Devuelto') return 'Devuelto';
                if (descripcion === 'Rechazado') return 'Rechazado';
                return descripcion || 'Desconocido';
            }
        }

        // Si tiene autorización, verificar si fue aprobado o rechazado
        if (prestamo.autorizacion) {
            // Si la observación menciona rechazo
            if (prestamo.autorizacion.Obs_Aut && prestamo.autorizacion.Obs_Aut.toLowerCase().includes('rechaz')) {
                return 'Rechazado';
            }
            return 'Listo para Entregar'; // Por defecto, si tiene autorización está lista
        }

        return 'Procesando';
    };

    // Cargar solicitudes
    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            const response = await getSolicitudes();
            
            if (response.status === 'Success' && response.data) {
                setSolicitudes(response.data);
            } else {
                setSolicitudes([]);
            }
        } catch (error) {
            console.error('Error al obtener solicitudes:', error);
            showErrorAlert('Error', 'No se pudieron cargar las solicitudes');
            setSolicitudes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    // Efecto para abrir modal si hay un ID en la URL
    useEffect(() => {
        if (!loading && solicitudes.length > 0) {
            const queryParams = new URLSearchParams(location.search);
            const idSolicitud = queryParams.get('id');
            if (idSolicitud) {
                const solicitud = solicitudes.find(s => s.ID_Solicitud === parseInt(idSolicitud));
                if (solicitud) {
                    handleVerDetalle(solicitud);
                }
            }
        }
    }, [location.search, solicitudes, loading]);

    // Filtrar solicitudes por estado
    const filterByEstado = (estado) => {
        return solicitudes.filter(s => getEstadoSolicitud(s) === estado);
    };

    // Filtrar por búsqueda
    const filterBySearch = (solicitudesList) => {
        if (!searchText) return solicitudesList;
        
        return solicitudesList.filter(solicitud => {
            const searchLower = searchText.toLowerCase();
            return (
                solicitud.usuario?.Nombre_Completo?.toLowerCase().includes(searchLower) ||
                solicitud.usuario?.Correo?.toLowerCase().includes(searchLower) ||
                solicitud.ID_Num_Inv?.toLowerCase().includes(searchLower) ||
                solicitud.equipo?.categoria?.Descripcion?.toLowerCase().includes(searchLower) ||
                solicitud.Motivo_Sol?.toLowerCase().includes(searchLower)
            );
        });
    };

    // Obtener solicitudes según la pestaña activa
    const getFilteredSolicitudes = () => {
        let filtered = [];
        switch (activeTab) {
            case 'pendientes':
                filtered = filterByEstado('Pendiente');
                break;
            case 'listo-entregar':
                filtered = filterByEstado('Listo para Entregar');
                break;
            case 'entregados':
                filtered = filterByEstado('Listo para recepcionar');
                break;
            case 'devueltos':
                filtered = filterByEstado('Devuelto');
                break;
            case 'rechazados':
                filtered = filterByEstado('Rechazado');
                break;
            case 'historial':
                // Para historial, mostramos todo lo que NO sea Pendiente
                filtered = solicitudes.filter(s => getEstadoSolicitud(s) !== 'Pendiente');
                break;
            default:
                filtered = solicitudes;
        }

        // Filtrar por tipo de solicitud y carrera según el rol
        if (esDirectorEscuela) {
            // Director solo ve solicitudes a largo plazo
            filtered = filtered.filter(s => getTipoSolicitud(s) === 'largo_plazo');
            // Filtrar por carrera del director (si está definida)
            if (user?.idCarrera) {
                filtered = filtered.filter(s => s.usuario?.ID_Carrera === user.idCarrera);
            }
        } else if (isAdmin) {
            // Admin: en pendientes filtra por tipo selector, en otras pestañas ve todas
            if (activeTab === 'pendientes') {
                filtered = filtered.filter(s => getTipoSolicitud(s) === tipoFiltro);
            }
        }

        return filterBySearch(filtered);
    };

    // Helper para obtener badge de estado
    const getStatusBadgeInfo = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return { clase: 'pendiente', texto: 'Pendiente' };
            case 'Listo para Entregar':
                return { clase: 'aprobado', texto: 'Aprobado' };
            case 'Listo para recepcionar':
                return { clase: 'entregado', texto: 'Entregado' };
            case 'Entregado': // Agregamos este caso por si acaso viene del backend así
                return { clase: 'entregado', texto: 'Entregado' };
            case 'Devuelto':
                return { clase: 'devuelto', texto: 'Devuelto' };
            case 'Rechazado':
                return { clase: 'rechazado', texto: 'Rechazado' };
            default:
                return { clase: 'procesando', texto: estado };
        }
    };

    const filteredSolicitudes = getFilteredSolicitudes();

    // Handler para ver detalles
    const handleVerDetalle = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setShowModal(true);
    };

    // Formatear fecha
    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        try {
            const date = new Date(fecha);
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

    // Handler para aprobar solicitud
    const handleAprobar = async (solicitud) => {
        console.log('Solicitud completa:', JSON.stringify(solicitud, null, 2));
        console.log('Usuario Nombre:', solicitud.usuario?.Nombre);
        console.log('Usuario Apellido:', solicitud.usuario?.Apellido);
        console.log('Todas las propiedades de usuario:', Object.keys(solicitud.usuario || {}));
        
        // Formatear fechas para mostrar
        const formatFechaDisplay = (fecha) => {
            if (!fecha) return '';
            try {
                const date = new Date(fecha);
                return date.toLocaleDateString('es-CL', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                });
            } catch {
                return fecha;
            }
        };
    
    // Helper para obtener badge de estado

    const result = await Swal.fire({
            title: 'Aprobar Solicitud',
            html: `
                <div style="text-align: left;">
                    <p><strong>Usuario:</strong> ${solicitud.usuario?.Nombre_Completo || 'N/A'}</p>
                    <p><strong>RUT:</strong> ${solicitud.Rut || ''}</p>
                    <p><strong>Equipo:</strong> ${solicitud.ID_Num_Inv}</p>
                    <p><strong>Motivo:</strong> ${solicitud.Motivo_Sol}</p>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #4a90e2;">
                        <p style="margin: 5px 0;"><strong>📅 Período del Préstamo:</strong></p>
                        <p style="margin: 5px 0; padding-left: 10px;">
                            <strong>Desde:</strong> ${formatFechaDisplay(solicitud.Fecha_inicio_sol || solicitud.Fecha_Sol)}
                        </p>
                        <p style="margin: 5px 0; padding-left: 10px;">
                            <strong>Hasta:</strong> ${formatFechaDisplay(solicitud.Fecha_termino_sol || solicitud.Fecha_Sol)}
                        </p>
                    </div>

                    <div style="margin-top: 15px; padding: 15px; background-color: #e8f4fd; border-radius: 8px; border-left: 4px solid #2196F3;">
                        <p style="margin: 5px 0;"><strong>✓ Condiciones de Aprobación:</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px; text-align: left; font-size: 14px;">
                            <li>El estudiante debe estar vigente en el sistema</li>
                            <li>No debe tener penalizaciones activas</li>
                            <li>El equipo debe ser devuelto en la fecha indicada</li>
                            <li>El estudiante será responsable del equipo durante el período de préstamo</li>
                        </ul>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Aprobar',
            cancelButtonText: 'Cancelar',
            width: '600px'
        });

        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Procesando...',
                text: 'Aprobando solicitud y generando préstamo...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const now = new Date();
                const horaActual = now.toTimeString().split(' ')[0];

                // Condiciones estándar de préstamo (para el PDF y documento)
                const condicionesEstandar = 
                    "• El equipo debe ser usado exclusivamente para fines académicos\n" +
                    "• El usuario es responsable del cuidado y correcto uso del equipo\n" +
                    "• Cualquier daño o pérdida debe ser reportado inmediatamente\n" +
                    "• El equipo debe ser devuelto en la fecha indicada y en las mismas condiciones";

                const data = {
                    ID_Solicitud: solicitud.ID_Solicitud,
                    Rut_Autorizador: user.rut,
                    ID_Num_Inv: solicitud.ID_Num_Inv,
                    // Usar las fechas de la solicitud, o la actual si es diaria
                    Fecha_inicio_prestamo: solicitud.Fecha_inicio_sol || new Date().toISOString(),
                    Hora_inicio_prestamo: horaActual,
                    Fecha_fin_prestamo: solicitud.Fecha_termino_sol,
                    Hora_fin_prestamo: horaActual,
                    Tipo_documento: null, // No aplica para director de escuela
                    Condiciones_Prestamo: condicionesEstandar,
                    Fecha_Aut: new Date().toISOString(),
                    Hora_Aut: horaActual,
                    Obs_Aut: 'Solicitud aprobada'
                };

                const response = await aprobarSolicitud(data);

                if (response.status === 'Success') {
                    showSuccessAlert('¡Solicitud Aprobada!', 'El préstamo ha sido creado exitosamente');
                    fetchSolicitudes();
                } else {
                    showErrorAlert('Error', response.message || 'No se pudo aprobar la solicitud');
                }
            } catch (error) {
                console.error('Error al aprobar:', error);
                showErrorAlert('Error', 'Ocurrió un error al aprobar la solicitud');
            }
        }
    };

    // Handler para rechazar solicitud
    const handleRechazar = async (solicitud) => {
        const result = await Swal.fire({
            title: 'Rechazar Solicitud',
            html: `
                <div style="text-align: left;">
                    <p><strong>Usuario:</strong> ${solicitud.usuario?.Nombre_Completo || 'N/A'}</p>
                    <p><strong>Equipo:</strong> ${solicitud.ID_Num_Inv}</p>
                    <p><strong>Motivo:</strong> ${solicitud.Motivo_Sol}</p>
                </div>
                <div style="margin-top: 15px;">
                    <label for="motivo-rechazo" style="display: block; text-align: left; margin-bottom: 5px;">
                        <strong>Motivo del Rechazo:</strong>
                    </label>
                    <textarea id="motivo-rechazo" class="swal2-textarea" placeholder="Explica por qué se rechaza la solicitud" required style="margin: 0;"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Rechazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            preConfirm: () => {
                const motivoRechazo = document.getElementById('motivo-rechazo').value;

                if (!motivoRechazo || motivoRechazo.trim() === '') {
                    Swal.showValidationMessage('Debes especificar el motivo del rechazo');
                    return false;
                }

                return { motivoRechazo };
            }
        });

        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Procesando...',
                text: 'Rechazando solicitud...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const now = new Date();
                const horaActual = now.toTimeString().split(' ')[0];

                const data = {
                    ID_Solicitud: solicitud.ID_Solicitud,
                    Rut_Autorizador: user.rut,
                    ID_Num_Inv: solicitud.ID_Num_Inv,
                    Fecha_Aut: new Date().toISOString(),
                    Hora_Aut: horaActual,
                    Motivo_Rechazo: result.value.motivoRechazo
                };

                const response = await rechazarSolicitud(data);

                if (response.status === 'Success') {
                    showSuccessAlert('Solicitud Rechazada', 'La solicitud ha sido rechazada');
                    fetchSolicitudes();
                } else {
                    showErrorAlert('Error', response.message || 'No se pudo rechazar la solicitud');
                }
            } catch (error) {
                console.error('Error al rechazar:', error);
                showErrorAlert('Error', 'Ocurrió un error al rechazar la solicitud');
            }
        }
    };

    // Handler para descargar PDF de autorización
    const handleDescargarPDF = async (solicitud) => {
        try {
            await descargarPDFAutorizacion(solicitud.ID_Solicitud);
            showSuccessAlert('PDF Descargado', 'El documento de autorización se ha descargado correctamente');
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            showErrorAlert('Error', 'No se pudo descargar el PDF de autorización');
        }
    };

    // Handler para marcar como entregado (Admin entrega equipo al alumno)
    const handleEntregar = async (solicitud) => {
        const esDiaria = getTipoSolicitud(solicitud) === 'diaria';
        let tipoDocumento = null;

        if (esDiaria) {
            const { value: documento } = await Swal.fire({
                title: 'Documento en Garantía',
                html: `
                    <p style="margin-bottom: 15px;">Para solicitudes diarias, el alumno debe dejar un documento en garantía.</p>
                    <label for="tipo-documento" style="display: block; text-align: left; margin-bottom: 5px; font-weight: bold;">
                        Selecciona el documento recibido:
                    </label>
                    <select id="tipo-documento" class="swal2-select" style="margin: 0; width: 100%;">
                        <option value="Pase Escolar">Pase Escolar</option>
                        <option value="Cédula de Identidad">Cédula de Identidad</option>
                        <option value="Otro">Otro</option>
                    </select>
                `,
                showCancelButton: true,
                confirmButtonText: 'Confirmar Entrega',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return document.getElementById('tipo-documento').value;
                }
            });

            if (!documento) return; // Si cancela, no hacemos nada
            tipoDocumento = documento;
        } else {
            // Para solicitudes largo plazo, solo confirmación simple
            const confirmed = await showConfirmAlert(
                'Entregar Equipo',
                `¿Confirmas que entregas el equipo ${solicitud.ID_Num_Inv} a ${solicitud.usuario.Nombre_Completo}?`,
                'Sí, entregar'
            );
            if (!confirmed) return;
        }

        // VALIDACIÓN: Verificar si tiene el acta subida (solo si es admin y es pestaña listo para entregar)
        if (!esDiaria && !solicitud.prestamo?.Documento_Suscrito) {
            showErrorAlert('Documento Requerido', 'Debe subir el acta firmada antes de proceder con la entrega del equipo.');
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Procesando...',
            text: 'Registrando entrega del equipo...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await entregarPrestamo(solicitud.prestamo.ID_Prestamo, tipoDocumento);
            
            if (response.status === 'Success') {
                showSuccessAlert('Equipo Entregado', 'El equipo ha sido marcado como entregado');
                fetchSolicitudes();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo marcar como entregado');
            }
        } catch (error) {
            console.error('Error al entregar:', error);
            showErrorAlert('Error', 'Ocurrió un error al entregar el equipo');
        }
    };

    // Handler para registrar devolución (Admin recibe equipo del alumno)
    const handleDevolver = async (solicitud) => {
        const result = await Swal.fire({
            title: 'Registrar Devolución',
            html: `
                <div style="text-align: left;">
                    <p><strong>Usuario:</strong> ${solicitud.usuario.Nombre_Completo}</p>
                    <p><strong>Equipo:</strong> ${solicitud.ID_Num_Inv}</p>
                </div>

                <div style="margin-top: 15px; padding: 10px; background-color: #e3f2fd; border-radius: 5px;">
                    <p style="margin-bottom: 5px; font-weight: bold; color: #1976d2;">Lista de Verificación:</p>
                    <div style="text-align: left;">
                        <input type="checkbox" id="check-visual" style="margin-right: 8px;">
                        <label for="check-visual">Realicé inspección visual y funcional del equipo.</label>
                    </div>
                    <div style="text-align: left; margin-top: 5px;">
                        <input type="checkbox" id="check-doc" style="margin-right: 8px;">
                        <label for="check-doc">Devolví el documento de garantía al usuario.</label>
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <label for="estado-equipo" style="display: block; text-align: left; margin-bottom: 5px;">
                        <strong>Estado del Equipo:</strong>
                    </label>
                    <select id="estado-equipo" class="swal2-select" style="margin: 0; width: 100%;">
                        <option value="En buen estado">En buen estado</option>
                        <option value="Con daños leves">Con daños leves</option>
                        <option value="Con daños graves">Con daños graves</option>
                        <option value="Requiere reparación">Requiere reparación</option>
                    </select>
                </div>
                <div style="margin-top: 15px;">
                    <label for="observaciones" style="display: block; text-align: left; margin-bottom: 5px;">
                        <strong>Observaciones (opcional):</strong>
                    </label>
                    <textarea id="observaciones" class="swal2-textarea" placeholder="Comentarios adicionales..." style="margin: 0;"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Registrar Devolución',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const checkVisual = document.getElementById('check-visual').checked;
                const checkDoc = document.getElementById('check-doc').checked;
                const estadoEquipo = document.getElementById('estado-equipo').value;
                const observaciones = document.getElementById('observaciones').value;

                if (!checkVisual || !checkDoc) {
                    Swal.showValidationMessage('Debes completar la lista de verificación para continuar');
                    return false;
                }

                return { estadoEquipo, observaciones };
            }
        });

        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Procesando...',
                text: 'Registrando devolución...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const now = new Date();
                const horaActual = now.toTimeString().split(' ')[0];

                const data = {
                    Estado_Equipo_Devolucion: result.value.estadoEquipo,
                    Obs_Dev: result.value.observaciones || null,
                    Fecha_Dev: now.toISOString(),
                    Hora_Dev: horaActual
                };

                const response = await devolverPrestamo(solicitud.prestamo.ID_Prestamo, data);
                
                if (response.status === 'Success') {
                    showSuccessAlert('Devolución Registrada', 'La devolución ha sido registrada correctamente');
                    fetchSolicitudes();
                } else {
                    showErrorAlert('Error', response.message || 'No se pudo registrar la devolución');
                }
            } catch (error) {
                console.error('Error al devolver:', error);
                showErrorAlert('Error', 'Ocurrió un error al registrar la devolución');
            }
        }
    };

    // Handler para generar (imprimir) acta
    const handleGenerarActa = async (solicitud) => {
        try {
            const response = await documentoService.getInfoActa(solicitud.ID_Solicitud);
            if (response.status === 'Success') {
                setActaData(response.data);
                // Ya no disparamos window.print() automáticamente
            }
        } catch (error) {
            console.error('Error al obtener info del acta:', error);
            showErrorAlert('Error', 'No se pudo obtener la información para generar el acta');
        }
    };

    // Handler para subir acta firmada (Nuevo con modal interactivo)
    const handleSubirActa = (solicitud) => {
        setSolicitudToUpload(solicitud);
        setIsUploadModalOpen(true);
    };

    const handleConfirmUploadActa = async (file) => {
        try {
            const response = await documentoService.subirActaFirmada(solicitudToUpload.prestamo.ID_Prestamo, file);
            if (response.status === 'Success') {
                showSuccessAlert('¡Éxito!', 'Acta subida correctamente. Ahora puede proceder con la entrega.');
                fetchSolicitudes();
            }
        } catch (error) {
            console.error('Error al subir acta:', error);
            showErrorAlert('Error', typeof error === 'string' ? error : 'No se pudo subir el archivo');
            throw error;
        }
    };

    // Handler para visualizar PDF de autorización
    const handleVisualizarPDF = async (solicitud) => {
        try {
            const url = await visualizarPDFAutorizacion(solicitud.ID_Solicitud);
            const win = window.open(url, '_blank');
            if (!win) {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.click();
            }
        } catch (error) {
            console.error('Error al visualizar PDF:', error);
            showErrorAlert('Error', 'No se pudo visualizar el PDF de autorización');
        }
    };

    // Handler para visualizar acta ya subida
    const handleVisualizarActaSuscrita = async (solicitud) => {
        try {
            const url = await documentoService.visualizarActaFirmada(solicitud.prestamo.ID_Prestamo);
            const win = window.open(url, '_blank');
            if (!win) {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.click();
            }
        } catch (error) {
            console.error('Error al visualizar acta:', error);
            showErrorAlert('Error', 'No se pudo visualizar el documento suscrito.');
        }
    };

    // Renderizar contenido de la pestaña activa
    const renderTabContent = () => {
        return (
            <>
                <div className="section-header-with-button">
                    <h2>
                        {activeTab === 'pendientes' && '⏳ Solicitudes Pendientes'}
                        {activeTab === 'listo-entregar' && '✅ Listo para Entregar'}
                        {activeTab === 'entregados' && '📦 Listo para recepcionar'}
                        {activeTab === 'devueltos' && '🔙 Equipos Devueltos'}
                        {activeTab === 'rechazados' && '❌ Solicitudes Rechazadas'}
                        {activeTab === 'historial' && '📋 Historial Completo'}
                        <span className="count-badge">({filteredSolicitudes.length})</span>
                    </h2>
                    
                    {/* Selector de tipo de solicitud solo para admin en pestaña pendientes */}
                    {isAdmin && !esDirectorEscuela && activeTab === 'pendientes' && (
                        <div className="tipo-solicitud-filter" style={{marginLeft: '20px'}}>
                            <select 
                                value={tipoFiltro} 
                                onChange={(e) => setTipoFiltro(e.target.value)}
                                className="tipo-filter-select"
                            >
                                <option value="diaria">📅 Solicitudes Diarias</option>
                                <option value="largo_plazo">📆 Solicitudes Largo Plazo</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="filters-section">
                    <Search 
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Buscar por usuario, email, equipo, categoría o motivo..."
                    />
                </div>

                <div className="solicitudes-table-container">
                    <table className="solicitudes-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tipo</th>
                                <th>Usuario</th>
                                <th>Equipo</th>
                                <th>Categoría</th>
                                <th>Fecha Solicitud</th>
                                {(tipoFiltro === 'largo_plazo' || esDirectorEscuela) && <th>Período Solicitado</th>}
                                {activeTab !== 'historial' && <th>Motivo</th>}
                                {activeTab === 'listo-entregar' && <th>Documentación</th>}
                                {activeTab === 'rechazados' && <th>Motivo Rechazo</th>}
                                {activeTab === 'entregados' && <th>Documentación</th>}
                                {activeTab === 'devueltos' && <th>Fecha Devolución</th>}
                                {activeTab === 'historial' && <th>Estado</th>} {/* Nueva columna para historial */}
                                {activeTab !== 'historial' && <th style={{width: '120px'}}>Acciones</th>}
                                {activeTab === 'historial' && <th style={{width: '80px'}}>Ver</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSolicitudes.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="no-data">
                                        No hay solicitudes {activeTab === 'pendientes' ? 'pendientes' : 
                                                           activeTab === 'listo-entregar' ? 'listas para entregar' :
                                                           activeTab === 'rechazados' ? 'rechazadas' :
                                                           activeTab === 'entregados' ? 'listas para recepcionar' : 'devueltas'}
                                    </td>
                                </tr>
                            ) : (
                                filteredSolicitudes.map((solicitud) => (
                                    <tr key={solicitud.ID_Solicitud}>
                                        <td>{solicitud.ID_Solicitud}</td>
                                        <td>
                                            <span className={`tipo-badge ${getTipoSolicitud(solicitud) === 'diaria' ? 'tipo-diaria' : 'tipo-largo'}`}>
                                                {getTipoSolicitud(solicitud) === 'diaria' ? '📅 Diaria' : '📆 Largo Plazo'}
                                            </span>
                                        </td>
                                        <td>{solicitud.usuario?.Nombre_Completo || 'N/A'}</td>
                                        <td>{solicitud.ID_Num_Inv}</td>
                                        <td>{solicitud.equipo?.categoria?.Descripcion || 'N/A'}</td>
                                        <td>{formatFecha(solicitud.Fecha_Sol)}</td>
                                        {(tipoFiltro === 'largo_plazo' || esDirectorEscuela) && (
                                            <td>
                                                {solicitud.Fecha_inicio_sol && solicitud.Fecha_termino_sol ? (
                                                    <div style={{fontSize: '12px'}}>
                                                        <div>📅 {new Date(solicitud.Fecha_inicio_sol).toLocaleDateString('es-CL')}</div>
                                                        <div>📅 {new Date(solicitud.Fecha_termino_sol).toLocaleDateString('es-CL')}</div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        )}
                                        {activeTab !== 'historial' && <td className="motivo-cell">{solicitud.Motivo_Sol || '-'}</td>}
                                        
                                        {activeTab === 'rechazados' && (
                                            <td className="motivo-cell">
                                                {solicitud.prestamo?.autorizacion?.Obs_Aut || '-'}
                                            </td>
                                        )}
                                        
                                        {activeTab === 'listo-entregar' && (
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    {getTipoSolicitud(solicitud) === 'largo_plazo' && (
                                                        <>
                                                            <button 
                                                                className="btn-download"
                                                                title="Ver Autorización del Director"
                                                                onClick={() => handleVisualizarPDF(solicitud)}
                                                                style={{ color: '#003366' }}
                                                            >
                                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                            </button>
                                                            
                                                            <button 
                                                                className="btn-download"
                                                                title="Visualizar Borrador del Acta"
                                                                onClick={() => handleGenerarActa(solicitud)}
                                                                style={{ color: '#0d47a1' }}
                                                            >
                                                                <FontAwesomeIcon icon={faFileAlt} />
                                                            </button>

                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button 
                                                                    className="btn-download"
                                                                    title={solicitud.prestamo?.Documento_Suscrito ? "Actualizar Acta Firmada" : "Subir Acta Firmada"}
                                                                    style={{ color: '#ff9800' }}
                                                                    onClick={() => handleSubirActa(solicitud)}
                                                                >
                                                                    <FontAwesomeIcon icon={faUpload} />
                                                                </button>
                                                                {solicitud.prestamo?.Documento_Suscrito && (
                                                                    <button 
                                                                        className="btn-download"
                                                                        style={{ color: '#2e7d32' }}
                                                                        title="Ver Archivo Cargado"
                                                                        onClick={() => handleVisualizarActaSuscrita(solicitud)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faEye} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        
                                        {activeTab === 'entregados' && (
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <span style={{fontSize: '12px', color: '#666', marginRight: '5px'}}>
                                                        {solicitud.prestamo?.Tipo_documento || 'Acta'}
                                                    </span>
                                                    {solicitud.prestamo?.Documento_Suscrito && (
                                                        <button 
                                                            className="btn-download"
                                                            style={{ color: '#2e7d32' }}
                                                            title="Ver Acta Firmada"
                                                            onClick={() => handleVisualizarActaSuscrita(solicitud)}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        
                                        {activeTab === 'devueltos' && (
                                            <td>{formatFecha(solicitud.prestamo?.devolucion?.Fecha_Dev)}</td>
                                        )}
                                        
                                        {activeTab === 'historial' && (
                                            <td style={{ textAlign: 'center' }}>
                                                {(() => {
                                                    const estado = getEstadoSolicitud(solicitud);
                                                    const { clase, texto } = getStatusBadgeInfo(estado);
                                                    return (
                                                        <span className={`estado-badge ${clase}`}>
                                                            {texto}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        )}

                                        <td>
                                            <div className="actions-buttons">
                                                {/* Botón Ver Detalles - Siempre visible */}
                                                <button 
                                                    className="btn-detail"
                                                    title="Ver detalles"
                                                    onClick={() => handleVerDetalle(solicitud)}
                                                >
                                                    📋
                                                </button>
                                                
                                                {/* PENDIENTES: Aprobar/Rechazar (Admin=diaria, Director=largo plazo) */}
                                                {activeTab === 'pendientes' && (
                                                    <>
                                                        {((isAdmin && getTipoSolicitud(solicitud) === 'diaria') || 
                                                          (esDirectorEscuela && getTipoSolicitud(solicitud) === 'largo_plazo')) ? (
                                                            <>
                                                                <button 
                                                                    className="btn-approve"
                                                                    title="Aprobar solicitud"
                                                                    onClick={() => handleAprobar(solicitud)}
                                                                >
                                                                    ✅
                                                                </button>
                                                                <button 
                                                                    className="btn-reject"
                                                                    title="Rechazar solicitud"
                                                                    onClick={() => handleRechazar(solicitud)}
                                                                >
                                                                    ❌
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="info-badge" style={{fontSize: '12px', color: '#666'}}>
                                                                {isAdmin ? `⏳ ${getDirectorText(solicitud)}` : '👁️ Solo lectura'}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                                
                                                {/* LISTO PARA ENTREGAR: Acciones de acta y Entrega (solo Admin) */}
                                                {activeTab === 'listo-entregar' && (
                                                    <>
                                                        {isAdmin && (
                                                            <>
                                                                <button 
                                                                    className={`btn-deliver ${getTipoSolicitud(solicitud) === 'largo_plazo' && !solicitud.prestamo?.Documento_Suscrito ? 'disabled' : ''}`}
                                                                    title={getTipoSolicitud(solicitud) === 'largo_plazo' && !solicitud.prestamo?.Documento_Suscrito ? "Debe subir el acta antes de entregar" : "Marcar como entregado"}
                                                                    onClick={() => handleEntregar(solicitud)}
                                                                    disabled={getTipoSolicitud(solicitud) === 'largo_plazo' && !solicitud.prestamo?.Documento_Suscrito}
                                                                    style={getTipoSolicitud(solicitud) === 'largo_plazo' && !solicitud.prestamo?.Documento_Suscrito ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                                                >
                                                                    📦
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                
                                                {/* ENTREGADOS: Registrar devolución (solo Admin) */}
                                                {activeTab === 'entregados' && isAdmin && (
                                                    <button 
                                                        className="btn-return"
                                                        title="Registrar devolución"
                                                        onClick={() => handleDevolver(solicitud)}
                                                    >
                                                        🔙
                                                    </button>
                                                )}
                                                
                                                {/* DEVUELTOS y RECHAZADOS: Sin acciones */}
                                                {(activeTab === 'devueltos' || activeTab === 'rechazados') && (
                                                    <span className="info-badge" style={{fontSize: '12px', color: '#666'}}>
                                                        ✓ Finalizado
                                                    </span>
                                                )}

                                                {/* HISTORIAL: Solo ver detalles/PDF */}
                                                {activeTab === 'historial' && (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button 
                                                            className="btn-download"
                                                            title="Ver Detalle"
                                                            onClick={() => handleVerDetalle(solicitud)}
                                                            style={{ color: '#003366' }}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                        {getEstadoSolicitud(solicitud) !== 'Rechazado' && getEstadoSolicitud(solicitud) !== 'Pendiente' && (
                                                            <button 
                                                                className="btn-download"
                                                                title="Ver Autorización"
                                                                onClick={() => handleVisualizarPDF(solicitud)}
                                                                style={{ color: '#2e7d32' }}
                                                            >
                                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    return (
        <div className="main-container">
            <div className="solicitudes-header">
                <h1>
                    {esDirectorEscuela ? '📆 Gestión de Solicitudes a Largo Plazo' : 'Gestión de Solicitudes de Préstamo'}
                </h1>
                {esDirectorEscuela && (
                    <p style={{fontSize: '14px', color: '#666', marginTop: '5px'}}>
                        Como Director de Escuela, puedes aprobar o rechazar solicitudes de préstamos a largo plazo
                    </p>
                )}
            </div>

            {/* Componente para visualización de actas */}
            {/* Modales de Documentación */}
            
            {/* 1. Modal para Acta Borrador */}
            {actaData && (
                <div className="modal-overlay">
                    <div className="modal-content-wrapper">
                        <div className="modal-view-body">
                            <ActaPrestamoPrePrint 
                                data={actaData} 
                                adminName={user.nombreCompleto}
                                onClose={() => setActaData(null)} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Modal para Subir Acta Firmada (Interactivo) */}
            <SubirActaModal 
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSolicitudToUpload(null);
                }}
                onUpload={handleConfirmUploadActa}
                solicitud={solicitudToUpload || {}}
            />

            <div className="tabs-container">
                <button 
                    className={`tab-button ${activeTab === 'pendientes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pendientes')}
                >
                    ⏳ Pendientes
                </button>

                {!esDirectorEscuela && (
                    <>
                        <button 
                            className={`tab-button ${activeTab === 'listo-entregar' ? 'active' : ''}`}
                            onClick={() => setActiveTab('listo-entregar')}
                        >
                            ✅ Listo para Entregar
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'entregados' ? 'active' : ''}`}
                            onClick={() => setActiveTab('entregados')}
                        >
                            📦 Listo para recepcionar
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'devueltos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('devueltos')}
                        >
                            🔙 Devueltos
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'rechazados' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rechazados')}
                        >
                            ❌ Rechazados
                        </button>
                    </>
                )}

                {esDirectorEscuela && (
                    <button 
                        className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        📋 Historial Completo
                    </button>
                )}
            </div>

            <div className="tab-content">
                {renderTabContent()}
            </div>

            {showModal && selectedSolicitud && (
                <PrestamoDetalleModal
                    show={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedSolicitud(null);
                    }}
                    prestamo={selectedSolicitud}
                />
            )}
        </div>
    );
};

export default GestionSolicitudes;
