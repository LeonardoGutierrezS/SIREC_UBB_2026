import axios from './root.service.js';

/**
 * Crear una nueva solicitud de préstamo
 */
export const createSolicitud = async (data) => {
  try {
    const response = await axios.post('/solicitud', data);
    return response.data;
  } catch (error) {
    console.error('Error creating solicitud:', error);
    return error.response?.data || { status: 'Error', message: 'Error al crear la solicitud' };
  }
};

/**
 * Obtener todas las solicitudes
 */
export const getSolicitudes = async () => {
  try {
    const response = await axios.get('/solicitud');
    return response.data;
  } catch (error) {
    console.error('Error fetching solicitudes:', error);
    return error.response?.data || { status: 'Error', message: 'Error al obtener solicitudes' };
  }
};

/**
 * Obtener solicitudes por usuario
 */
export const getMisSolicitudes = async () => {
  try {
    // El RUT se obtiene automáticamente del token JWT en el backend
    const response = await axios.get('/solicitud/mis-solicitudes');
    return response.data;
  } catch (error) {
    console.error('Error fetching mis solicitudes:', error);
    return error.response?.data || { status: 'Error', message: 'Error al obtener tus solicitudes' };
  }
};

/**
 * Obtener una solicitud por ID
 */
export const getSolicitud = async (idSolicitud) => {
  try {
    const response = await axios.get(`/solicitud/${idSolicitud}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching solicitud:', error);
    return error.response?.data || { status: 'Error', message: 'Error al obtener la solicitud' };
  }
};

/**
 * Eliminar una solicitud
 */
export const deleteSolicitud = async (idSolicitud) => {
  try {
    const response = await axios.delete(`/solicitud/${idSolicitud}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting solicitud:', error);
    return error.response?.data || { status: 'Error', message: 'Error al eliminar la solicitud' };
  }
};

/**
 * Descargar PDF de autorización de préstamo
 */
export const descargarPDFAutorizacion = async (idSolicitud) => {
  try {
    const response = await axios.get(`/solicitud/${idSolicitud}/pdf`, {
      responseType: 'blob', // Importante para archivos binarios
    });
    
    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `autorizacion-prestamo-${idSolicitud}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { status: 'Success', message: 'PDF descargado correctamente' };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return { status: 'Error', message: 'Error al descargar el PDF' };
  }
};

/**
 * Visualizar PDF de autorización
 */
export const visualizarPDFAutorizacion = async (idSolicitud) => {
  try {
    const response = await axios.get(`/solicitud/${idSolicitud}/pdf`, {
      responseType: 'blob',
    });
    return window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  } catch (error) {
    console.error('Error viewing PDF:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Marcar préstamo como entregado (Admin)
 */
export const entregarPrestamo = async (idPrestamo, tipoDocumento = null) => {
  try {
    const data = tipoDocumento ? { tipoDocumento } : {};
    const response = await axios.post(`/prestamo-acciones/${idPrestamo}/entregar`, data);
    return response.data;
  } catch (error) {
    console.error('Error al entregar préstamo:', error);
    return error.response?.data || { status: 'Error', message: 'Error al entregar el préstamo' };
  }
};

/**
 * Registrar devolución de préstamo (Admin)
 */
export const devolverPrestamo = async (idPrestamo, data) => {
  try {
    const response = await axios.post(`/prestamo-acciones/${idPrestamo}/devolver`, data);
    return response.data;
  } catch (error) {
    console.error('Error al registrar devolución:', error);
    return error.response?.data || { status: 'Error', message: 'Error al registrar la devolución' };
  }
};
