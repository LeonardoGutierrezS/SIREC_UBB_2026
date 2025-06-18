import axios from './root.service.js';

// Puedes agregar un helper para formatear datos si lo necesitas
// import { formatEquipoData } from '@helpers/formatData.js';

export async function getEquipos() {
    try {
        const { data } = await axios.get('/equipo/');
        // Si necesitas formatear los datos, descomenta la siguiente línea:
        // const formattedData = data.data.map(formatEquipoData);
        // return formattedData;
        return data;
    } catch (error) {
        return error.response?.data || { error: 'Error al obtener equipos' };
    }
}

export async function createEquipo(equipoData) {
    try {
        const response = await axios.post('/equipo/', equipoData);
        return response.data;
    } catch (error) {
        return error.response?.data || { error: 'Error al crear equipo' };
    }
}

export async function updateEquipo(id, equipoData) {
    try {
        const response = await axios.patch(`/equipo/${id}`, equipoData);
        return response.data;
    } catch (error) {
        return error.response?.data || { error: 'Error al actualizar equipo' };
    }
}

export async function deleteEquipo(id) {
    try {
        const response = await axios.delete(`/equipo/${id}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { error: 'Error al eliminar equipo' };
    }
}