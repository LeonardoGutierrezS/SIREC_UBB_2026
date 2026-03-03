import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import '@styles/modal.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { updateMarca } from '@services/catalogo.service.js';

const EditMarcaModal = ({ show, onClose, onSuccess, marca }) => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

    useEffect(() => {
        if (marca) {
            setValue('Marca', marca.Descripcion);
        }
    }, [marca, setValue]);

    const onSubmit = async (data) => {
        try {
            // Transformar el campo Marca a Descripcion para el backend
            const marcaData = {
                Descripcion: data.Marca
            };
            
            console.log('Enviando actualización de marca:', {
                id: marca.ID_Marca,
                data: marcaData
            });
            
            const response = await updateMarca(marca.ID_Marca, marcaData);
            
            console.log('Respuesta del servidor:', response);
            
            if (response.status === 'Success') {
                showSuccessAlert('¡Marca actualizada!', 'La marca ha sido actualizada exitosamente.');
                reset();
                onSuccess();
                onClose();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo actualizar la marca');
            }
        } catch (error) {
            console.error('Error al actualizar marca:', error);
            showErrorAlert('Error', 'Ocurrió un error al actualizar la marca');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!show || !marca) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Marca</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-description">
                        <p>🏷️ Modifica el nombre de la marca.</p>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="Marca">Nombre de la Marca *</label>
                        <input
                            type="text"
                            id="Marca"
                            placeholder="Ej: HP, Dell, Lenovo..."
                            autoComplete="chrome-off"
                            data-lpignore="true"
                            {...register('Marca', {
                                required: 'El nombre de la marca es obligatorio',
                                minLength: {
                                    value: 2,
                                    message: 'El nombre debe tener al menos 2 caracteres'
                                },
                                maxLength: {
                                    value: 100,
                                    message: 'El nombre debe tener máximo 100 caracteres'
                                }
                            })}
                        />
                        {errors.Marca && <span className="error-message">{errors.Marca.message}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} className="btn-cancel">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            Actualizar Marca
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMarcaModal;
