import axios from './root.service.js';

export async function downloadEquiposPDF() {
try {
    const response = await axios.get('/pdf/equipos/download', {
      responseType: 'blob', // Importante para recibir el archivo
    });
    return response;
} catch (error) {
    console.error('Error descargando PDF:', error);
    throw error;
}
}

export async function previewEquiposPDF() {
try {
    const response = await axios.get('/pdf/equipos/preview', {
      responseType: 'blob', // Importante para recibir el archivo
    });
    return response;
} catch (error) {
    console.error('Error obteniendo vista previa PDF:', error);
    throw error;
}
}