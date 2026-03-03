import '@styles/popup.css';
import '@styles/modal.css';
import CloseIcon from '@assets/XIcon.svg';
import { useState, useEffect } from 'react';
import { getCarreras } from '@services/carrera.service.js';
import { getCargos } from '@services/cargo.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

export default function Popup({ show, setShow, data, action }) {
    const userData = data && data.length > 0 ? data[0] : {};
    
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        email: '',
        rut: '',
        codTipoUsuario: '',
        idCarrera: '',
        idCargo: '',
        descripcionCargo: ''
    });
    const [carreras, setCarreras] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [carrerasData, cargosData] = await Promise.all([
                    getCarreras(),
                    getCargos()
                ]);
                
                console.log('=== DEBUG Popup ===');
                console.log('carrerasData:', carrerasData);
                console.log('cargosData:', cargosData);
                
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
        
        if (show) {
            console.log('=== userData en Popup ===', userData);
            fetchData();
            
            // Extraer la descripción del cargo desde poseesCargos si existe
            const descripcionCargo = userData.poseesCargos?.[0]?.Descripcion_Cargo || '';
            
            // Inicializar formData con los datos del usuario
            setFormData({
                nombreCompleto: userData.nombreCompleto || '',
                email: userData.email || '',
                rut: userData.rut || '',
                codTipoUsuario: userData.codTipoUsuario || '',
                idCarrera: userData.idCarrera || userData.ID_Carrera || '',
                idCargo: userData.idCargo || userData.ID_Cargo || '',
                descripcionCargo: descripcionCargo
            });
            
            console.log('formData inicializado:', {
                nombreCompleto: userData.nombreCompleto || '',
                email: userData.email || '',
                rut: userData.rut || '',
                codTipoUsuario: userData.codTipoUsuario || '',
                idCarrera: userData.idCarrera || userData.ID_Carrera || '',
                idCargo: userData.idCargo || userData.ID_Cargo || '',
                descripcionCargo: descripcionCargo
            });
        }
    }, [show, userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'codTipoUsuario') {
            // Limpiar campos condicionales al cambiar tipo de usuario
            setFormData({
                ...formData,
                [name]: value,
                idCarrera: '',
                idCargo: '',
                descripcionCargo: ''
            });
        } else if (name === 'idCargo' && value !== '2') {
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

        try {
            await action(formData);
            setShow(false);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    // Determinar qué campos mostrar
    const codTipo = parseInt(formData.codTipoUsuario) || 0;
    const idCargoNum = parseInt(formData.idCargo) || 0;
    const esAlumno = codTipo === 2;
    const esProfesor = codTipo === 3;
    const esCargoOtro = idCargoNum === 2;
    
    console.log('=== Campos a mostrar ===');
    console.log('codTipoUsuario:', formData.codTipoUsuario, 'codTipo:', codTipo);
    console.log('esAlumno:', esAlumno, 'esProfesor:', esProfesor);
    console.log('idCargo:', formData.idCargo, 'esCargoOtro:', esCargoOtro);
    console.log('carreras disponibles:', carreras.length);
    console.log('cargos disponibles:', cargos.length);
    
    if (!show) return null;
    
    return (
        <div className="modal-overlay" onClick={() => setShow(false)}>
            <div className="modal-content popup" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Usuario</h2>
                    <button className="modal-close" onClick={() => setShow(false)}>✕</button>
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
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="ejemplo@gmail.cl"
                        />
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
                            title="El RUT no se puede modificar"
                        />
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
                        <button type="button" className="btn-cancel" onClick={() => setShow(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}