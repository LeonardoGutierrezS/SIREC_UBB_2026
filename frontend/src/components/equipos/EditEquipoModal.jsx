import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import '@styles/modal.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { updateEquipo } from '@services/equipo.service.js';
import { createMarca, getMarcas, getCategorias, getEstados } from '@services/catalogo.service.js';
import { Controller } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';

const EditEquipoModal = ({ show, onClose, onSuccess, equipo }) => {
    const { register, handleSubmit, formState: { errors }, reset, watch, control, setValue } = useForm();
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNotebook, setIsNotebook] = useState(false);

    const [isOnLoan, setIsOnLoan] = useState(false);

    // Observar cambios en la categoría seleccionada
    const selectedCategoria = watch('ID_Categoria');

    useEffect(() => {
        if (show) {
            fetchCatalogos();
        }
    }, [show]);

    // Cargar datos del equipo en el formulario
    useEffect(() => {
        if (equipo && marcas.length > 0 && categorias.length > 0 && estados.length > 0) {
            setValue('Modelo', equipo.Modelo);
            setValue('Numero_Serie', equipo.Numero_Serie);
            setValue('Comentarios', equipo.Comentarios || '');
            setValue('ID_Marca', equipo.ID_Marca || equipo.marca?.ID_Marca);
            setValue('ID_Categoria', equipo.ID_Categoria || equipo.categoria?.ID_Categoria);
            setValue('ID_Estado', equipo.ID_Estado || equipo.estado?.Cod_Estado);

            setIsOnLoan(equipo.estado?.Descripcion === "En Préstamo");

            // Cargar especificaciones si existen
            if (equipo.especificaciones && Array.isArray(equipo.especificaciones)) {
                const proc = equipo.especificaciones.find(s => s.Tipo_Especificacion_HW === 'Procesador')?.Descripcion;
                const ram = equipo.especificaciones.find(s => s.Tipo_Especificacion_HW === 'RAM')?.Descripcion;
                const alm = equipo.especificaciones.find(s => s.Tipo_Especificacion_HW === 'Almacenamiento')?.Descripcion;
                
                if (proc) setValue('Procesador', proc);
                if (ram) setValue('RAM', ram);
                if (alm) setValue('Almacenamiento', alm);
            }
        }
    }, [equipo, marcas, categorias, estados, setValue]);

    // Detectar si la categoría seleccionada es "Notebook"
    useEffect(() => {
        if (selectedCategoria && categorias.length > 0) {
            const categoriaSeleccionada = categorias.find(
                cat => cat.ID_Categoria === parseInt(selectedCategoria)
            );
            setIsNotebook(categoriaSeleccionada?.Descripcion === 'Notebook');
        } else {
            setIsNotebook(false);
        }
    }, [selectedCategoria, categorias]);

    const fetchCatalogos = async () => {
        try {
            setLoading(true);
            const [marcasResponse, categoriasResponse, estadosResponse] = await Promise.all([
                getMarcas(),
                getCategorias(),
                getEstados()
            ]);

            setMarcas(marcasResponse.data || []);
            setCategorias(categoriasResponse.data || []);
            setEstados(estadosResponse.data || []);
        } catch (error) {
            console.error('Error al cargar catálogos:', error);
            showErrorAlert('Error', 'No se pudieron cargar los catálogos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMarca = async (inputValue) => {
        try {
            setLoading(true);
            const response = await createMarca({ Descripcion: inputValue });
            if (response.status === 'Success') {
                const newMarca = response.data;
                setMarcas(prev => [...prev, newMarca]);
                setValue('ID_Marca', newMarca.ID_Marca, { shouldValidate: true });
                showSuccessAlert('Marca Creada', `La marca "${inputValue}" fue creada y seleccionada.`);
            } else {
                showErrorAlert('Error', response.message || 'No se pudo crear la marca');
            }
        } catch (error) {
            console.error('Error al crear marca dinámicamente:', error);
            showErrorAlert('Error', 'Error de red al intentar crear la marca');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const selectedEstado = estados.find(e => e.Cod_Estado === parseInt(data.ID_Estado));
            const isDisponible = selectedEstado ? selectedEstado.Descripcion === 'Disponible' : false;

            const equipoData = {
                Modelo: data.Modelo,
                Numero_Serie: data.Numero_Serie,
                Comentarios: data.Comentarios || null,
                Disponible: isDisponible,
                ID_Marca: parseInt(data.ID_Marca),
                ID_Categoria: parseInt(data.ID_Categoria),
                ID_Estado: parseInt(data.ID_Estado)
            };

            // Si es Notebook, agregar especificaciones
            if (isNotebook && !isOnLoan) {
                equipoData.especificaciones = {
                    Procesador: data.Procesador?.trim() || null,
                    RAM: data.RAM?.trim() || null,
                    Almacenamiento: data.Almacenamiento?.trim() || null
                };
            }

            const response = await updateEquipo(equipo.ID_Num_Inv, equipoData);
            
            if (response.status === 'Success') {
                showSuccessAlert('¡Equipo actualizado!', 'El equipo ha sido actualizado exitosamente.');
                reset();
                onSuccess();
                onClose();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo actualizar el equipo');
            }
        } catch (error) {
            console.error('Error al actualizar equipo:', error);
            showErrorAlert('Error', 'Ocurrió un error al actualizar el equipo');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!show || !equipo) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><span>✏️</span> Editar Equipo: {equipo.ID_Num_Inv}</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                {isOnLoan && (
                    <div className="alert-warning" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', color: '#856404' }}>
                        ⚠️ Este equipo se encuentra <strong>En Préstamo</strong>. La edición de sus características principales está deshabilitada.
                    </div>
                )}

                {loading ? (
                    <div className="loading-message">
                        <p>Cargando catálogos...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label htmlFor="Modelo">💻 Modelo del Equipo *</label>
                            <input
                                type="text"
                                id="Modelo"
                                placeholder="Ej: HP Pavilion 15"
                                autoComplete="off"
                                disabled={isOnLoan}
                                {...register('Modelo', {
                                    required: isOnLoan ? false : 'El modelo es obligatorio',
                                    minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                                    maxLength: { value: 100, message: 'Debe tener máximo 100 caracteres' }
                                })}
                            />
                            {errors.Modelo && <span className="error-message">{errors.Modelo.message}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="Numero_Serie">🔢 Número de Serie *</label>
                            <input
                                type="text"
                                id="Numero_Serie"
                                placeholder="Ej: 5CD1234ABC"
                                autoComplete="off"
                                disabled={isOnLoan}
                                {...register('Numero_Serie', {
                                    required: isOnLoan ? false : 'El número de serie es obligatorio',
                                    minLength: { value: 5, message: 'Debe tener al menos 5 caracteres' },
                                    maxLength: { value: 100, message: 'Debe tener máximo 100 caracteres' }
                                })}
                            />
                            {errors.Numero_Serie && <span className="error-message">{errors.Numero_Serie.message}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ID_Marca">🏢 Marca *</label>
                                <Controller
                                    name="ID_Marca"
                                    control={control}
                                    rules={{ required: isOnLoan ? false : 'La marca es obligatoria' }}
                                    render={({ field }) => {
                                        const marcaOptions = marcas.map(m => ({ value: m.ID_Marca, label: m.Descripcion }));
                                        return (
                                            <CreatableSelect
                                                isClearable
                                                isDisabled={loading || isOnLoan}
                                                isLoading={loading}
                                                onChange={(newValue) => field.onChange(newValue ? newValue.value : '')}
                                                onCreateOption={handleCreateMarca}
                                                options={marcaOptions}
                                                value={marcaOptions.find(c => c.value === field.value) || null}
                                                placeholder="Seleccione o escriba..."
                                                formatCreateLabel={(inputValue) => `Crear marca "${inputValue}"`}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />
                                        );
                                    }}
                                />
                                {errors.ID_Marca && <span className="error-message">{errors.ID_Marca.message}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="ID_Categoria">📁 Categoría *</label>
                                <select id="ID_Categoria" disabled={isOnLoan} {...register('ID_Categoria', { required: isOnLoan ? false : 'La categoría es obligatoria' })}>
                                    <option value="">Seleccione categoría</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>{categoria.Descripcion}</option>
                                    ))}
                                </select>
                                {errors.ID_Categoria && <span className="error-message">{errors.ID_Categoria.message}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ width: '100%' }}>
                                <label htmlFor="ID_Estado">🛠️ Estado actual *</label>
                                <select id="ID_Estado" {...register('ID_Estado', { required: 'El estado es obligatorio' })}>
                                    <option value="">Seleccione estado</option>
                                    {estados.map((estado) => (
                                        <option key={estado.Cod_Estado} value={estado.Cod_Estado}>{estado.Descripcion}</option>
                                    ))}
                                </select>
                                {errors.ID_Estado && <span className="error-message">{errors.ID_Estado.message}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="Comentarios">📝 Comentarios adicionales</label>
                            <textarea
                                id="Comentarios"
                                rows="3"
                                placeholder="Escribe aquí cualquier observación o detalle importante..."
                                {...register('Comentarios', { maxLength: { value: 500, message: 'Máximo 500 caracteres' } })}
                            />
                            {errors.Comentarios && <span className="error-message">{errors.Comentarios.message}</span>}
                        </div>

                        {isNotebook && (
                            <div className="notebook-specs">
                                <h3 className="specs-title"><span>⚙️</span> Especificaciones Técnicas (Notebook)</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="Procesador">⚡ Procesador</label>
                                        <input
                                            type="text"
                                            id="Procesador"
                                            placeholder="Ej: Intel Core i5"
                                            disabled={isOnLoan}
                                            {...register('Procesador', { maxLength: { value: 200, message: 'Máximo 200 caracteres' } })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="RAM">🧠 Memoria RAM</label>
                                        <input
                                            type="text"
                                            id="RAM"
                                            placeholder="Ej: 8GB DDR4"
                                            disabled={isOnLoan}
                                            {...register('RAM', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Almacenamiento">💾 Almacenamiento</label>
                                    <input
                                        type="text"
                                        id="Almacenamiento"
                                        placeholder="Ej: 256GB SSD"
                                        disabled={isOnLoan}
                                        {...register('Almacenamiento', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">Cancelar</button>
                            <button type="submit" className="btn-submit">💾 Guardar Cambios</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditEquipoModal;
