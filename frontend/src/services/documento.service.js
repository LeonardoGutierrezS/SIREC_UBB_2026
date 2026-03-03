import axios from './root.service.js';

const API_URL = '/documentos';

/**
 * Obtiene la información necesaria para generar el acta de préstamo
 * @param {number} idSolicitud 
 */
export const getInfoActa = async (idSolicitud) => {
    try {
        const response = await axios.get(`${API_URL}/acta/solicitud/${idSolicitud}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Sube el archivo del acta firmada
 * @param {number} idPrestamo 
 * @param {File} file 
 */
export const subirActaFirmada = async (idPrestamo, file) => {
    try {
        const formData = new FormData();
        formData.append('acta', file);

        const response = await axios.patch(`${API_URL}/acta/subir/${idPrestamo}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Descarga el acta firmada
 * @param {number} idPrestamo 
 */
export const descargarActaFirmada = async (idPrestamo) => {
    try {
        const response = await axios.get(`${API_URL}/acta/descargar/${idPrestamo}`, {
            responseType: 'blob',
        });
        
        // Crear un enlace temporal para la descarga
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `acta-prestamo-${idPrestamo}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { status: 'Success' };
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Visualiza el acta firmada en una nueva pestaña
 * @param {number} idPrestamo 
 */
export const visualizarActaFirmada = async (idPrestamo) => {
    try {
        const response = await axios.get(`${API_URL}/acta/descargar/${idPrestamo}?view=true`, {
            responseType: 'blob',
        });
        
        const contentType = response.headers['content-type'] || 'application/pdf';
        const file = new Blob([response.data], { type: contentType });
        return URL.createObjectURL(file);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
