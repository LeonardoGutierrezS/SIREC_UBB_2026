import { generateEquiposPDF } from "../services/PDFequipos.service.js";
import { handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export const downloadEquiposPDF = async (req, res) => {
  try {
    const { doc, title } = await generateEquiposPDF();
    
    // Configurar headers para descarga
    const filename = `${title.replace(/\s+/g, '_')}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe del documento al response
    doc.pipe(res);
    doc.end();
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    handleErrorServer(res, 500, "Error interno del servidor al generar PDF");
  }
};

export const previewEquiposPDF = async (req, res) => {
  try {
    const { doc, title } = await generateEquiposPDF();
    
    // Configurar headers para vista previa
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    
    // Pipe del documento al response
    doc.pipe(res);
    doc.end();
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    handleErrorServer(res, 500, "Error interno del servidor al generar PDF");
  }
};