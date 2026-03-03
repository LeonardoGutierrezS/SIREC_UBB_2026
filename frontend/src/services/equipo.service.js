import axios from './root.service.js';

/**
 * Obtiene todos los equipos
 */
export async function getEquipos() {
  try {
    const { data } = await axios.get('/equipos');
    return data;
  } catch (error) {
    console.error('Error en getEquipos service:', error);
    console.error('Error response:', error.response);
    return error.response?.data || { state: 'Error', message: 'Error al obtener equipos' };
  }
}

/**
 * Obtiene un equipo por ID
 */
export async function getEquipo(id) {
  try {
    const { data } = await axios.get(`/equipos/${id}`);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al obtener equipo' };
  }
}

/**
 * Crea un nuevo equipo
 */
export async function createEquipo(equipoData) {
  try {
    const { data } = await axios.post('/equipos', equipoData);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al crear equipo' };
  }
}

/**
 * Actualiza un equipo
 */
export async function updateEquipo(id, equipoData) {
  try {
    const { data } = await axios.put(`/equipos/${id}`, equipoData);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al actualizar equipo' };
  }
}

/**
 * Elimina un equipo
 */
export async function deleteEquipo(id) {
  try {
    const { data } = await axios.delete(`/equipos/${id}`);
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al eliminar equipo' };
  }
}

/**
 * Obtiene equipos disponibles
 */
export async function getEquiposDisponibles() {
  try {
    const { data } = await axios.get('/equipos/disponibles');
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al obtener equipos disponibles' };
  }
}

/**
 * Cambia la disponibilidad de un equipo
 */
export async function cambiarDisponibilidadEquipo(id, disponible) {
  try {
    const { data } = await axios.patch(`/equipos/${id}/disponibilidad`, { disponible });
    return data;
  } catch (error) {
    return error.response?.data || { message: 'Error al cambiar disponibilidad' };
  }
}
