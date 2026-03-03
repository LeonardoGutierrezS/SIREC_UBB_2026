import axios from './root.service.js';

/**
 * Obtiene todas las carreras disponibles para el registro
 */
export async function getCarreras() {
    try {
        const response = await axios.get('/carrera');
        return response.data;
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        return { status: 'Error', data: [], message: 'Error al cargar las carreras' };
    }
}
