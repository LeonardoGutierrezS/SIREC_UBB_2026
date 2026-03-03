import { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus, createUser } from '@services/user.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useAllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        tipoUsuario: '',
        vigente: ''
    });

    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            if (response.status === 'Success') {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            showErrorAlert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (rut, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            const response = await updateUserStatus(rut, newStatus);
            if (response.status === 'Success') {
                showSuccessAlert(
                    newStatus ? '¡Activado!' : '¡Desactivado!', 
                    `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`
                );
                fetchAllUsers(); // Recargar lista
            } else {
                showErrorAlert('Error', response.details?.message || 'Error al actualizar usuario');
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            showErrorAlert('Error', 'No se pudo actualizar el estado del usuario');
        }
    };

    const handleCreateUser = async (userData) => {
        try {
            const response = await createUser(userData);
            if (response.status === 'Success') {
                showSuccessAlert('¡Creado!', 'Usuario creado correctamente');
                fetchAllUsers(); // Recargar lista
                return true;
            } else {
                showErrorAlert('Error', response.details?.message || 'Error al crear usuario');
                return false;
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            showErrorAlert('Error', 'No se pudo crear el usuario');
            return false;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchSearch = !filters.search || 
            user.Nombre_Completo?.toLowerCase().includes(filters.search.toLowerCase()) ||
            user.Correo?.toLowerCase().includes(filters.search.toLowerCase()) ||
            user.Rut?.includes(filters.search);
        
        const matchTipoUsuario = !filters.tipoUsuario || user.tipoUsuario?.Descripcion === filters.tipoUsuario;
        
        const matchVigente = filters.vigente === '' || 
            (filters.vigente === 'true' && user.Vigente) ||
            (filters.vigente === 'false' && !user.Vigente);

        return matchSearch && matchTipoUsuario && matchVigente;
    });

    useEffect(() => {
        fetchAllUsers();
    }, []);

    return {
        users: filteredUsers,
        loading,
        filters,
        setFilters,
        handleDeactivate,
        handleCreateUser,
        fetchAllUsers
    };
};

export default useAllUsers;
