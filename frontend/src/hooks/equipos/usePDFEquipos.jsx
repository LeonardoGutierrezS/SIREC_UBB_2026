import { downloadEquiposPDF, previewEquiposPDF } from '@services/pdfEquipos.service.js';

const usePDFEquipos = () => {

const handleDownloadPDF = async () => {
    try {
    const response = await downloadEquiposPDF();
    
    // Crear un blob y descargar el archivo
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
      // Extraer el nombre del archivo desde la fecha actual
    const currentDate = new Date().toLocaleDateString('es-CL').replace(/\//g, '-');
    link.download = `Listado_de_equipos_${currentDate}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    } catch (error) {
    console.error('Error al descargar PDF:', error);
    }
};

const handlePreviewPDF = async () => {
    try {
    const response = await previewEquiposPDF();
    
      // Crear un blob y abrir en nueva pestaña
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    } catch (error) {
    console.error('Error al mostrar vista previa PDF:', error);
    }
};

return {
    handleDownloadPDF,
    handlePreviewPDF,
};
};

export default usePDFEquipos;