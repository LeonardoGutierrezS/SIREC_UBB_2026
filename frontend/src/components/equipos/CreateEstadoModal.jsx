import { useForm } from 'react-hook-form';
import '@styles/modal.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { createEstado } from '@services/catalogo.service.js';

const CreateEstadoModal = ({ show, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            // Transformar el campo Estado a Descripcion para el backend
            const estadoData = {
                Descripcion: data.Estado
            };
            
            const response = await createEstado(estadoData);
            
            if (response.status === 'Success') {
                showSuccessAlert('¡Estado creado!', 'El estado ha sido creado exitosamente.');
                reset();
                onSuccess();
                onClose();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo crear el estado');
            }
        } catch (error) {
            console.error('Error al crear estado:', error);
            showErrorAlert('Error', 'Ocurrió un error al crear el estado');
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
                    <h2>Crear Nuevo Estado</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-description">
                        <p>🔧 Ingresa el nombre del nuevo estado de condición de equipos.</p>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="Estado">Nombre del Estado *</label>
                        <input
                            type="text"
                            id="Estado"
                            placeholder="Ej: Nuevo, Bueno, En Reparación..."
                            autoComplete="chrome-off"
                            data-lpignore="true"
                            {...register('Estado', {
                                required: 'El nombre del estado es obligatorio',
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
                        {errors.Estado && <span className="error-message">{errors.Estado.message}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} className="btn-cancel">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            Crear Estado
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEstadoModal;
