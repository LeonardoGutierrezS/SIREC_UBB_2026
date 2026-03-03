import { useState } from 'react';
import { updateUser } from '@services/user.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { formatPostUpdate } from '@helpers/formatData.js';

const useEditUser = (setUsers) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [dataUser, setDataUser] = useState([]);
    
    const handleClickUpdate = () => {
        if (dataUser.length > 0) {
            setIsPopupOpen(true);
        }
    };

    const handleUpdate = async (updatedUserData) => {
        if (updatedUserData) {
            try {
                const response = await updateUser(updatedUserData, dataUser[0].rut);
                
                // Verificar si hay error en la respuesta
                if (response.status === 'Client error' || response.status === 'Server error') {
                    showErrorAlert('Error al actualizar usuario', response.details || response.message || 'No se pudo actualizar el usuario');
                    return;
                }
                
                // Si llegó aquí sin status de error, asumir éxito
                if (response.status === 'Success' && response.data) {
                    showSuccessAlert('¡Actualizado!','El usuario ha sido actualizado correctamente.');
                    setIsPopupOpen(false);
                    const formattedUser = formatPostUpdate(response.data);

                    setUsers(prevUsers => prevUsers.map(user => 
                        user.rut === formattedUser.rut ? formattedUser : user
                    ));

                    setDataUser([]);
                }
            } catch (error) {
                showErrorAlert('Error','Ocurrió un error al actualizar el usuario.');
            }
        }
    };

    return {
        handleClickUpdate,
        handleUpdate,
        isPopupOpen,
        setIsPopupOpen,
        dataUser,
        setDataUser
    };
};

export default useEditUser;