import axios from './root.service.js';

/**
 * Aprobar una solicitud y crear préstamo
 */
export const aprobarSolicitud = async (data) => {
  try {
    const response = await axios.post('/autorizacion/aprobar', data);
    return response.data;
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    return error.response?.data || { status: 'Error', message: 'Error al aprobar la solicitud' };
  }
};

/**
 * Rechazar una solicitud
 */
export const rechazarSolicitud = async (data) => {
  try {
    const response = await axios.post('/autorizacion/rechazar', data);
    return response.data;
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    return error.response?.data || { status: 'Error', message: 'Error al rechazar la solicitud' };
  }
};

/**
 * Obtener todas las autorizaciones
 */
export const getAutorizaciones = async () => {
  try {
    const response = await axios.get('/autorizacion');
    return response.data;
  } catch (error) {
    console.error('Error al obtener autorizaciones:', error);
    return error.response?.data || { status: 'Error', message: 'Error al obtener autorizaciones' };
  }
};
