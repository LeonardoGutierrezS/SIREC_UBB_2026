import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import '@styles/modal.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { updateEstado } from '@services/catalogo.service.js';

const EditEstadoModal = ({ show, onClose, onSuccess, estado }) => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

    useEffect(() => {
        if (estado) {
            setValue('Estado', estado.Descripcion);
        }
    }, [estado, setValue]);

    const onSubmit = async (data) => {
        try {
            // Transformar el campo Estado a Descripcion para el backend
            const estadoData = {
                Descripcion: data.Estado
            };
            
            const response = await updateEstado(estado.Cod_Estado, estadoData);
            
            if (response.status === 'Success') {
                reset();
                onClose();
                showSuccessAlert('¡Estado actualizado!', 'El estado ha sido actualizado exitosamente.');
                onSuccess();
            } else {
                reset();
                onClose();
                showErrorAlert('Error', response.message || 'No se pudo actualizar el estado');
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            reset();
            onClose();
            showErrorAlert('Error', 'Ocurrió un error al actualizar el estado');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!show || !estado) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Estado</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-description">
                        <p>🔧 Modifica el nombre del estado.</p>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="Estado">Nombre del Estado *</label>
                        <input
                            type="text"
                            id="Estado"
                            placeholder="Ej: Disponible, En uso, En reparación..."
                            autoComplete="chrome-off"
                            data-lpignore="true"
                            {...register('Estado', {
                                required: 'El nombre del estado es obligatorio',
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
                        {errors.Estado && (
                            <span className="error-message">{errors.Estado.message}</span>
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

export default EditEstadoModal;
