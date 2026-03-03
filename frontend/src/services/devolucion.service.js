import axios from './root.service.js';

/**
 * Registrar una devolución
 */
export const registrarDevolucion = async (data) => {
  try {
    const response = await axios.post('/devolucion', data);
    return response.data;
  } catch (error) {
    console.error('Error al registrar devolución:', error);
    return error.response?.data || { status: 'Error', message: 'Error al registrar la devolución' };
  }
};

/**
 * Obtener todas las devoluciones
 */
export const getDevoluciones = async () => {
  try {
    const response = await axios.get('/devolucion');
    return response.data;
  } catch (error) {
    console.error('Error al obtener devoluciones:', error);
    return error.response?.data || { status: 'Error', message: 'Error al obtener devoluciones' };
  }
};

/**
 * Obtener devoluciones por usuario
 */
export const getDevolucionesPorUsuario = async (rut) => {
  try {
    const response = await axios.get(`/devolucion/usuario/${rut}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener devoluciones por usuario:', error);
    return error.response?.data || { status: 'Error', message: 'Error al obtener devoluciones' };
  }
};
