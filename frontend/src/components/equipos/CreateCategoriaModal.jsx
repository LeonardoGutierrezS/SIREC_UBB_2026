import { useForm } from 'react-hook-form';
import '@styles/modal.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { createCategoria } from '@services/catalogo.service.js';

const CreateCategoriaModal = ({ show, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await createCategoria(data);
            
            if (response.status === 'Success') {
                showSuccessAlert('¡Categoría creada!', 'La categoría ha sido creada exitosamente.');
                reset();
                onSuccess();
                onClose();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo crear la categoría');
            }
        } catch (error) {
            console.error('Error al crear categoría:', error);
            showErrorAlert('Error', 'Ocurrió un error al crear la categoría');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Crear Nueva Categoría</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-description">
                        <p>📦 Ingresa el nombre de la nueva categoría de equipos.</p>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="Categoria">Nombre de la Categoría *</label>
                        <input
                            type="text"
                            id="Categoria"
                            placeholder="Ej: Notebook, Proyector, Impresora..."
                            autoComplete="chrome-off"
                            data-lpignore="true"
                            {...register('Descripcion', {
                                required: 'El nombre de la categoría es obligatorio',
                                minLength: {
                                    value: 2,
                                    message: 'El nombre debe tener al menos 2 caracteres'
                                },
                                maxLength: {
                                    value: 50,
                                    message: 'El nombre debe tener máximo 50 caracteres'
                                }
                            })}
                        />
                        {errors.Descripcion && <span className="error-message">{errors.Descripcion.message}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} className="btn-cancel">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            Crear Categoría
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCategoriaModal;
