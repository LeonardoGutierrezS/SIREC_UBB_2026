import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import '@styles/modal.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { updateCategoria } from '@services/catalogo.service.js';

const EditCategoriaModal = ({ show, onClose, onSuccess, categoria }) => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

    useEffect(() => {
        if (categoria) {
            setValue('Categoria', categoria.Descripcion);
        }
    }, [categoria, setValue]);

    const onSubmit = async (data) => {
        try {
            // Transformar el campo Categoria a Descripcion para el backend
            const categoriaData = {
                Descripcion: data.Categoria
            };
            
            const response = await updateCategoria(categoria.ID_Categoria, categoriaData);
            
            if (response.status === 'Success') {
                reset();
                onClose();
                showSuccessAlert('¡Categoría actualizada!', 'La categoría ha sido actualizada exitosamente.');
                onSuccess();
            } else {
                reset();
                onClose();
                showErrorAlert('Error', response.message || 'No se pudo actualizar la categoría');
            }
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            reset();
            onClose();
            showErrorAlert('Error', 'Ocurrió un error al actualizar la categoría');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!show || !categoria) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Categoría</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-description">
                        <p>📦 Modifica el nombre de la categoría.</p>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="Categoria">Nombre de la Categoría *</label>
                        <input
                            type="text"
                            id="Categoria"
                            placeholder="Ej: Notebook, Desktop, Monitor..."
                            autoComplete="chrome-off"
                            data-lpignore="true"
                            {...register('Categoria', {
                                required: 'El nombre de la categoría es obligatorio',
                                minLength: {
                                    value: 2,
                                    message: 'El nombre debe tener al menos 2 caracteres'
                                },
                                maxLength: {
                                    value: 100,
                                    message: 'El nombre no puede exceder los 100 caracteres'
                                }
                            })}
                        />
                        {errors.Categoria && (
                            <span className="error-message">{errors.Categoria.message}</span>
                        )}
                    </div>

                    <div className="modal-buttons">
                        <button type="button" className="btn-cancel" onClick={handleClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            💾 Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCategoriaModal;
