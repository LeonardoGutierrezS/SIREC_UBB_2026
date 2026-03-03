import axios from './root.service.js';

/**
 * Obtiene todos los cargos disponibles
 */
export async function getCargos() {
    try {
        const response = await axios.get('/cargo');
        return response.data;
    } catch (error) {
        console.error('Error al obtener cargos:', error);
        return { status: 'Error', data: [], message: 'Error al cargar los cargos' };
    }
}
