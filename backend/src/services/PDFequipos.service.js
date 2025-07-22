import PDFDocument from "pdfkit";
import { findAllEquipos } from "./equipo.service.js";

export const generateEquiposPDF = async () => {
try {
    const equipos = await findAllEquipos();
    
    const doc = new PDFDocument({ margin: 50 });
    const currentDate = new Date().toLocaleDateString("es-CL");
    const title = `Listado de equipos ${currentDate}`;
    
    // Título del documento
    doc.fontSize(20).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown(2);
    
    // Encabezados de la tabla
    const startY = doc.y;
    const tableTop = startY;
    const itemHeight = 25;
    
    // Definir columnas
    const columns = {
    id: { x: 50, width: 50 },
    modelo: { x: 100, width: 120 },
    tipo: { x: 220, width: 80 },
    estado: { x: 300, width: 80 },
    condicion: { x: 380, width: 80 },
    propietario: { x: 460, width: 100 }
    };
    
    // Encabezados
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("ID", columns.id.x, tableTop);
    doc.text("Modelo", columns.modelo.x, tableTop);
    doc.text("Tipo", columns.tipo.x, tableTop);
    doc.text("Estado", columns.estado.x, tableTop);
    doc.text("Condición", columns.condicion.x, tableTop);
    doc.text("Propietario", columns.propietario.x, tableTop);
    
    // Línea separadora
    doc.moveTo(50, tableTop + 15)
    .lineTo(560, tableTop + 15)
    .stroke();
    
    // Datos de equipos
    doc.font("Helvetica").fontSize(10);
    let currentY = tableTop + 25;
    
    equipos.forEach((equipo, index) => {
      // Verificar si necesita nueva página
    if (currentY > 700) {
        doc.addPage();
        currentY = 50;
        
        // Repetir encabezados en nueva página
        doc.fontSize(12).font("Helvetica-Bold");
        doc.text("ID", columns.id.x, currentY);
        doc.text("Modelo", columns.modelo.x, currentY);
        doc.text("Tipo", columns.tipo.x, currentY);
        doc.text("Estado", columns.estado.x, currentY);
        doc.text("Condición", columns.condicion.x, currentY);
        doc.text("Propietario", columns.propietario.x, currentY);
        
        doc.moveTo(50, currentY + 15)
        .lineTo(560, currentY + 15)
        .stroke();
        
        currentY += 25;
        doc.font("Helvetica").fontSize(10);
    }      
      // Alternar color de fondo para las filas
if (index % 2 === 1) {
        doc.rect(50, currentY - 2, 510, itemHeight).fill("#f8f9fa");
        doc.fillColor("#000000");
    }

      // Datos del equipo
    doc.text(equipo.ID_Equipo?.toString() || "", columns.id.x, currentY);
    doc.text(equipo.Modelo || "", columns.modelo.x, currentY, { width: columns.modelo.width });
    doc.text(equipo.Tipo || "", columns.tipo.x, currentY, { width: columns.tipo.width });
    doc.text(equipo.ID_Estado?.toString() || "", columns.estado.x, currentY);
    doc.text(equipo.Condicion || "", columns.condicion.x, currentY, { width: columns.condicion.width });
    doc.text(equipo.Propietario || "", columns.propietario.x, currentY, { width: columns.propietario.width });

    currentY += itemHeight;
    });
    
    // Pie de página
    doc.fontSize(8).text(
    `Generado el ${new Date().toLocaleString("es-CL")}`,
    50,
    doc.page.height - 50,
    { align: "center" }
    );
    
    return { doc, title };
} catch (error) {
    throw new Error(`Error generando PDF: ${error.message}`);
}
};
