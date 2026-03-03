import { useForm } from 'react-hook-form';
import '@styles/modal.css';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { createMarca } from '@services/catalogo.service.js';

const CreateMarcaModal = ({ show, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            // Transformar el campo Marca a Descripcion para el backend
            const marcaData = {
                Descripcion: data.Marca
            };
            
            const response = await createMarca(marcaData);
            
            console.log('Response from createMarca:', response);
            
            if (response.status === 'Success') {
                showSuccessAlert('¡Marca creada!', 'La marca ha sido creada exitosamente.');
                reset();
                onSuccess();
                onClose();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo crear la marca');
            }
        } catch (error) {
            console.error('Error al crear marca:', error);
            showErrorAlert('Error', 'Ocurrió un error al crear la marca');
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
                    <h2>Crear Nueva Marca</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-description">
                        <p>🏷️ Ingresa el nombre de la nueva marca que deseas agregar al sistema.</p>
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
                                    value: 50,
                                    message: 'El nombre debe tener máximo 50 caracteres'
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
                            Crear Marca
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMarcaModal;
