import axios from './root.service.js';

/**
 * Descargar reporte de solicitudes en PDF
 */
export const descargarReporteSolicitudesPDF = async (fechaInicio, fechaFin, tipoUsuario, cargo) => {
  try {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (tipoUsuario) params.tipoUsuario = tipoUsuario;
    if (cargo) params.cargo = cargo;

    const response = await axios.get('/reportes/solicitudes/pdf', {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading solicitudes PDF:', error);
    throw error;
  }
};

/**
 * Descargar reporte de solicitudes en CSV
 */
export const descargarReporteSolicitudesCSV = async (fechaInicio, fechaFin, tipoUsuario, cargo) => {
  try {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (tipoUsuario) params.tipoUsuario = tipoUsuario;
    if (cargo) params.cargo = cargo;

    const response = await axios.get('/reportes/solicitudes/csv', {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading solicitudes CSV:', error);
    throw error;
  }
};

/**
 * Descargar reporte de préstamos en PDF
 */
export const descargarReportePrestamosPDF = async (fechaInicio, fechaFin, tipoUsuario, rut) => {
  try {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (tipoUsuario) params.tipoUsuario = tipoUsuario;
    if (rut) params.rut = rut;

    const response = await axios.get('/reportes/prestamos/pdf', {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading prestamos PDF:', error);
    throw error;
  }
};

/**
 * Descargar reporte de préstamos en CSV
 */
export const descargarReportePrestamosCSV = async (fechaInicio, fechaFin, tipoUsuario, rut) => {
  try {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (tipoUsuario) params.tipoUsuario = tipoUsuario;
    if (rut) params.rut = rut;

    const response = await axios.get('/reportes/prestamos/csv', {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading prestamos CSV:', error);
    throw error;
  }
};

/**
 * Descargar reporte de equipos en PDF
 */
export const descargarReporteEquiposPDF = async () => {
  try {
    const response = await axios.get('/reportes/equipos/pdf', {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading equipos PDF:', error);
    throw error;
  }
};

/**
 * Descargar reporte de equipos en CSV
 */
export const descargarReporteEquiposCSV = async () => {
  try {
    const response = await axios.get('/reportes/equipos/csv', {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading equipos CSV:', error);
    throw error;
  }
};

/**
 * Descargar reporte de estadísticas generales en PDF
 */
export const descargarReporteEstadisticasPDF = async (meses) => {
  try {
    const params = {};
    if (meses) params.meses = meses;

    const response = await axios.get('/reportes/estadisticas/pdf', {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading estadisticas PDF:', error);
    throw error;
  }
};
/**
 * Descargar reporte de usuarios en PDF
 */
export const descargarReporteUsuariosPDF = async (tipoUsuario, carrera) => {
  try {
    const params = {};
    if (tipoUsuario) params.tipoUsuario = tipoUsuario;
    if (carrera) params.carrera = carrera;

    const response = await axios.get('/reportes/usuarios/pdf', {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading usuarios PDF:', error);
    throw error;
  }
};

/**
 * Descargar reporte de usuarios en CSV
 */
export const descargarReporteUsuariosCSV = async (tipoUsuario, carrera) => {
  try {
    const params = {};
    if (tipoUsuario) params.tipoUsuario = tipoUsuario;
    if (carrera) params.carrera = carrera;

    const response = await axios.get('/reportes/usuarios/csv', {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading usuarios CSV:', error);
    throw error;
  }
};

/**
 * Obtener datos para gráficos
 */
export const obtenerDatosGraficos = async (filtros = {}) => {
  try {
    // Soporte para llamadas legacy que solo enviaban el número de meses
    if (typeof filtros === 'number') {
        filtros = { meses: filtros };
    }

    const params = { ...filtros };

    const response = await axios.get('/reportes/graficos', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching graficos data:', error);
    throw error;
  }
};