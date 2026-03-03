import { useState, useEffect } from 'react';
import { getPendingUsers, approveUser, rejectUser } from '@services/user.service.js';
import { showErrorAlert, showSuccessAlert, showLoadingAlert, closeAlert } from '@helpers/sweetAlert.js';
import Swal from 'sweetalert2';

const usePendingUsers = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await getPendingUsers();
            if (response.status === 'Success') {
                setPendingUsers(response.data);
            }
        } catch (error) {
            console.error('Error al obtener usuarios pendientes:', error);
            showErrorAlert('Error', 'No se pudieron cargar los usuarios pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (rut) => {
        try {
            // Mostrar mensaje de carga
            showLoadingAlert('Procesando...', 'Aprobando usuario y enviando correo de confirmación');

            const response = await approveUser(rut);
            
            closeAlert(); // Cerrar el loading
            
            if (response.status === 'Success') {
                showSuccessAlert('¡Aprobado!', 'Usuario aprobado correctamente. Se ha enviado un correo de confirmación.');
                fetchPendingUsers(); // Recargar lista
            } else {
                showErrorAlert('Error', response.details?.message || 'Error al aprobar usuario');
            }
        } catch (error) {
            closeAlert(); // Cerrar el loading en caso de error
            console.error('Error al aprobar usuario:', error);
            showErrorAlert('Error', 'No se pudo aprobar el usuario');
        }
    };

    const handleReject = async (rut) => {
        try {
            // Pedir motivo de rechazo con SweetAlert
            const { value: motivo, isDismissed } = await Swal.fire({
                title: 'Motivo de Rechazo',
                html: '<p style="margin-bottom: 15px;">Por favor, indica el motivo por el cual se rechaza este registro:</p>',
                input: 'textarea',
                inputPlaceholder: 'Escribe el motivo del rechazo aquí...',
                inputAttributes: {
                    'aria-label': 'Motivo de rechazo',
                    style: 'min-height: 100px;'
                },
                showCancelButton: true,
                confirmButtonText: 'Rechazar Usuario',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                inputValidator: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Debes ingresar un motivo de rechazo';
                    }
                    if (value.trim().length < 10) {
                        return 'El motivo debe tener al menos 10 caracteres';
                    }
                }
            });

            // Si el usuario canceló o cerró el diálogo
            if (isDismissed) {
                return;
            }

            // Si se ingresó un motivo, proceder con el rechazo
            if (motivo) {
                // Mostrar loading mientras se procesa el rechazo
                showLoadingAlert('Procesando...', 'Rechazando usuario y enviando notificación...');
                
                try {
                    const response = await rejectUser(rut, motivo.trim());
                    
                    closeAlert();

                    if (response.status === 'Success') {
                    showSuccessAlert('Rechazado', 'Usuario rechazado correctamente. Se ha enviado un correo con el motivo.');
                    fetchPendingUsers(); // Recargar lista
                } else {
                    showErrorAlert('Error', response.details?.message || 'Error al rechazar usuario');
                }
                } catch (error) {
                    closeAlert(); 
                    console.error('Error al rechazar usuario (interno):', error);
                    showErrorAlert('Error', 'Error al procesar el rechazo');
                }
            }
        } catch (error) {
            console.error('Error al rechazar usuario:', error);
            showErrorAlert('Error', 'No se pudo rechazar el usuario');
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    return {
        pendingUsers,
        loading,
        handleApprove,
        handleReject,
        fetchPendingUsers
    };
};

export default usePendingUsers;
