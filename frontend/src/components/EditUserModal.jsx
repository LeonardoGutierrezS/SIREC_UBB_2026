import { useState, useEffect } from 'react';
import { updateUser } from '@services/user.service.js';
import { getCarreras } from '@services/carrera.service.js';
import { getCargos } from '@services/cargo.service.js';
import { showErrorAlert, showSuccessAlert, showLoadingAlert, closeAlert } from '@helpers/sweetAlert.js';
import '@styles/modal.css';

const EditUserModal = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombreCompleto: user.Nombre_Completo || '',
        correo: user.Correo || '',
        rut: user.Rut || '',
        codTipoUsuario: user.Cod_TipoUsuario || user.tipoUsuario?.Cod_TipoUsuario || '',
        idCarrera: user.ID_Carrera || user.carrera?.ID_Carrera || '',
        idCargo: user.ID_Cargo || user.cargo?.ID_Cargo || '',
        descripcionCargo: user.poseesCargos?.[0]?.Descripcion_Cargo || '',
        vigente: user.Vigente
    });
    const [carreras, setCarreras] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [carrerasData, cargosData] = await Promise.all([
                getCarreras(),
                getCargos()
            ]);
            
            const carrerasArray = carrerasData?.data ? carrerasData.data : 
                                 Array.isArray(carrerasData) ? carrerasData : [];
            const cargosArray = cargosData?.data ? cargosData.data : 
                               Array.isArray(cargosData) ? cargosData : [];
            
            setCarreras(carrerasArray);
            setCargos(cargosArray);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setCarreras([]);
            setCargos([]);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'codTipoUsuario') {
            // Limpiar campos condicionales al cambiar tipo de usuario
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value,
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
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Mostrar modal de carga
        showLoadingAlert('Actualizando Usuario', 'Por favor espere mientras se guardan los cambios...');

        try {
            const userData = {
                nombreCompleto: formData.nombreCompleto,
                email: formData.correo,
                vigente: formData.vigente,
                codTipoUsuario: parseInt(formData.codTipoUsuario),
                idCarrera: formData.idCarrera && formData.idCarrera !== '' ? parseInt(formData.idCarrera) : null,
                idCargo: formData.idCargo && formData.idCargo !== '' ? parseInt(formData.idCargo) : null,
                descripcionCargo: formData.descripcionCargo || null
            };

            const response = await updateUser(userData, user.Rut);

            closeAlert(); // Cerrar el loading

            if (response && !response.error) {
                showSuccessAlert('¡Éxito!', 'Usuario actualizado correctamente');
                onSuccess();
            } else {
                showErrorAlert('Error', response.details?.message || response.message || 'Error al actualizar usuario');
            }
        } catch (error) {
            closeAlert(); // Cerrar el loading
            console.error('Error:', error);
            showErrorAlert('Error', 'No se pudo actualizar el usuario');
        } finally {
            setLoading(false);
        }
    };

    // Determinar qué campos mostrar
    const esAlumno = formData.codTipoUsuario === 2 || formData.codTipoUsuario === '2';
    const esProfesor = formData.codTipoUsuario === 3 || formData.codTipoUsuario === '3';
    const esCargoOtro = formData.idCargo === 3 || formData.idCargo === '3';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Usuario</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
                    <div className="form-group">
                        <label htmlFor="nombreCompleto">Nombre Completo *</label>
                        <input
                            type="text"
                            id="nombreCompleto"
                            name="nombreCompleto"
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
                    </div>

                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico *</label>
                        <input
                            type="text"
                            id="correo"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            disabled
                            placeholder="ejemplo@gmail.cl"
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                        <small style={{ color: '#666', fontSize: '0.85em' }}>El correo no se puede modificar</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="rut">RUT *</label>
                        <input
                            type="text"
                            id="rut"
                            name="rut"
                            value={formData.rut}
                            onChange={handleChange}
                            disabled
                            placeholder="12.345.678-9"
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                        <small style={{ color: '#666', fontSize: '0.85em' }}>El RUT no se puede modificar</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="codTipoUsuario">Tipo de Usuario *</label>
                        <select
                            id="codTipoUsuario"
                            name="codTipoUsuario"
                            value={formData.codTipoUsuario}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un tipo de usuario</option>
                            <option value="1">Administrador</option>
                            <option value="2">Alumno</option>
                            <option value="3">Profesor</option>
                        </select>
                    </div>

                    {esAlumno && (
                        <div className="form-group">
                            <label htmlFor="idCarrera">Carrera *</label>
                            <select
                                id="idCarrera"
                                name="idCarrera"
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
                        </div>
                    )}

                    {esProfesor && (
                        <>
                            <div className="form-group">
                                <label htmlFor="idCargo">Cargo *</label>
                                <select
                                    id="idCargo"
                                    name="idCargo"
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
                            </div>

                            {esCargoOtro && (
                                <div className="form-group">
                                    <label htmlFor="descripcionCargo">Descripción del Cargo</label>
                                    <input
                                        type="text"
                                        id="descripcionCargo"
                                        name="descripcionCargo"
                                        value={formData.descripcionCargo}
                                        onChange={handleChange}
                                        maxLength={255}
                                        placeholder="Ej: Jefe de Carrera, Coordinador de Laboratorio, etc."
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
