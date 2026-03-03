import axios from './root.service.js';

/**
 * Obtiene todos los préstamos
 */
export async function getPrestamos() {
  try {
    const { data } = await axios.get('/prestamo');
    return data;
  } catch (error) {
    console.error('Error en getPrestamos service:', error);
    return error.response?.data || { status: 'Error', message: 'Error al obtener préstamos' };
  }
}

/**
 * Obtiene un préstamo por ID
 */
export async function getPrestamo(id) {
  try {
    const { data } = await axios.get(`/prestamo/${id}`);
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al obtener préstamo' };
  }
}

/**
 * Obtiene préstamos por estado
 */
export async function getPrestamosPorEstado(estadoId) {
  try {
    const { data } = await axios.get(`/prestamo/estado/${estadoId}`);
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al obtener préstamos por estado' };
  }
}

/**
 * Obtiene préstamos del usuario actual
 */
export async function getMisPrestamos() {
  try {
    const { data } = await axios.get('/solicitud/mis-solicitudes');
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al obtener mis préstamos' };
  }
}

/**
 * Crea un nuevo préstamo
 */
export async function createPrestamo(prestamoData) {
  try {
    const { data } = await axios.post('/prestamo', prestamoData);
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al crear préstamo' };
  }
}

/**
 * Actualiza un préstamo
 */
export async function updatePrestamo(id, prestamoData) {
  try {
    const { data } = await axios.put(`/prestamo/${id}`, prestamoData);
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al actualizar préstamo' };
  }
}

/**
 * Aprobar un préstamo
 */
export async function aprobarPrestamo(id, datos) {
  try {
    const { data } = await axios.patch(`/prestamo/${id}/aprobar`, datos);
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al aprobar préstamo' };
  }
}

/**
 * Rechazar un préstamo
 */
export async function rechazarPrestamo(id, motivo) {
  try {
    const { data } = await axios.patch(`/prestamo/${id}/rechazar`, { Motivo_Rechazo: motivo });
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al rechazar préstamo' };
  }
}

/**
 * Marcar préstamo como entregado
 */
export async function entregarPrestamo(id) {
  try {
    const { data } = await axios.patch(`/prestamo/${id}/entregar`);
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al marcar como entregado' };
  }
}

/**
 * Finalizar préstamo (devolución)
 */
export async function finalizarPrestamo(id, datos) {
  try {
    const { data } = await axios.patch(`/prestamo/${id}/finalizar`, datos);
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al finalizar préstamo' };
  }
}

/**
 * Eliminar un préstamo
 */
export async function deletePrestamo(id) {
  try {
    const { data } = await axios.delete(`/prestamo/${id}`);
    return data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error al eliminar préstamo' };
  }
}
