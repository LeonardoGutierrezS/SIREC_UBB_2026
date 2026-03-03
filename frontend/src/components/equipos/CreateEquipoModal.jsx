import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import '@styles/modal.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { createEquipo } from '@services/equipo.service.js';
import { getMarcas, getCategorias, getEstados } from '@services/catalogo.service.js';

const CreateEquipoModal = ({ show, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNotebook, setIsNotebook] = useState(false);

    // Observar cambios en la categoría seleccionada
    const selectedCategoria = watch('ID_Categoria');

    useEffect(() => {
        if (show) {
            fetchCatalogos();
        }
    }, [show]);

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

    const onSubmit = async (data) => {
        try {
            const equipoData = {
                ID_Num_Inv: data.ID_Num_Inv,
                Modelo: data.Modelo,
                Numero_Serie: data.Numero_Serie,
                Comentarios: data.Comentarios || null,
                Disponible: data.Disponible === 'true',
                ID_Marca: parseInt(data.ID_Marca),
                ID_Categoria: parseInt(data.ID_Categoria),
                ID_Estado: parseInt(data.ID_Estado)
            };

            // Si es Notebook, agregar especificaciones
            if (isNotebook) {
                equipoData.especificaciones = {
                    Procesador: data.Procesador?.trim() || null,
                    RAM: data.RAM?.trim() || null,
                    Almacenamiento: data.Almacenamiento?.trim() || null
                };
            }

            const response = await createEquipo(equipoData);
            
            if (response.status === 'Success') {
                showSuccessAlert('¡Equipo creado!', 'El equipo ha sido creado exitosamente.');
                reset();
                onSuccess();
                onClose();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo crear el equipo');
            }
        } catch (error) {
            console.error('Error al crear equipo:', error);
            showErrorAlert('Error', 'Ocurrió un error al crear el equipo');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><span>➕</span> Crear Nuevo Equipo</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                {loading ? (
                    <div className="loading-message">
                        <p>Cargando catálogos...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ID_Num_Inv">🏷️ Número de Inventario *</label>
                                <input
                                    type="text"
                                    id="ID_Num_Inv"
                                    placeholder="Ej: NB-2024-001"
                                    autoComplete="off"
                                    {...register('ID_Num_Inv', {
                                        required: 'El número de inventario es obligatorio',
                                        minLength: { value: 3, message: 'Debe tener al menos 3 caracteres' },
                                        maxLength: { value: 50, message: 'Debe tener máximo 50 caracteres' }
                                    })}
                                />
                                {errors.ID_Num_Inv && <span className="error-message">{errors.ID_Num_Inv.message}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="Numero_Serie">🔢 Número de Serie *</label>
                                <input
                                    type="text"
                                    id="Numero_Serie"
                                    placeholder="Ej: 5CD1234ABC"
                                    autoComplete="off"
                                    {...register('Numero_Serie', {
                                        required: 'El número de serie es obligatorio',
                                        minLength: { value: 5, message: 'Debe tener al menos 5 caracteres' },
                                        maxLength: { value: 100, message: 'Debe tener máximo 100 caracteres' }
                                    })}
                                />
                                {errors.Numero_Serie && <span className="error-message">{errors.Numero_Serie.message}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="Modelo">💻 Modelo del Equipo *</label>
                            <input
                                type="text"
                                id="Modelo"
                                placeholder="Ej: HP Pavilion 15"
                                autoComplete="off"
                                {...register('Modelo', {
                                    required: 'El modelo es obligatorio',
                                    minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' },
                                    maxLength: { value: 100, message: 'Debe tener máximo 100 caracteres' }
                                })}
                            />
                            {errors.Modelo && <span className="error-message">{errors.Modelo.message}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ID_Marca">🏢 Marca *</label>
                                <select id="ID_Marca" {...register('ID_Marca', { required: 'La marca es obligatoria' })}>
                                    <option value="">Seleccione marca</option>
                                    {marcas.map((marca) => (
                                        <option key={marca.ID_Marca} value={marca.ID_Marca}>{marca.Descripcion}</option>
                                    ))}
                                </select>
                                {errors.ID_Marca && <span className="error-message">{errors.ID_Marca.message}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="ID_Categoria">📁 Categoría *</label>
                                <select id="ID_Categoria" {...register('ID_Categoria', { required: 'La categoría es obligatoria' })}>
                                    <option value="">Seleccione categoría</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>{categoria.Descripcion}</option>
                                    ))}
                                </select>
                                {errors.ID_Categoria && <span className="error-message">{errors.ID_Categoria.message}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ID_Estado">🛠️ Estado inicial *</label>
                                <select id="ID_Estado" {...register('ID_Estado', { required: 'El estado es obligatorio' })}>
                                    <option value="">Seleccione estado</option>
                                    {estados.map((estado) => (
                                        <option key={estado.Cod_Estado} value={estado.Cod_Estado}>{estado.Descripcion}</option>
                                    ))}
                                </select>
                                {errors.ID_Estado && <span className="error-message">{errors.ID_Estado.message}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="Disponible">✅ Disponibilidad *</label>
                                <select id="Disponible" defaultValue="true" {...register('Disponible')}>
                                    <option value="true">SÍ (Disponible para préstamo)</option>
                                    <option value="false">NO (No disponible)</option>
                                </select>
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
                                            placeholder="Ej: Intel Core i5-10210U"
                                            {...register('Procesador', { maxLength: { value: 200, message: 'Máximo 200 caracteres' } })}
                                        />
                                        {errors.Procesador && <span className="error-message">{errors.Procesador.message}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="RAM">🧠 Memoria RAM</label>
                                        <input
                                            type="text"
                                            id="RAM"
                                            placeholder="Ej: 8GB DDR4"
                                            {...register('RAM', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
                                        />
                                        {errors.RAM && <span className="error-message">{errors.RAM.message}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="Almacenamiento">💾 Almacenamiento</label>
                                    <input
                                        type="text"
                                        id="Almacenamiento"
                                        placeholder="Ej: 256GB SSD"
                                        {...register('Almacenamiento', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
                                    />
                                    {errors.Almacenamiento && <span className="error-message">{errors.Almacenamiento.message}</span>}
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn-cancel">
                                Cancelar
                            </button>
                            <button type="submit" className="btn-submit">
                                ✨ Crear Equipo
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateEquipoModal;
