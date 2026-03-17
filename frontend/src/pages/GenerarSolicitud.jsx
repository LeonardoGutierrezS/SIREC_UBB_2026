import '@styles/styles.css';
import '@styles/generar-solicitud.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect } from 'react';
import { useGetEquiposDisponibles } from '@hooks/equipos/useGetEquiposDisponibles';
import { useGetCategorias } from '@hooks/catalogos/useGetCategorias';
import { createSolicitud } from '@services/solicitud.service';
import { getActivasPorUsuario } from '@services/penalizacion.service';
import { showErrorAlert, showSuccessAlert, showLoadingAlert, closeAlert } from '@helpers/sweetAlert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';

registerLocale('es', es);

const GenerarSolicitud = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [tipoPrestamo, setTipoPrestamo] = useState('diario'); // 'diario' o 'largo_plazo'
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaTermino, setFechaTermino] = useState(null);
    const [formData, setFormData] = useState({
        motivo: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sancionesActivas, setSancionesActivas] = useState([]);
    const [loadingSanciones, setLoadingSanciones] = useState(true);

    const { equipos, loading: loadingEquipos } = useGetEquiposDisponibles();
    const { categorias, loading: loadingCategorias } = useGetCategorias();

    useEffect(() => {
        const checkSanciones = async () => {
            if (user?.rut) {
                const [data] = await getActivasPorUsuario(user.rut);
                if (data && data.length > 0) {
                    setSancionesActivas(data);
                }
            }
            setLoadingSanciones(false);
        };
        checkSanciones();
    }, [user]);

    // Filtrar equipos por categoría seleccionada
    const equiposFiltrados = selectedCategoria
        ? equipos.filter(eq => eq.categoria?.ID_Categoria === selectedCategoria.ID_Categoria)
        : [];

    // Filtrar equipos por búsqueda
    const equiposBuscados = searchText
        ? equiposFiltrados.filter(eq =>
            eq.ID_Num_Inv?.toLowerCase().includes(searchText.toLowerCase()) ||
            eq.Modelo?.toLowerCase().includes(searchText.toLowerCase()) ||
            eq.Numero_Serie?.toLowerCase().includes(searchText.toLowerCase()) ||
            eq.marca?.Marca?.toLowerCase().includes(searchText.toLowerCase())
        )
        : equiposFiltrados;

    // Resetear al cambiar de categoría
    useEffect(() => {
        setSearchText('');
        setSelectedEquipo(null);
    }, [selectedCategoria]);

    // Manejar selección de categoría
    const handleSelectCategoria = (categoria) => {
        setSelectedCategoria(categoria);
        setCurrentStep(2);
    };

    // Manejar selección de equipo
    const handleSelectEquipo = (equipo) => {
        setSelectedEquipo(equipo);
        setCurrentStep(3);
    };

    // Volver al paso anterior
    const handleBack = () => {
        if (currentStep === 3) {
            setCurrentStep(2);
            setSelectedEquipo(null);
        } else if (currentStep === 2) {
            setCurrentStep(1);
            setSelectedCategoria(null);
            setSelectedEquipo(null);
        }
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Enviar solicitud
    const handleSubmit = async () => {
        // Validaciones
        if (!formData.motivo || formData.motivo.trim() === '') {
            showErrorAlert('Motivo requerido', 'Debes especificar el motivo de tu solicitud.');
            return;
        }

        // Si hay fechas, validar que sean correctas
        if (fechaInicio || fechaTermino) {
            if (!fechaInicio || !fechaTermino) {
                showErrorAlert('Fechas incompletas', 'Debes especificar ambas fechas para solicitudes a largo plazo.');
                return;
            }
            if (fechaTermino < fechaInicio) {
                showErrorAlert('Fechas inválidas', 'La fecha de término debe ser posterior a la fecha de inicio.');
                return;
            }
        }

        setIsSubmitting(true);
        showLoadingAlert('Enviando Solicitud...', 'Por favor espera un momento mientras procesamos tu pedido.');

        try {
            // Obtener hora actual en formato HH:MM:SS
            const now = new Date();
            const horaActual = now.toTimeString().split(' ')[0]; // Formato: HH:MM:SS

            // Preparar datos de la solicitud
            const solicitudData = {
                Rut: user.rut,
                ID_Num_Inv: selectedEquipo.ID_Num_Inv,
                Fecha_Sol: new Date().toISOString(),
                Hora_Sol: horaActual,
                Motivo_Sol: formData.motivo.trim()
            };

            // Agregar fechas si existen (largo plazo), si no, usar la fecha de solicitud (diario)
            if (fechaInicio && fechaTermino) {
                solicitudData.Fecha_inicio_sol = fechaInicio.toISOString().split('T')[0];
                solicitudData.Fecha_termino_sol = fechaTermino.toISOString().split('T')[0];
            } else {
                // Obtener fecha local en formato YYYY-MM-DD para evitar desfase UTC
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const soloFechaLocal = `${year}-${month}-${day}`;
                
                solicitudData.Fecha_inicio_sol = soloFechaLocal;
                solicitudData.Fecha_termino_sol = soloFechaLocal;
            }

            const response = await createSolicitud(solicitudData);

            closeAlert(); // Cerrar el loading antes de mostrar éxito/error

            if (response.status === 'Success') {
                showSuccessAlert(
                    '¡Solicitud enviada!',
                    'Tu solicitud de préstamo ha sido enviada exitosamente. El administrador la revisará pronto.'
                );
                // Redirigir a estado de solicitudes
                navigate('/estado-solicitud');
            } else {
                showErrorAlert('Error', response.message || 'No se pudo crear la solicitud');
            }
        } catch (error) {
            closeAlert();
            console.error('Error al crear solicitud:', error);
            showErrorAlert('Error', 'Ocurrió un error al crear la solicitud');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderizar paso 1: Selección de categoría
    const renderStep1 = () => {
        if (loadingCategorias) {
            return <div className="loading-message">Cargando categorías...</div>;
        }

        return (
            <div className="step-content">
                <h2>📦 Paso 1: Selecciona una Categoría</h2>
                <p className="step-description">Elige el tipo de equipo que necesitas para tu préstamo</p>

                <div className="categorias-grid">
                    {categorias.map((categoria) => {
                        const equiposDisponibles = equipos.filter(
                            eq => eq.categoria?.ID_Categoria === categoria.ID_Categoria
                        ).length;

                        return (
                            <div
                                key={categoria.ID_Categoria}
                                className={`categoria-card ${equiposDisponibles === 0 ? 'disabled' : ''}`}
                                onClick={() => equiposDisponibles > 0 && handleSelectCategoria(categoria)}
                            >
                                <h3>{categoria.Descripcion}</h3>
                                <div className="categoria-count">
                                    {equiposDisponibles} {equiposDisponibles === 1 ? 'equipo' : 'equipos'} disponible{equiposDisponibles !== 1 ? 's' : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Renderizar paso 2: Selección de equipo
    const renderStep2 = () => {
        if (loadingEquipos) {
            return <div className="loading-message">Cargando equipos...</div>;
        }

        return (
            <div className="step-content">
                <h2>💻 Paso 2: Selecciona un Equipo</h2>
                <p className="step-description">
                    Categoría: <strong>{selectedCategoria?.Descripcion}</strong>
                </p>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por N° Inventario, Modelo, Serie o Marca..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="equipos-list">
                    {equiposBuscados.length === 0 ? (
                        <div className="no-equipos">
                            <p>No hay equipos disponibles en esta categoría</p>
                        </div>
                    ) : (
                        equiposBuscados.map((equipo) => {
                            return (
                                <div
                                    key={equipo.ID_Num_Inv}
                                    className="equipo-card"
                                    onClick={() => handleSelectEquipo(equipo)}
                                >
                                    <div className="equipo-header">
                                        <span className="equipo-inv">{equipo.ID_Num_Inv}</span>
                                        <span className="equipo-badge disponible">Disponible</span>
                                    </div>
                                    <div className="equipo-info">
                                        <div className="equipo-detail">
                                            <span className="label">Categoría:</span>
                                            <span className="value">{equipo.categoria?.Descripcion || 'N/A'}</span>
                                        </div>
                                        <div className="equipo-detail">
                                            <span className="label">Marca:</span>
                                            <span className="value">{equipo.marca?.Descripcion || 'N/A'}</span>
                                        </div>
                                        <div className="equipo-detail">
                                            <span className="label">Modelo:</span>
                                            <span className="value">{equipo.Modelo}</span>
                                        </div>
                                        {equipo.especificaciones && equipo.especificaciones.length > 0 && (
                                            <>
                                                {equipo.especificaciones.map((spec, index) => (
                                                    <div key={index} className="equipo-detail">
                                                        <span className="label">{spec.Tipo_Especificacion_HW}:</span>
                                                        <span className="value">{spec.Descripcion}</span>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="step-actions">
                    <button className="btn-back" onClick={handleBack}>
                        ← Volver
                    </button>
                </div>
            </div>
        );
    };

    // Renderizar paso 3: Resumen y confirmación
    const renderStep3 = () => {
        return (
            <div className="step-content">
                <h2>📋 Paso 3: Confirma tu Solicitud</h2>
                <p className="step-description">Revisa los detalles y completa la información</p>

                <div className="resumen-container">
                    {/* Información del equipo */}
                    <div className="resumen-section">
                        <h3>💻 Equipo Seleccionado</h3>
                        <div className="resumen-grid">
                            <div className="resumen-item">
                                <span className="label">N° Inventario:</span>
                                <span className="value">{selectedEquipo?.ID_Num_Inv}</span>
                            </div>
                            <div className="resumen-item">
                                <span className="label">Categoría:</span>
                                <span className="value">{selectedEquipo?.categoria?.Descripcion}</span>
                            </div>
                            <div className="resumen-item">
                                <span className="label">Marca:</span>
                                <span className="value">{selectedEquipo?.marca?.Descripcion || 'N/A'}</span>
                            </div>
                            <div className="resumen-item">
                                <span className="label">Modelo:</span>
                                <span className="value">{selectedEquipo?.Modelo}</span>
                            </div>
                            {selectedEquipo?.especificaciones && selectedEquipo.especificaciones.length > 0 && (
                                <>
                                    {selectedEquipo.especificaciones.map((spec, index) => (
                                        <div key={index} className="resumen-item">
                                            <span className="label">{spec.Tipo_Especificacion_HW}:</span>
                                            <span className="value">{spec.Descripcion}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Configuración del período de préstamo */}
                    <div className="resumen-section prestamo-config">
                        <h3>📅 Período del Préstamo *</h3>
                        <p className="section-description">
                            Selecciona el tipo de préstamo que necesitas
                        </p>
                        
                        <div className="tipo-prestamo-selector">
                            <label className={`tipo-option ${tipoPrestamo === 'diario' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="tipoPrestamo"
                                    value="diario"
                                    checked={tipoPrestamo === 'diario'}
                                    onChange={(e) => {
                                        setTipoPrestamo(e.target.value);
                                        setFechaInicio(null);
                                        setFechaTermino(null);
                                    }}
                                />
                                <div className="option-content">
                                    <span className="option-icon">⏰</span>
                                    <div className="option-text">
                                        <strong>Préstamo por el Día</strong>
                                        <small>Retiro y devolución el mismo día - Aprobación por Administrador</small>
                                    </div>
                                </div>
                            </label>

                            <label className={`tipo-option ${tipoPrestamo === 'largo_plazo' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="tipoPrestamo"
                                    value="largo_plazo"
                                    checked={tipoPrestamo === 'largo_plazo'}
                                    onChange={(e) => setTipoPrestamo(e.target.value)}
                                />
                                <div className="option-content">
                                    <span className="option-icon">📆</span>
                                    <div className="option-text">
                                        <strong>Préstamo a Largo Plazo</strong>
                                        <small>Múltiples días - Requiere aprobación del Director de Escuela</small>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {tipoPrestamo === 'largo_plazo' && (
                            <>
                                <div className="calendario-container" style={{ marginTop: '20px' }}>
                                    <div className="form-group">
                                        <label>Fecha de Inicio *</label>
                                        <DatePicker
                                            selected={fechaInicio}
                                            onChange={(date) => setFechaInicio(date)}
                                            minDate={new Date()}
                                            dateFormat="dd/MM/yyyy"
                                            locale="es"
                                            className="calendario-input"
                                            placeholderText="Selecciona la fecha de inicio"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha de Término *</label>
                                        <DatePicker
                                            selected={fechaTermino}
                                            onChange={(date) => setFechaTermino(date)}
                                            minDate={fechaInicio || new Date()}
                                            dateFormat="dd/MM/yyyy"
                                            locale="es"
                                            className="calendario-input"
                                            placeholderText="Selecciona la fecha de término"
                                            required
                                        />
                                    </div>
                                </div>
                                {(!fechaInicio || !fechaTermino) && (
                                    <p className="warning-note" style={{ marginTop: '10px' }}>
                                        ⚠️ Debes especificar ambas fechas para préstamos a largo plazo
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Motivo de la solicitud */}
                    <div className="resumen-section info-adicional">
                        <h3>📝 Motivo de la Solicitud *</h3>
                        <p className="section-description">Por favor, indica el motivo por el cual necesitas este equipo</p>
                        <div className="form-group">
                            <textarea
                                id="motivo"
                                name="motivo"
                                value={formData.motivo}
                                onChange={handleInputChange}
                                placeholder="Ej: Necesito el notebook para realizar una presentación en la sala 205. Es parte de mi proyecto de título."
                                rows="6"
                                required
                            />
                            <span className="char-count">
                                {formData.motivo.length}/500 caracteres
                            </span>
                        </div>
                        <p className="info-note">
                            ℹ️ La fecha y hora de la solicitud se registrarán automáticamente al confirmar
                        </p>
                    </div>
                </div>

                <div className="step-actions">
                    <button className="btn-back" onClick={handleBack} disabled={isSubmitting}>
                        ← Volver
                    </button>
                    <button 
                        className="btn-submit" 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.motivo.trim()}
                    >
                        {isSubmitting ? 'Enviando...' : '✓ Confirmar Solicitud'}
                    </button>
                </div>
            </div>
        );
    };

    if (loadingSanciones) {
        return <div className="main-container"><div className="loading-message">Verificando estado de cuenta...</div></div>;
    }

    if (sancionesActivas.length > 0) {
        return (
            <div className="main-container">
                <div className="solicitud-header">
                    <h1>🚫 Acceso Restringido</h1>
                </div>
                <div className="step-content">
                    <div style={{
                        backgroundColor: '#fff3cd', 
                        color: '#856404', 
                        padding: '30px', 
                        borderRadius: '8px', 
                        border: '1px solid #ffeeba',
                        textAlign: 'center'
                    }}>
                        <h2 style={{color: '#856404', marginTop: 0}}>Cuenta con Sanciones Activas</h2>
                        <p style={{fontSize: '1.1em'}}>
                            No puedes realizar nuevas solicitudes de préstamo debido a que tienes sanciones vigentes en tu cuenta.
                        </p>
                        
                        <div style={{textAlign: 'left', marginTop: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '5px'}}>
                            <h3 style={{fontSize: '1em', marginBottom: '10px'}}>Detalle de Sanciones:</h3>
                            <ul style={{paddingLeft: '20px'}}>
                                {sancionesActivas.map(s => (
                                    <li key={s.ID} style={{marginBottom: '10px'}}>
                                        <strong>{s.penalizacion?.Descripcion}</strong>
                                        <br/>
                                        <span>Motivo: {s.Motivo_Obs}</span>
                                        <br/>
                                        <small className="text-danger">
                                            Vigente hasta: {new Date(s.Fecha_Fin).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button 
                            className="btn-back" 
                            onClick={() => navigate('/perfil')}
                            style={{marginTop: '20px'}}
                        >
                            Volver a Mi Perfil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div className="solicitud-header">
                <h1>✨ Generar Solicitud de Préstamo</h1>
            </div>

            {/* Indicador de pasos */}
            <div className="steps-indicator">
                <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Categoría</div>
                </div>
                <div className={`step-line ${currentStep > 1 ? 'completed' : ''}`}></div>
                <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">Equipo</div>
                </div>
                <div className={`step-line ${currentStep > 2 ? 'completed' : ''}`}></div>
                <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-label">Confirmar</div>
                </div>
            </div>

            {/* Contenido del paso actual */}
            <div className="steps-content">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </div>
        </div>
    );
};

export default GenerarSolicitud;
