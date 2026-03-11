import { useState, useEffect } from 'react';
import { createUser } from '@services/user.service.js';
import { getCarreras } from '@services/carrera.service.js';
import { getCargos } from '@services/cargo.service.js';
import { showErrorAlert, showSuccessAlert, showLoadingAlert, closeAlert } from '@helpers/sweetAlert.js';
import { formatRut, validateRut, validateRutFormat } from '@helpers/rutFormatter.js';
import '@styles/modal.css';

const CreateUserModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        correo: '',
        rut: '',
        codTipoUsuario: '',
        idCarrera: '',
        idCargo: '',
        descripcionCargo: ''
    });
    const [carreras, setCarreras] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [carrerasData, cargosData] = await Promise.all([
                getCarreras(),
                getCargos()
            ]);
            
            console.log('=== DEBUG CreateUserModal ===');
            console.log('carrerasData:', carrerasData);
            console.log('cargosData:', cargosData);
            
            // Los datos pueden venir en response.data.data o directamente en response.data
            const carrerasArray = carrerasData?.data ? carrerasData.data : 
                                 Array.isArray(carrerasData) ? carrerasData : [];
            const cargosArray = cargosData?.data ? cargosData.data : 
                               Array.isArray(cargosData) ? cargosData : [];
            
            console.log('carrerasArray:', carrerasArray);
            console.log('cargosArray:', cargosArray);
            
            setCarreras(carrerasArray);
            setCargos(cargosArray);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setCarreras([]);
            setCargos([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si es el campo RUT, formatear automáticamente
        if (name === 'rut') {
            const formattedRut = formatRut(value);
            setFormData({
                ...formData,
                [name]: formattedRut
            });
        } else if (name === 'codTipoUsuario') {
            // Limpiar campos condicionales al cambiar tipo de usuario
            setFormData({
                ...formData,
                [name]: value,
                idCarrera: '',
                idCargo: '',
                descripcionCargo: ''
            });
        } else if (name === 'idCargo' && value !== '3') {
            // Limpiar descripción si cambia a un cargo diferente de "Otro"
            setFormData({
                ...formData,
                [name]: value,
                descripcionCargo: ''
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({}); 

        const newErrors = {};

        // 1. Validar Nombre Completo
        if (!formData.nombreCompleto) {
            newErrors.nombreCompleto = 'El nombre completo es obligatorio';
        } else if (formData.nombreCompleto.length < 15) {
            newErrors.nombreCompleto = 'El nombre completo debe tener al menos 15 caracteres';
        }

        // 2. Validar Correo Electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.(cl|com)$/;
        if (!formData.correo) {
            newErrors.correo = 'El correo electrónico es obligatorio';
        } else if (!emailRegex.test(formData.correo)) {
            newErrors.correo = 'Formato inválido. Debe contener "@" y terminar en ".cl" o ".com"';
        }

        // 3. Validar RUT
        if (!formData.rut) {
            newErrors.rut = 'El RUT es obligatorio';
        } else if (!validateRutFormat(formData.rut)) {
            newErrors.rut = 'Formato de RUT inválido (ej: 12.345.678-9)';
        } else if (!validateRut(formData.rut)) {
            newErrors.rut = 'El RUT ingresado no es válido (dígito verificador incorrecto)';
        }

        // 4. Validar Tipo de Usuario
        if (!formData.codTipoUsuario) {
            newErrors.codTipoUsuario = 'Debe seleccionar un tipo de usuario';
        }

        // 5. Validaciones condicionales
        if (formData.codTipoUsuario === '2') { // Alumno
            if (!formData.idCarrera) {
                newErrors.idCarrera = 'Debe seleccionar una carrera';
            }
        }

        if (formData.codTipoUsuario === '3') { // Profesor
            if (!formData.idCargo) {
                newErrors.idCargo = 'Debe seleccionar un cargo';
            } else if (formData.idCargo === '3' && !formData.descripcionCargo) { // Cargo "Otro"
                newErrors.descripcionCargo = 'Debe especificar el cargo';
            }
        }

        // Mostrar todos los errores acumulados
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        // Mostrar modal de carga
        showLoadingAlert('Creando Usuario', 'Por favor espere mientras se registra el usuario y se envían las credenciales...');

        try {
            const userData = {
                nombreCompleto: formData.nombreCompleto,
                email: formData.correo,
                rut: formData.rut,
                codTipoUsuario: parseInt(formData.codTipoUsuario),
                idCarrera: formData.idCarrera && formData.idCarrera !== '' ? parseInt(formData.idCarrera) : null,
                idCargo: formData.idCargo && formData.idCargo !== '' ? parseInt(formData.idCargo) : null,
                descripcionCargo: formData.descripcionCargo || null
            };

            const response = await createUser(userData);
            
            // closeAlert(); // Comentado para permitir que Swal reemplace el loading automáticamente

            if (response.status === 'Success') {
                await showSuccessAlert(
                    '¡Éxito!', 
                    'Usuario creado correctamente. Se ha generado una contraseña provisional y se ha enviado al correo del usuario.'
                );
                onSuccess();
            } else {
                // Manejar errores del servidor (pueden venir varios a la vez)
                if (response.details && typeof response.details === 'object') {
                    // Mapear el objeto de errores del servidor (ej: { rut: '...', email: '...' })
                    const serverErrors = {};
                    if (response.details.rut) serverErrors.rut = response.details.rut;
                    if (response.details.email) serverErrors.correo = response.details.email;
                    
                    if (Object.keys(serverErrors).length > 0) {
                        setErrors(serverErrors);
                    } else {
                        showErrorAlert('Error', response.message || 'Error al crear usuario');
                    }
                } else {
                    // Fallback para mensajes de texto plano
                    const serverMsg = typeof response.details === 'string' ? response.details : (response.message || '');
                    
                    if (serverMsg.toLowerCase().includes('rut')) {
                        setErrors({ rut: serverMsg });
                    } else if (serverMsg.toLowerCase().includes('correo') || serverMsg.toLowerCase().includes('email')) {
                        setErrors({ correo: serverMsg });
                    } else {
                        showErrorAlert('Error', serverMsg || 'Error al crear usuario');
                    }
                }
            }
        } catch (error) {
            // closeAlert(); // Comentado para permitir que Swal reemplace el loading
            console.error('Error:', error);
            showErrorAlert('Error', 'No se pudo crear el usuario');
        } finally {
            setLoading(false);
        }
    };

    // Determinar qué campos mostrar
    const esAlumno = formData.codTipoUsuario === '2';
    const esProfesor = formData.codTipoUsuario === '3';
    const esCargoOtro = formData.idCargo === '3'; // ID_Cargo = 3 es "Otro"

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Crear Nuevo Usuario</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form" autoComplete="off" noValidate>
                    <div className="form-group">
                        <label htmlFor="nombreCompleto">Nombre Completo *</label>
                        <input
                            type="text"
                            id="nombreCompleto"
                            name="nombreCompleto"
                            className={errors.nombreCompleto ? 'input-error' : ''}
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            required
                            minLength={15}
                            maxLength={50}
                            placeholder="Ej: Juan Pablo Pérez González"
                            autoComplete="chrome-off"
                            data-lpignore="true"
                            data-form-type="other"
                        />
                        {errors.nombreCompleto && <span className="error-text">⚠ {errors.nombreCompleto}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico *</label>
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            className={errors.correo ? 'input-error' : ''}
                            value={formData.correo}
                            onChange={handleChange}
                            required
                            placeholder="ejemplo@gmail.com"
                            autoComplete="chrome-off"
                            data-lpignore="true"
                        />
                        {errors.correo && <span className="error-text">⚠ {errors.correo}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="rut">RUT *</label>
                        <input
                            type="text"
                            id="rut"
                            name="rut"
                            className={errors.rut ? 'input-error' : ''}
                            value={formData.rut}
                            onChange={handleChange}
                            required
                            placeholder="12.345.678-9"
                        />
                        {errors.rut && <span className="error-text">⚠ {errors.rut}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="codTipoUsuario">Tipo de Usuario *</label>
                        <select
                            id="codTipoUsuario"
                            name="codTipoUsuario"
                            className={errors.codTipoUsuario ? 'input-error' : ''}
                            value={formData.codTipoUsuario}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un tipo de usuario</option>
                            <option value="1">Administrador</option>
                            <option value="2">Alumno</option>
                            <option value="3">Profesor</option>
                        </select>
                        {errors.codTipoUsuario && <span className="error-text">⚠ {errors.codTipoUsuario}</span>}
                    </div>

                    {esAlumno && (
                        <div className="form-group">
                            <label htmlFor="idCarrera">Carrera *</label>
                            <select
                                id="idCarrera"
                                name="idCarrera"
                                className={errors.idCarrera ? 'input-error' : ''}
                                value={formData.idCarrera}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione una carrera</option>
                                {carreras.map(carrera => (
                                    <option key={carrera.ID_Carrera} value={carrera.ID_Carrera}>
                                        {carrera.Nombre_Carrera}
                                    </option>
                                ))}
                            </select>
                            {errors.idCarrera && <span className="error-text">⚠ {errors.idCarrera}</span>}
                        </div>
                    )}

                    {esProfesor && (
                        <>
                            <div className="form-group">
                                <label htmlFor="idCargo">Cargo *</label>
                                <select
                                    id="idCargo"
                                    name="idCargo"
                                    className={errors.idCargo ? 'input-error' : ''}
                                    value={formData.idCargo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione un cargo</option>
                                    {cargos.map(cargo => (
                                        <option key={cargo.ID_Cargo} value={cargo.ID_Cargo}>
                                            {cargo.Desc_Cargo}
                                        </option>
                                    ))}
                                </select>
                                {errors.idCargo && <span className="error-text">⚠ {errors.idCargo}</span>}
                            </div>

                            {esCargoOtro && (
                                <div className="form-group">
                                    <label htmlFor="descripcionCargo">Descripción del Cargo *</label>
                                    <input
                                        type="text"
                                        id="descripcionCargo"
                                        name="descripcionCargo"
                                        className={errors.descripcionCargo ? 'input-error' : ''}
                                        value={formData.descripcionCargo}
                                        onChange={handleChange}
                                        maxLength={255}
                                        placeholder="Ej: Jefe de Carrera, Coordinador de Laboratorio, etc."
                                        autoComplete="chrome-off"
                                        data-lpignore="true"
                                    />
                                    {errors.descripcionCargo && <span className="error-text">⚠ {errors.descripcionCargo}</span>}
                                </div>
                            )}
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
