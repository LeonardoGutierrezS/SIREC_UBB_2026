import axios from './root.service.js';
import { formatUserData } from '@helpers/formatData.js';

export async function getUsers() {
    try {
        const { data } = await axios.get('/user/');
        const formattedData = data.data.map(formatUserData);
        return formattedData;
    } catch (error) {
        return error.response.data;
    }
}

export async function getAllUsers() {
    try {
        const response = await axios.get('/user/all');
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al obtener usuarios' };
    }
}

export async function getPendingUsers() {
    try {
        const response = await axios.get('/user/pending');
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al obtener usuarios pendientes' };
    }
}

export async function approveUser(rut) {
    try {
        const response = await axios.patch(`/user/${rut}/approve`);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al aprobar usuario' };
    }
}

export async function rejectUser(rut, motivo) {
    try {
        const response = await axios.delete(`/user/${rut}/reject`, {
            data: { motivo }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al rechazar usuario' };
    }
}

export async function updateUserStatus(rut, vigente) {
    try {
        const response = await axios.patch(`/user/${rut}/status`, { vigente });
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al actualizar estado' };
    }
}

export async function createUser(userData) {
    try {
        const response = await axios.post('/user/create', userData);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al crear usuario' };
    }
}

export async function updateUser(data, rut) {
    try {
        const response = await axios.patch(`/user/detail/?rut=${rut}`, data);
        return response.data;
    } catch (error) {
        // Si hay error de validación del servidor, devolverlo
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return { status: 'Error', message: 'Error al actualizar usuario' };
    }
}

export async function deleteUser(rut) {
    try {
        const response = await axios.delete(`/user/detail/?rut=${rut}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}