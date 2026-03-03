"use strict";
import PDFDocument from "pdfkit";
import { AppDataSource } from "../config/configDb.js";
import Solicitud from "../entity/solicitud.entity.js";
import Prestamo from "../entity/prestamo.entity.js";
import Equipos from "../entity/equipos.entity.js";
import User from "../entity/user.entity.js";
import Devolucion from "../entity/devolucion.entity.js";
import TienePenalizacion from "../entity/tiene_penalizacion.entity.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_SIREC = path.join(__dirname, '../assets/images/sirec-logo-blanco.png');
const LOGO_FACE = path.join(__dirname, '../assets/images/face-logo.png');

/**
 * Función auxiliar para dibujar el encabezado institucional con logos
 */
const dibujarEncabezadoInstitucional = (doc, titulo, isLandscape = false) => {
  const pageWidth = isLandscape ? 792 : 612;
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  try {
    // Franja azul superior
    doc.rect(0, 0, pageWidth, 60).fill("#003366");

    // Logo SIREC (Izquierda)
    doc.image(LOGO_SIREC, margin, 10, { height: 40 });
  } catch (e) {
    console.error("No se pudo cargar logo SIREC:", e);
  }

  try {
    // Logo Facultad (Derecha) - Ajustado para que no tope con el borde
    doc.image(LOGO_FACE, pageWidth - margin - 120, 10, { height: 40 });
  } catch (e) {
    console.error("No se pudo cargar logo FACE:", e);
  }

  doc
    .fillColor("#003366")
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(titulo, margin, 70, { align: "center", width: contentWidth })
    .moveDown(0.2);

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#64748b")
    .text("Universidad del Bío-Bío - Facultad de Ciencias Empresariales", { align: "center", width: contentWidth })
    .text(`Fecha de generación: ${new Date().toLocaleString("es-CL")}`, { align: "center", width: contentWidth })
    .moveDown(1.5);
  
  // Línea divisoria
  doc
    .moveTo(margin, doc.y - 10)
    .lineTo(pageWidth - margin, doc.y - 10)
    .strokeColor("#e2e8f0")
    .lineWidth(1)
    .stroke();
  
  return doc.y;
};

/**
 * Generar reporte de solicitudes en PDF
 */
export async function generarReporteSolicitudesPDF(filtros = {}) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    
    // Construir query con filtros
    let queryBuilder = solicitudRepository
      .createQueryBuilder("solicitud")
      .leftJoinAndSelect("solicitud.usuario", "usuario")
      .leftJoinAndSelect("usuario.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("usuario.cargo", "cargo")
      .leftJoinAndSelect("solicitud.equipo", "equipo")
      .leftJoinAndSelect("equipo.categoria", "categoria")
      .leftJoinAndSelect("solicitud.prestamo", "prestamo")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .leftJoinAndSelect("prestamo.autorizacion", "autorizacion")
      .orderBy("solicitud.Rut", "ASC");

    // Aplicar filtros de fecha
    if (filtros.fechaInicio) {
      queryBuilder.andWhere("solicitud.Fecha_Sol >= :fechaInicio", { 
        fechaInicio: filtros.fechaInicio 
      });
    }
    
    if (filtros.fechaFin) {
      queryBuilder.andWhere("solicitud.Fecha_Sol <= :fechaFin", { 
        fechaFin: filtros.fechaFin 
      });
    }

    // Filtro por tipo de usuario
    if (filtros.tipoUsuario) {
      queryBuilder.andWhere("tipoUsuario.Descripcion = :tipoUsuario", {
        tipoUsuario: filtros.tipoUsuario
      });
    }

    // Filtro por cargo
    if (filtros.cargo) {
      queryBuilder.andWhere("cargo.Nombre_Cargo = :cargo", {
        cargo: filtros.cargo
      });
    }

    const solicitudes = await queryBuilder.getMany();

    // Crear PDF en landscape para que quepan las 7 columnas
    const doc = new PDFDocument({ size: "letter", layout: "landscape", margin: 30 });

    // Encabezado
    dibujarEncabezadoInstitucional(doc, "REPORTE DE SOLICITUDES", true);

    // Filtros aplicados
    const filtrosTexto = [];
    if (filtros.fechaInicio) filtrosTexto.push(`Desde: ${new Date(filtros.fechaInicio).toLocaleDateString("es-CL")}`);
    if (filtros.fechaFin) filtrosTexto.push(`Hasta: ${new Date(filtros.fechaFin).toLocaleDateString("es-CL")}`);
    if (filtros.tipoUsuario) filtrosTexto.push(`Tipo: ${filtros.tipoUsuario}`);
    if (filtros.cargo) filtrosTexto.push(`Cargo: ${filtros.cargo}`);

    if (filtrosTexto.length > 0) {
      doc.fontSize(8).font("Helvetica-Bold").text("Filtros: ", { continued: true });
      doc.font("Helvetica").text(filtrosTexto.join(" | "));
      doc.moveDown(0.3);
    }

    doc.fontSize(9).font("Helvetica-Bold").text(`Total de Solicitudes: ${solicitudes.length}`);
    doc.moveDown(0.5);

    // Definir columnas de la tabla
    const pageWidth = doc.page.width - 60; // margins
    const cols = [
      { label: "RUT", width: pageWidth * 0.10 },
      { label: "Usuario", width: pageWidth * 0.15 },
      { label: "ID Equipo", width: pageWidth * 0.09 },
      { label: "Fecha Solicitud", width: pageWidth * 0.11 },
      { label: "Motivo", width: pageWidth * 0.20 },
      { label: "Resultado", width: pageWidth * 0.12 },
      { label: "Motivo Rechazo", width: pageWidth * 0.23 },
    ];

    const startX = 30;
    const rowHeight = 22;

    // Función para dibujar encabezado de tabla
    function drawTableHeader(y) {
      doc.rect(startX, y, pageWidth, rowHeight).fill("#003366");
      let x = startX;
      cols.forEach(col => {
        doc.fill("white").fontSize(7).font("Helvetica-Bold")
          .text(col.label, x + 3, y + 6, { width: col.width - 6, align: "left" });
        x += col.width;
      });
      return y + rowHeight;
    }

    let y = drawTableHeader(doc.y);

    // Dibujar filas
    solicitudes.forEach((solicitud, index) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 30;
        y = drawTableHeader(y);
      }

      const estadoDetallado = obtenerEstadoSolicitud(solicitud);
      const resultado = estadoDetallado === "Rechazado" ? "Rechazado" 
        : estadoDetallado === "Pendiente" ? "Pendiente" 
        : "Aprobado";
      const motivoRechazo = resultado === "Rechazado" 
        ? (solicitud.prestamo?.autorizacion?.Obs_Aut || "Sin detalle")
        : "-";

      const bgColor = index % 2 === 0 ? "#f8f9fa" : "#ffffff";
      doc.rect(startX, y, pageWidth, rowHeight).fill(bgColor);

      const rowData = [
        solicitud.Rut || "",
        solicitud.usuario?.Nombre_Completo || "",
        solicitud.ID_Num_Inv || "",
        new Date(solicitud.Fecha_Sol).toLocaleDateString("es-CL"),
        solicitud.Motivo_Sol || "No especificado",
        resultado,
        motivoRechazo,
      ];

      let x = startX;
      rowData.forEach((text, i) => {
        doc.fill("#333333").fontSize(7).font("Helvetica")
          .text(String(text), x + 3, y + 5, { width: cols[i].width - 6, align: "left", lineBreak: false });
        x += cols[i].width;
      });

      y += rowHeight;
    });

    return doc;
  } catch (error) {
    console.error("Error al generar reporte de solicitudes PDF:", error);
    throw error;
  }
}

/**
 * Generar reporte de solicitudes en CSV
 */
export async function generarReporteSolicitudesCSV(filtros = {}) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    
    let queryBuilder = solicitudRepository
      .createQueryBuilder("solicitud")
      .leftJoinAndSelect("solicitud.usuario", "usuario")
      .leftJoinAndSelect("usuario.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("usuario.cargo", "cargo")
      .leftJoinAndSelect("solicitud.equipo", "equipo")
      .leftJoinAndSelect("solicitud.prestamo", "prestamo")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .leftJoinAndSelect("prestamo.autorizacion", "autorizacion")
      .orderBy("solicitud.Rut", "ASC");

    if (filtros.fechaInicio) {
      queryBuilder.andWhere("solicitud.Fecha_Sol >= :fechaInicio", { 
        fechaInicio: filtros.fechaInicio 
      });
    }
    
    if (filtros.fechaFin) {
      queryBuilder.andWhere("solicitud.Fecha_Sol <= :fechaFin", { 
        fechaFin: filtros.fechaFin 
      });
    }

    if (filtros.tipoUsuario) {
      queryBuilder.andWhere("tipoUsuario.Descripcion = :tipoUsuario", {
        tipoUsuario: filtros.tipoUsuario
      });
    }

    if (filtros.cargo) {
      queryBuilder.andWhere("cargo.Nombre_Cargo = :cargo", {
        cargo: filtros.cargo
      });
    }

    const solicitudes = await queryBuilder.getMany();

    // Crear CSV con las 7 columnas
    let csv = "RUT,Usuario,ID Equipo,Fecha Solicitud,Motivo,Resultado,Motivo Rechazo\n";
    
    solicitudes.forEach(solicitud => {
      const estadoDetallado = obtenerEstadoSolicitud(solicitud);
      const resultado = estadoDetallado === "Rechazado" ? "Rechazado" 
        : estadoDetallado === "Pendiente" ? "Pendiente" 
        : "Aprobado";
      const motivoRechazo = resultado === "Rechazado" 
        ? (solicitud.prestamo?.autorizacion?.Obs_Aut || "Sin detalle")
        : "";
      
      csv += `${solicitud.Rut},`;
      csv += `"${solicitud.usuario?.Nombre_Completo || ''}",`;
      csv += `${solicitud.ID_Num_Inv},`;
      csv += `"${new Date(solicitud.Fecha_Sol).toLocaleDateString("es-CL")}",`;
      csv += `"${(solicitud.Motivo_Sol || "No especificado").replace(/"/g, '""')}",`;
      csv += `${resultado},`;
      csv += `"${(motivoRechazo).replace(/"/g, '""')}"\n`;
    });

    return csv;
  } catch (error) {
    console.error("Error al generar reporte de solicitudes CSV:", error);
    throw error;
  }
}

/**
 * Generar reporte de préstamos en PDF
 */
export async function generarReportePrestamosPDF(filtros = {}) {
  try {
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    
    let queryBuilder = prestamoRepository
      .createQueryBuilder("prestamo")
      .leftJoinAndSelect("prestamo.equipos", "equipo")
      .leftJoinAndSelect("equipo.categoria", "categoria")
      .leftJoinAndSelect("prestamo.solicitudes", "solicitud")
      .leftJoinAndSelect("solicitud.usuario", "usuario")
      .leftJoinAndSelect("usuario.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .leftJoinAndSelect("prestamo.devolucion", "devolucion")
      .orderBy("prestamo.ID_Prestamo", "ASC");

    if (filtros.fechaInicio) {
      queryBuilder.andWhere("prestamo.Fecha_inicio_prestamo >= :fechaInicio", { 
        fechaInicio: filtros.fechaInicio 
      });
    }
    
    if (filtros.fechaFin) {
      queryBuilder.andWhere("prestamo.Fecha_inicio_prestamo <= :fechaFin", { 
        fechaFin: filtros.fechaFin 
      });
    }

    if (filtros.tipoUsuario) {
      queryBuilder.andWhere("tipoUsuario.Descripcion = :tipoUsuario", {
        tipoUsuario: filtros.tipoUsuario
      });
    }

    if (filtros.rut) {
      queryBuilder.andWhere("solicitud.Rut = :rut", { rut: filtros.rut });
    }

    const prestamos = await queryBuilder.getMany();

    const doc = new PDFDocument({ size: "letter", layout: "landscape", margin: 30 });

    // Encabezado
    dibujarEncabezadoInstitucional(doc, "REPORTE DE PRÉSTAMOS", true);

    // Filtros aplicados
    const filtrosTexto = [];
    if (filtros.fechaInicio) filtrosTexto.push(`Desde: ${new Date(filtros.fechaInicio).toLocaleDateString("es-CL")}`);
    if (filtros.fechaFin) filtrosTexto.push(`Hasta: ${new Date(filtros.fechaFin).toLocaleDateString("es-CL")}`);
    if (filtros.tipoUsuario) filtrosTexto.push(`Tipo: ${filtros.tipoUsuario}`);
    if (filtros.rut) filtrosTexto.push(`RUT: ${filtros.rut}`);

    if (filtrosTexto.length > 0) {
      doc.fontSize(8).font("Helvetica-Bold").text("Filtros: ", { continued: true });
      doc.font("Helvetica").text(filtrosTexto.join(" | "));
      doc.moveDown(0.3);
    }

    doc.fontSize(9).font("Helvetica-Bold").text(`Total de Préstamos: ${prestamos.length}`);
    doc.moveDown(0.5);

    // Definir columnas de la tabla
    const pageWidth = doc.page.width - 60;
    const cols = [
      { label: "Cod", width: pageWidth * 0.06 },
      { label: "RUT", width: pageWidth * 0.10 },
      { label: "Nombre", width: pageWidth * 0.15 },
      { label: "Equipo", width: pageWidth * 0.09 },
      { label: "Fecha Inicio", width: pageWidth * 0.11 },
      { label: "Fecha Fin", width: pageWidth * 0.11 },
      { label: "Estado", width: pageWidth * 0.12 },
      { label: "Comentario Recepción", width: pageWidth * 0.26 },
    ];

    const startX = 30;
    const rowHeight = 22;

    function drawTableHeader(y) {
      doc.rect(startX, y, pageWidth, rowHeight).fill("#003366");
      let x = startX;
      cols.forEach(col => {
        doc.fill("white").fontSize(7).font("Helvetica-Bold")
          .text(col.label, x + 3, y + 6, { width: col.width - 6, align: "left" });
        x += col.width;
      });
      return y + rowHeight;
    }

    let y = drawTableHeader(doc.y);

    prestamos.forEach((prestamo, index) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 30;
        y = drawTableHeader(y);
      }

      const estado = obtenerEstadoPrestamo(prestamo);
      const solicitud = prestamo.solicitudes && prestamo.solicitudes.length > 0 ? prestamo.solicitudes[0] : null;
      const comentarioRecepcion = prestamo.devolucion?.Obs_Dev || "-";

      const bgColor = index % 2 === 0 ? "#f8f9fa" : "#ffffff";
      doc.rect(startX, y, pageWidth, rowHeight).fill(bgColor);

      const rowData = [
        String(prestamo.ID_Prestamo),
        solicitud?.Rut || "",
        solicitud?.usuario?.Nombre_Completo || "",
        prestamo.ID_Num_Inv || "",
        prestamo.Fecha_inicio_prestamo ? new Date(prestamo.Fecha_inicio_prestamo).toLocaleDateString("es-CL") : "-",
        prestamo.Fecha_fin_prestamo ? new Date(prestamo.Fecha_fin_prestamo).toLocaleDateString("es-CL") : "-",
        estado,
        comentarioRecepcion,
      ];

      let x = startX;
      rowData.forEach((text, i) => {
        doc.fill("#333333").fontSize(7).font("Helvetica")
          .text(String(text), x + 3, y + 5, { width: cols[i].width - 6, align: "left", lineBreak: false });
        x += cols[i].width;
      });

      y += rowHeight;
    });

    return doc;
  } catch (error) {
    console.error("Error al generar reporte de préstamos PDF:", error);
    throw error;
  }
}

/**
 * Generar reporte de préstamos en CSV
 */
export async function generarReportePrestamosCSV(filtros = {}) {
  try {
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    
    let queryBuilder = prestamoRepository
      .createQueryBuilder("prestamo")
      .leftJoinAndSelect("prestamo.equipos", "equipo")
      .leftJoinAndSelect("equipo.categoria", "categoria")
      .leftJoinAndSelect("prestamo.solicitudes", "solicitud")
      .leftJoinAndSelect("solicitud.usuario", "usuario")
      .leftJoinAndSelect("usuario.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .leftJoinAndSelect("prestamo.devolucion", "devolucion")
      .orderBy("prestamo.ID_Prestamo", "ASC");

    if (filtros.fechaInicio) {
      queryBuilder.andWhere("prestamo.Fecha_inicio_prestamo >= :fechaInicio", { 
        fechaInicio: filtros.fechaInicio 
      });
    }
    
    if (filtros.fechaFin) {
      queryBuilder.andWhere("prestamo.Fecha_inicio_prestamo <= :fechaFin", { 
        fechaFin: filtros.fechaFin 
      });
    }

    if (filtros.tipoUsuario) {
      queryBuilder.andWhere("tipoUsuario.Descripcion = :tipoUsuario", {
        tipoUsuario: filtros.tipoUsuario
      });
    }

    if (filtros.rut) {
      queryBuilder.andWhere("solicitud.Rut = :rut", { rut: filtros.rut });
    }

    const prestamos = await queryBuilder.getMany();

    let csv = "Cod Prestamo,RUT,Nombre,Equipo,Fecha Inicio,Fecha Fin,Estado,Comentario Recepcion\n";
    
    prestamos.forEach(prestamo => {
      const estado = obtenerEstadoPrestamo(prestamo);
      const solicitud = prestamo.solicitudes && prestamo.solicitudes.length > 0 ? prestamo.solicitudes[0] : null;
      const comentarioRecepcion = prestamo.devolucion?.Obs_Dev || "";
      
      csv += `${prestamo.ID_Prestamo},`;
      csv += `${solicitud?.Rut || ""},`;
      csv += `"${solicitud?.usuario?.Nombre_Completo || ''}",`;
      csv += `${prestamo.ID_Num_Inv},`;
      csv += `"${prestamo.Fecha_inicio_prestamo ? new Date(prestamo.Fecha_inicio_prestamo).toLocaleDateString("es-CL") : ""}",`;
      csv += `"${prestamo.Fecha_fin_prestamo ? new Date(prestamo.Fecha_fin_prestamo).toLocaleDateString("es-CL") : ""}",`;
      csv += `${estado},`;
      csv += `"${(comentarioRecepcion).replace(/"/g, '""')}"\n`;
    });

    return csv;
  } catch (error) {
    console.error("Error al generar reporte de préstamos CSV:", error);
    throw error;
  }
}

export async function generarReporteEquiposPDF() {
  try {
    const equipoRepository = AppDataSource.getRepository(Equipos);
    
    const equipos = await equipoRepository.find({
      relations: ["categoria", "marca", "estado", "especificaciones"],
      order: { ID_Num_Inv: "ASC" }
    });

    const doc = new PDFDocument({ size: "letter", layout: "landscape", margin: 40 });

    // Encabezado
    dibujarEncabezadoInstitucional(doc, "REPORTE DE EQUIPOS", true);

    // Estadísticas
    const disponibles = equipos.filter(e => e.Disponible).length;
    const enPrestamo = equipos.filter(e => !e.Disponible).length;

    doc.fontSize(11).font("Helvetica-Bold").text("Resumen:");
    doc.fontSize(10).font("Helvetica")
      .text(`Total de Equipos: ${equipos.length} | Disponibles: ${disponibles} | En Préstamo: ${enPrestamo}`)
      .moveDown(1);

    // Configuración de la tabla
    const tableTop = doc.y;
    const colWidths = [25, 80, 110, 80, 80, 80, 60, 197]; 
    const colNames = ["#", "Inventario", "Modelo", "Categoría", "Marca", "Estado", "Disp.", "Especificaciones"];
    const startX = 40;
    let currentY = tableTop;

    // Función para dibujar encabezado de tabla
    const drawTableHeader = (y) => {
      doc.rect(startX, y, 712, 20).fill("#f1f5f9").stroke("#cbd5e1");
      doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(8);
      
      let x = startX;
      colNames.forEach((name, i) => {
        doc.text(name, x + 5, y + 6, { width: colWidths[i] - 10, align: "left" });
        x += colWidths[i];
      });
      return y + 20;
    };

    currentY = drawTableHeader(currentY);

    // Filas de equipos
    equipos.forEach((equipo, index) => {
      // Formatear especificaciones
      let specsText = "-";
      if (equipo.especificaciones && equipo.especificaciones.length > 0) {
        specsText = equipo.especificaciones
          .map(s => `${s.Tipo_Especificacion_HW}: ${s.Descripcion}`)
          .join(", ");
      }

      const data = [
        (index + 1).toString(),
        equipo.ID_Num_Inv || "N/A",
        equipo.Modelo || "N/A",
        equipo.categoria?.Descripcion || "N/A",
        equipo.marca?.Descripcion || "N/A",
        equipo.estado?.Descripcion || "N/A",
        equipo.Disponible ? "Sí" : "No",
        specsText
      ];

      // Altura dinámica basada en el texto de especificaciones
      const rowHeight = Math.max(25, doc.heightOfString(specsText, { width: colWidths[7] - 10 }) + 10);

      if (currentY + rowHeight > 550) {
        doc.addPage({ size: "letter", layout: "landscape", margin: 40 });
        const nextY = dibujarEncabezadoInstitucional(doc, "REPORTE DE EQUIPOS", true);
        currentY = drawTableHeader(nextY);
      }

      doc.font("Helvetica").fontSize(8).fillColor("#334155");
      let x = startX;
      data.forEach((text, i) => {
        doc.rect(x, currentY, colWidths[i], rowHeight).stroke("#e2e8f0");
        doc.text(text, x + 5, currentY + 7, { 
          width: colWidths[i] - 10,
          height: rowHeight - 10
        });
        x += colWidths[i];
      });

      currentY += rowHeight;
    });

    return doc;
  } catch (error) {
    console.error("Error al generar reporte de equipos PDF:", error);
    throw error;
  }
}

/**
 * Generar reporte de equipos en CSV
 */
export async function generarReporteEquiposCSV() {
  try {
    const equipoRepository = AppDataSource.getRepository(Equipos);
    
    const equipos = await equipoRepository.find({
      relations: ["categoria", "marca", "estado"],
      order: { ID_Num_Inv: "ASC" }
    });

    let csv = "ID Inventario,Modelo,Categoria,Marca,Estado,Disponible\n";
    
    equipos.forEach(equipo => {
      csv += `${equipo.ID_Num_Inv},`;
      csv += `"${equipo.Modelo || "N/A"}",`;
      csv += `"${equipo.categoria?.Descripcion || "N/A"}",`;
      csv += `"${equipo.marca?.Descripcion || "N/A"}",`;
      csv += `"${equipo.estado?.Descripcion || "N/A"}",`;
      csv += `${equipo.Disponible ? "Sí" : "No"}\n`;
    });

    return csv;
  } catch (error) {
    console.error("Error al generar reporte de equipos CSV:", error);
    throw error;
  }
}

/**
 * Generar reporte de estadísticas generales en PDF con gráficos
 */
export async function generarReporteEstadisticasPDF(filtros = {}) {
  try {
    const datos = await obtenerDatosGraficos(filtros);
    const doc = new PDFDocument({ size: "letter", margin: 40 });

    // --- CONFIGURACIÓN DE ESTILO ---
    const primaryBlue = "#003366"; // UBB Blue
    const accentBlue = "#3b82f6";
    const accentOrange = "#f59e0b";
    const accentTeal = "#10b981";
    const accentPurple = "#8b5cf6";
    const accentRed = "#e11d48";
    const lightBg = "#f8fafc";
    const textColor = "#1e293b";
    const grayText = "#64748b";

    // --- PÁGINA 1: DASHBOARD DE ESTADÍSTICAS ---
    dibujarEncabezadoInstitucional(doc, "DASHBOARD ESTRATÉGICO DE GESTIÓN");

    // FILTROS APLICADOS (Subtítulo informativo)
    if (filtros.fechaInicio || filtros.fechaFin || filtros.carrera || filtros.categoria) {
      doc.fontSize(9).fillColor(grayText).font("Helvetica-Oblique");
      let filtroStr = "Filtros aplicados: ";
      if (filtros.fechaInicio) filtroStr += `Desde ${filtros.fechaInicio} `;
      if (filtros.fechaFin) filtroStr += `Hasta ${filtros.fechaFin} `;
      if (filtros.carrera) filtroStr += `| Carrera: ${filtros.carrera} `;
      if (filtros.categoria) filtroStr += `| Categoría: ${filtros.categoria} `;
      doc.text(filtroStr, 40, doc.y).moveDown(1.5);
    } else {
      doc.moveDown(1);
    }

    // 1. GRID DE KPIs (5 TARJETAS)
    const startY = doc.y;
    const cardW = 100;
    const cardH = 70;
    const gap = 8;

    const kpis = [
      { label: "SOLICITUDES", val: Object.values(datos.solicitudesPorEstado).reduce((a,b)=>a+b, 0), color: accentBlue, bg: "#eff6ff" },
      { label: "PRÉSTAMOS ACT", val: datos.solicitudesPorEstado.entregados || 0, color: accentTeal, bg: "#f0fdf4" },
      { label: "INVENTARIO", val: Object.values(datos.equiposPorCategoria).reduce((a,b)=>a+b, 0), color: accentOrange, bg: "#fff7ed" },
      { label: "USUARIOS REG", val: datos.totalUsuariosSistema || 0, color: accentPurple, bg: "#f5f3ff" },
      { label: "SANCIONADOS", val: datos.totalSancionados || 0, color: accentRed, bg: "#fff1f2" }
    ];

    kpis.forEach((kpi, i) => {
      const x = 40 + (i * (cardW + gap));
      // Borde y Fondo de tarjeta
      doc.roundedRect(x, startY, cardW, cardH, 8).fillAndStroke(kpi.bg, kpi.color);
      // Título
      doc.fillColor(kpi.color).fontSize(7).font("Helvetica-Bold").text(kpi.label, x + 5, startY + 12, { width: cardW - 10, align: "center" });
      // Valor
      doc.fontSize(18).text(kpi.val.toString(), x + 5, startY + 30, { width: cardW - 10, align: "center" });
    });

    doc.y = startY + cardH + 25;

    // 2. TENDENCIA MENSUAL (GRAFICO DE LINEAS ESTILIZADO)
    doc.fillColor(textColor).fontSize(14).font("Helvetica-Bold").text("Tendencia de Solicitudes Mensuales");
    doc.moveDown(0.5);

    if (datos.solicitudesPorMes && datos.solicitudesPorMes.length > 0) {
      const gX = 60, gY = doc.y + 10, gW = 480, gH = 120;
      doc.rect(gX, gY, gW, gH).fillAndStroke("#ffffff", "#e2e8f0");
      
      const maxVal = Math.max(...datos.solicitudesPorMes.map(m => parseInt(m.cantidad)), 1);
      const stepX = gW / (datos.solicitudesPorMes.length || 1);
      
      doc.strokeColor(accentBlue).lineWidth(2);
      datos.solicitudesPorMes.forEach((p, i) => {
        const x = gX + (i * stepX) + (stepX/2);
        const y = gY + gH - (parseInt(p.cantidad) / maxVal) * (gH - 20) - 10;
        if (i === 0) doc.moveTo(x, y); else doc.lineTo(x, y);
        doc.circle(x, y, 2.5).fill(accentBlue);
        // Label mes
        const labelMes = new Date(p.mes).toLocaleDateString("es-CL", { month: "short" });
        doc.fillColor(grayText).fontSize(7).font("Helvetica").text(labelMes, x - 10, gY + gH + 5);
      });
      doc.stroke();
      doc.y = gY + gH + 30;
    } else {
        doc.fillColor(grayText).fontSize(10).text("No hay historial disponible para el rango seleccionado.").moveDown(2);
    }

    // 3. ESTADO DE SOLICITUDES (TABLA Y MINI BARRAS)
    doc.fillColor(textColor).fontSize(14).font("Helvetica-Bold").text("Estado Actual de Solicitudes");
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    const cols = [40, 200, 300, 400];
    doc.rect(40, tableTop, 520, 18).fill(primaryBlue);
    doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
    doc.text("ESTADO", cols[0] + 10, tableTop + 5);
    doc.text("CANTIDAD", cols[1], tableTop + 5);
    doc.text("DISTRIBUCIÓN", cols[2], tableTop + 5);

    let rowY = tableTop + 18;
    const ests = [
      { n: "Pendientes", v: datos.solicitudesPorEstado.pendientes, c: "#FFD93D" },
      { n: "Listo para Entregar", v: datos.solicitudesPorEstado.listoParaEntregar, c: accentBlue },
      { n: "Listo para recepcionar", v: datos.solicitudesPorEstado.entregados, c: accentTeal },
      { n: "Devueltos", v: datos.solicitudesPorEstado.devueltos, c: accentPurple },
      { n: "Rechazados", v: datos.solicitudesPorEstado.rechazados, c: accentRed }
    ];

    const totalSols = Object.values(datos.solicitudesPorEstado).reduce((a,b)=>a+b, 0) || 1;
    ests.forEach(item => {
      doc.fillColor(textColor).font("Helvetica").fontSize(9).text(item.n, cols[0] + 10, rowY + 6);
      doc.text(item.v.toString(), cols[1], rowY + 6);
      // Barra
      const barW = (item.v / totalSols) * 150;
      doc.rect(cols[2], rowY + 8, Math.max(barW, 1), 6).fill(item.c);
      doc.fillColor(grayText).text(`${((item.v/totalSols)*100).toFixed(1)}%`, cols[2] + 160, rowY + 6);
      
      doc.strokeColor("#e2e8f0").moveTo(40, rowY + 20).lineTo(560, rowY + 20).stroke();
      rowY += 20;
    });

    // --- PÁGINA 2: DESGLOSE POR CARRERA E INVENTARIO ---
    doc.addPage();
    dibujarEncabezadoInstitucional(doc, "DETALLE POR CARRERA E INVENTARIO");

    // DISTRIBUCIÓN POR CARRERA (DIARIO VS LARGO PLAZO)
    doc.fillColor(textColor).fontSize(13).font("Helvetica-Bold").text("Solicitudes por Carrera (Diario vs Largo Plazo)");
    doc.moveDown(0.8);

    const carData = Object.entries(datos.solicitudesPorCarrera || {});
    let carY = doc.y;
    
    if (carData.length > 0) {
       carData.slice(0, 12).forEach(([carrera, tipos]) => {
         const tDiario = tipos?.diario || 0;
         const tLargo = tipos?.largoPlazo || 0;
         const tTotal = tDiario + tLargo;
         
         const label = carrera.length > 40 ? carrera.substring(0, 37) + "..." : carrera;
         doc.fillColor(textColor).fontSize(8).font("Helvetica-Bold").text(label, 40, carY);
         
         // Barras apiladas
         const maxPageW = 300;
         const maxValCar = Math.max(...carData.map(c => (c[1]?.diario || 0) + (c[1]?.largoPlazo || 0)), 1);
         const scale = maxPageW / maxValCar;
         
         const wD = tDiario * scale;
         const wL = tLargo * scale;
         
         doc.rect(200, carY - 2, wD, 10).fill(accentBlue);
         doc.rect(200 + wD, carY - 2, wL, 10).fill(accentPurple);
         doc.fillColor(grayText).fontSize(7).text(`${tTotal} total (${tDiario}D / ${tLargo}L)`, 200 + wD + wL + 5, carY);
         
         carY += 18;
       });
       // Leyenda
       doc.rect(40, carY + 10, 8, 8).fill(accentBlue);
       doc.fillColor(grayText).fontSize(7).text("Diario", 52, carY + 11);
       doc.rect(100, carY + 10, 8, 8).fill(accentPurple);
       doc.text("Largo Plazo", 112, carY + 11);
    }

    // DISTRIBUCIÓN DE INVENTARIO
    doc.y = carY + 40;
    doc.fillColor(textColor).fontSize(13).font("Helvetica-Bold").text("Resumen de Inventario por Categoría");
    doc.moveDown(0.5);

    const invTop = doc.y;
    doc.rect(40, invTop, 520, 18).fillAndStroke(lightBg, "#e2e8f0");
    doc.fillColor(primaryBlue).fontSize(8).font("Helvetica-Bold").text("CATEGORÍA", 50, invTop + 5);
    doc.text("EQUIPOS", 450, invTop + 5);

    let iY = invTop + 18;
    Object.entries(datos.equiposPorCategoria || {}).sort((a,b)=>b[1]-a[1]).forEach(([cat, val]) => {
       doc.fillColor(textColor).font("Helvetica").fontSize(9).text(cat, 50, iY + 6);
       doc.text(val.toString(), 450, iY + 6);
       doc.strokeColor("#f1f5f9").moveTo(40, iY + 20).lineTo(560, iY + 20).stroke();
       iY += 20;
    });

    // --- PÁGINA 3: ANÁLISIS DE USUARIOS (GRÁFICOS DE TORTA) ---
    doc.addPage();
    dibujarEncabezadoInstitucional(doc, "ANÁLISIS DE DISTRIBUCIÓN DE USUARIOS");

    const uTotalAlumnos = Object.values(datos.usuariosPorTipo?.alumnos || {}).reduce((a,b)=>a+b, 0);
    const uTotalProfesores = Object.values(datos.usuariosPorTipo?.profesores || {}).reduce((a,b)=>a+b, 0);
    const uTotalGeneral = uTotalAlumnos + uTotalProfesores || 1;

    // 1. DISTRIBUCIÓN GENERAL (Gráfico Circular)
    doc.fillColor(textColor).fontSize(13).font("Helvetica-Bold").text("Distribución General: Alumnos vs Profesores", 40, doc.y);
    doc.moveDown(1);
    
    let pieY = doc.y + 60;
    let pieX = 150;
    const radius = 60;

    const dataGeneral = [
      { label: "Alumnos", value: uTotalAlumnos, color: accentBlue },
      { label: "Profesores", value: uTotalProfesores, color: accentOrange }
    ];

    let currentAngle = -90;
    dataGeneral.forEach(item => {
      const sliceAngle = (item.value / uTotalGeneral) * 360;
      if (sliceAngle > 1) {
        doc.fillColor(item.color);
        drawPieSlice(doc, pieX, pieY, radius, currentAngle, currentAngle + sliceAngle);
        currentAngle += sliceAngle;
      }
    });

    // Leyenda General
    let legY = pieY - 20;
    dataGeneral.forEach(item => {
      doc.rect(pieX + 100, legY, 10, 10).fill(item.color);
      doc.fillColor(textColor).fontSize(9).font("Helvetica").text(`${item.label}: ${item.value} (${((item.value/uTotalGeneral)*100).toFixed(1)}%)`, pieX + 115, legY + 1);
      legY += 20;
    });

    // 2. DISTRIBUCIÓN DETALLADA (Gráfico Circular)
    doc.y = pieY + radius + 40;
    doc.fillColor(textColor).fontSize(13).font("Helvetica-Bold").text("Distribución Detallada por Carrera / Cargo");
    doc.moveDown(1);

    const detailData = [];
    Object.entries(datos.usuariosPorTipo?.alumnos || {}).forEach(([k, v]) => detailData.push({ label: `Alumno: ${k}`, value: v }));
    Object.entries(datos.usuariosPorTipo?.profesores || {}).forEach(([k, v]) => detailData.push({ label: `Prof: ${k}`, value: v }));
    
    const topDetail = detailData.sort((a,b) => b.value - a.value).slice(0, 8);
    const totalTop = topDetail.reduce((a,b) => a + b.value, 0) || 1;

    pieY = doc.y + 60;
    currentAngle = -90;
    const palette = [accentBlue, accentOrange, accentTeal, accentPurple, accentRed, "#6366f1", "#ec4899", "#06b6d4"];

    topDetail.forEach((item, i) => {
      const color = palette[i % palette.length];
      const sliceAngle = (item.value / totalTop) * 360;
      if (sliceAngle > 1) {
        doc.fillColor(color);
        drawPieSlice(doc, pieX, pieY, radius, currentAngle, currentAngle + sliceAngle);
        currentAngle += sliceAngle;
      }
    });

    // Leyenda Detalle
    legY = pieY - 50;
    topDetail.forEach((item, i) => {
      const color = palette[i % palette.length];
      doc.rect(pieX + 100, legY, 8, 8).fill(color);
      const labelShort = item.label.length > 30 ? item.label.substring(0, 27) + "..." : item.label;
      doc.fillColor(textColor).fontSize(8).font("Helvetica").text(`${labelShort}: ${item.value}`, pieX + 112, legY + 1);
      legY += 14;
    });

    doc.y = pieY + radius + 40;

    // --- PIE DE PÁGINA ---
    const range = doc.bufferedPageRange();
    for (let i = range.start, end = range.start + range.count, item = 1; i < end; i++, item++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor(grayText).text(
            `Página ${item} de ${range.count} | SIREC UBB - Sistema de Gestión de Equipos`,
            40, 750, { align: "center", width: 532 }
        );
    }

    return doc;
  } catch (error) {
    console.error("Error al generar reporte de estadísticas PDF:", error);
    throw error;
  }
}

/**
 * Función auxiliar para dibujar sectores de gráfico de torta
 */
function drawPieSlice(doc, centerX, centerY, radius, startAngle, endAngle) {
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;
  
  doc.moveTo(centerX, centerY);
  doc.lineTo(
    centerX + radius * Math.cos(startAngleRad),
    centerY + radius * Math.sin(startAngleRad)
  );
  
  doc.arc(centerX, centerY, radius, startAngleRad, endAngleRad, false);
  doc.lineTo(centerX, centerY);
  doc.fill();
}

/**
 * Funciones auxiliares
 */
function obtenerEstadoSolicitud(solicitud) {
  if (!solicitud.ID_Prestamo || !solicitud.prestamo) {
    return "Pendiente";
  }

  if (solicitud.prestamo.tieneEstados && solicitud.prestamo.tieneEstados.length > 0) {
    const estadosOrdenados = [...solicitud.prestamo.tieneEstados].sort(
      (a, b) => new Date(b.Fecha_Estado) - new Date(a.Fecha_Estado)
    );
    const ultimoEstado = estadosOrdenados[0];
    
    switch(ultimoEstado.Cod_Estado) {
      case 1: return "Pendiente";
      case 2: return "Listo para Entregar";
      case 3: return "Listo para recepcionar";
      case 4: return "Devuelto";
      case 5: return "Rechazado";
      default: return "Desconocido";
    }
  }
  
  return "Desconocido";
}

function obtenerEstadoPrestamo(prestamo) {
  if (prestamo.devolucion) {
    return "Devuelto";
  }

  if (prestamo.tieneEstados && prestamo.tieneEstados.length > 0) {
    const estadosOrdenados = [...prestamo.tieneEstados].sort(
      (a, b) => new Date(b.Fecha_Estado) - new Date(a.Fecha_Estado)
    );
    const ultimoEstado = estadosOrdenados[0];
    
    switch(ultimoEstado.Cod_Estado) {
      case 2: return "Listo para Entregar";
      case 3: return "Listo para recepcionar";
      case 4: return "Devuelto";
      case 5: return "Rechazado";
      default: return "En Proceso";
    }
  }
  
  return "En Proceso";
}

/**
 * Generar reporte de usuarios en PDF
 */
export async function generarReporteUsuariosPDF(filtros = {}) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    let queryBuilder = userRepository
      .createQueryBuilder("u")
      .leftJoinAndSelect("u.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("u.carrera", "carrera")
      .leftJoinAndSelect("u.cargo", "cargo")
      .orderBy("u.Nombre_Completo", "ASC");

    // Aplicar filtros
    if (filtros.tipoUsuario) {
      queryBuilder.andWhere("tipoUsuario.Descripcion = :tipoUsuario", { 
        tipoUsuario: filtros.tipoUsuario 
      });
    }
    if (filtros.carrera) {
      queryBuilder.andWhere("carrera.Nombre_Carrera = :carrera", { 
        carrera: filtros.carrera 
      });
    }

    const usuarios = await queryBuilder.getMany();

    // Obtener RUTs con penalizaciones activas
    const penRepo = AppDataSource.getRepository(TienePenalizacion);
    const penActivas = await penRepo
      .createQueryBuilder("tp")
      .select("tp.Rut")
      .where("tp.Fecha_Fin IS NULL OR tp.Fecha_Fin > :ahora", { ahora: new Date() })
      .getMany();
    const rutsSancionados = new Set(penActivas.map(p => p.Rut));

    // Crear PDF en LANDSCAPE
    const doc = new PDFDocument({ size: "letter", layout: "landscape", margin: 40 });

    // Encabezado
    dibujarEncabezadoInstitucional(doc, "REPORTE DE USUARIOS", true);

    // Filtros aplicados
    if (filtros.tipoUsuario || filtros.carrera) {
      doc.fontSize(9).font("Helvetica-Bold").text("Filtros aplicados:", { underline: true });
      if (filtros.tipoUsuario) {
        doc.font("Helvetica").text(`Tipo de Usuario: ${filtros.tipoUsuario}`);
      }
      if (filtros.carrera) {
        doc.font("Helvetica").text(`Carrera: ${filtros.carrera}`);
      }
      doc.moveDown(0.5);
    }

    // Estadísticas
    const alumnosCount = usuarios.filter(u => u.tipoUsuario?.Descripcion === "Alumno").length;
    const profesoresCount = usuarios.filter(u => u.tipoUsuario?.Descripcion === "Profesor").length;
    const adminsCount = usuarios.filter(u => u.tipoUsuario?.Descripcion === "Administrador").length;

    doc.fontSize(11).font("Helvetica-Bold").text("Resumen:");
    doc.font("Helvetica")
      .text(`Total de Usuarios: ${usuarios.length} | Alumnos: ${alumnosCount} | Profesores: ${profesoresCount} | Administradores: ${adminsCount}`)
      .moveDown(1);

    // Configuración de la tabla - 7 columnas
    const tableTop = doc.y;
    const colWidths = [28, 155, 85, 164, 70, 140, 70]; // Total: 712
    const colNames = ["#", "Nombre Completo", "RUT", "Email", "Tipo", "Carrera / Cargo", "Sancionado"];
    const startX = 40;
    let currentY = tableTop;

    // Función para dibujar encabezado
    const drawHeader = (y) => {
      doc.rect(startX, y, 712, 20).fill("#f1f5f9").stroke("#cbd5e1");
      doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(9);
      
      let x = startX;
      colNames.forEach((name, i) => {
        doc.text(name, x + 5, y + 6, { width: colWidths[i] - 10, align: "left" });
        x += colWidths[i];
      });
      return y + 20;
    };

    // Dibujar primer encabezado
    currentY = drawHeader(currentY);

    // Filas de usuarios
    usuarios.forEach((usuario, index) => {
      // Calcular carrera o cargo
      const carreraOCargo = usuario.tipoUsuario?.Cod_TipoUsuario === 2 
        ? usuario.carrera?.Nombre_Carrera || "Sin carrera"
        : usuario.tipoUsuario?.Cod_TipoUsuario === 3 
        ? usuario.cargo?.Desc_Cargo || "Sin cargo"
        : "-";

      const sancionado = rutsSancionados.has(usuario.Rut) ? "Sí" : "No";

      const data = [
        (index + 1).toString(),
        usuario.Nombre_Completo || "N/A",
        usuario.Rut || "N/A",
        usuario.Correo || "N/A",
        usuario.tipoUsuario?.Descripcion || "N/A",
        carreraOCargo,
        sancionado
      ];

      const rowHeight = 25;

      if (currentY + rowHeight > 550) {
        doc.addPage({ size: "letter", layout: "landscape", margin: 40 });
        const nextY = dibujarEncabezadoInstitucional(doc, "REPORTE DE USUARIOS", true);
        currentY = drawHeader(nextY);
      }

      doc.font("Helvetica").fontSize(8).fillColor("#334155");
      let x = startX;
      data.forEach((text, i) => {
        doc.rect(x, currentY, colWidths[i], rowHeight).stroke("#e2e8f0");
        doc.text(text, x + 5, currentY + 8, { 
          width: colWidths[i] - 10, 
          height: rowHeight - 8,
          ellipsis: true 
        });
        x += colWidths[i];
      });

      currentY += rowHeight;
    });

    return doc;
  } catch (error) {
    console.error("Error al generar reporte de usuarios PDF:", error);
    throw error;
  }
}

/**
 * Generar reporte de usuarios en CSV
 */
export async function generarReporteUsuariosCSV(filtros = {}) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    let queryBuilder = userRepository
      .createQueryBuilder("u")
      .leftJoinAndSelect("u.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("u.carrera", "carrera")
      .leftJoinAndSelect("u.cargo", "cargo")
      .orderBy("u.Nombre_Completo", "ASC");

    if (filtros.tipoUsuario) {
      queryBuilder.andWhere("tipoUsuario.Descripcion = :tipoUsuario", { 
        tipoUsuario: filtros.tipoUsuario 
      });
    }
    if (filtros.carrera) {
      queryBuilder.andWhere("carrera.Nombre_Carrera = :carrera", { 
        carrera: filtros.carrera 
      });
    }

    const usuarios = await queryBuilder.getMany();

    // Obtener RUTs con penalizaciones activas
    const penRepo = AppDataSource.getRepository(TienePenalizacion);
    const penActivas = await penRepo
      .createQueryBuilder("tp")
      .select("tp.Rut")
      .where("tp.Fecha_Fin IS NULL OR tp.Fecha_Fin > :ahora", { ahora: new Date() })
      .getMany();
    const rutsSancionados = new Set(penActivas.map(p => p.Rut));

    // Crear CSV
    let csv = "\uFEFFRUT,Nombre Completo,Email,Tipo Usuario,Carrera/Cargo,Sancionado\n";
    
    usuarios.forEach(usuario => {
      const carreraOCargo = usuario.tipoUsuario?.Cod_TipoUsuario === 2 
        ? usuario.carrera?.Nombre_Carrera || "Sin carrera"
        : usuario.tipoUsuario?.Cod_TipoUsuario === 3 
        ? usuario.cargo?.Desc_Cargo || "Sin cargo"
        : "-";
      const sancionado = rutsSancionados.has(usuario.Rut) ? "Sí" : "No";
      
      csv += `${usuario.Rut},`;
      csv += `"${usuario.Nombre_Completo}",`;
      csv += `${usuario.Correo},`;
      csv += `"${usuario.tipoUsuario?.Descripcion || "N/A"}",`;
      csv += `"${carreraOCargo}",`;
      csv += `${sancionado}\n`;
    });

    return csv;
  } catch (error) {
    console.error("Error al generar reporte de usuarios CSV:", error);
    throw error;
  }
}

/**
 * Obtener datos para gráficos
 */
export async function obtenerDatosGraficos(filtros = {}) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    const equiposRepository = AppDataSource.getRepository(Equipos);
    const userRepository = AppDataSource.getRepository(User);

    // 1. SOLICITUDES (y Préstamos asociados)
    // Aplicar filtros globales de Fecha, Carrera y Categoría a las solicitudes
    let solicitudQuery = solicitudRepository
      .createQueryBuilder("solicitud")
      .leftJoinAndSelect("solicitud.usuario", "usuario")
      .leftJoinAndSelect("usuario.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("usuario.carrera", "carrera")
      .leftJoinAndSelect("usuario.cargo", "cargo")
      .leftJoinAndSelect("solicitud.equipo", "equipo")
      .leftJoinAndSelect("equipo.categoria", "categoria")
      .leftJoinAndSelect("solicitud.prestamo", "prestamo")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo");

    if (filtros.fechaInicio) {
      solicitudQuery.andWhere("solicitud.Fecha_Sol >= :fechaInicio", { fechaInicio: filtros.fechaInicio });
    }
    if (filtros.fechaFin) {
      // Ajustar fin del día para fechaFin
      const fechaFinAjustada = new Date(filtros.fechaFin);
      fechaFinAjustada.setHours(23, 59, 59, 999);
      solicitudQuery.andWhere("solicitud.Fecha_Sol <= :fechaFin", { fechaFin: fechaFinAjustada });
    }
    if (filtros.carrera) {
      solicitudQuery.andWhere("carrera.Nombre_Carrera = :carrera", { carrera: filtros.carrera });
    }
    if (filtros.categoria) {
      solicitudQuery.andWhere("categoria.Descripcion = :categoria", { categoria: filtros.categoria });
    }

    const solicitudes = await solicitudQuery.getMany();

    // Calcular métricas derivadas de solicitudes filtradas
    const solicitudesPorEstado = {
      pendientes: 0,
      listoParaEntregar: 0,
      entregados: 0,
      devueltos: 0,
      rechazados: 0
    };

    const solicitudesPorTipo = {
      diarias: 0,
      largoPlazo: 0
    };

    solicitudes.forEach(sol => {
      // Estado
      const estado = obtenerEstadoSolicitud(sol);
      if (estado === "Pendiente") solicitudesPorEstado.pendientes++;
      else if (estado === "Listo para Entregar") solicitudesPorEstado.listoParaEntregar++;
      else if (estado === "Listo para recepcionar") solicitudesPorEstado.entregados++;
      else if (estado === "Devuelto") solicitudesPorEstado.devueltos++;
      else if (estado === "Rechazado") solicitudesPorEstado.rechazados++;

      // Tipo (Largo Plazo exige fechas existentes y DISTINTAS)
      const iniStr = sol.Fecha_inicio_sol ? new Date(sol.Fecha_inicio_sol).toISOString().split('T')[0] : null;
      const finStr = sol.Fecha_termino_sol ? new Date(sol.Fecha_termino_sol).toISOString().split('T')[0] : null;
      
      if (iniStr && finStr && iniStr !== finStr) {
        solicitudesPorTipo.largoPlazo++;
      } else {
        solicitudesPorTipo.diarias++;
      }
    });

    // 2. EQUIPOS (Inventario)
    // El inventario solo se filtra por Categoría (es una foto actual)
    let equiposQuery = equiposRepository
      .createQueryBuilder("equipo")
      .leftJoinAndSelect("equipo.categoria", "categoria");

    if (filtros.categoria) {
      equiposQuery.andWhere("categoria.Descripcion = :categoria", { categoria: filtros.categoria });
    }

    const equipos = await equiposQuery.getMany();

    const equiposPorCategoria = {};
    equipos.forEach(eq => {
      const cat = eq.categoria?.Descripcion || "Sin categoría";
      equiposPorCategoria[cat] = (equiposPorCategoria[cat] || 0) + 1;
    });

    // 3. DISTRIBUCIÓN DE USUARIOS CON SOLICITUDES
    // Obtenemos usuarios únicos de las solicitudes filtradas
    const usuariosUnicos = new Map();
    solicitudes.forEach(sol => {
      if (sol.usuario && sol.usuario.Rut) {
        // Excluir administradores de la distribución
        if (sol.usuario.tipoUsuario?.Descripcion !== "Administrador") {
          usuariosUnicos.set(sol.usuario.Rut, sol.usuario);
        }
      }
    });

    const usuariosPorTipo = {
      alumnos: {},
      profesores: {}
    };

    usuariosUnicos.forEach(user => {
      const tipo = user.tipoUsuario?.Descripcion;
      if (tipo === "Alumno") {
        const carrera = user.carrera?.Nombre_Carrera || "Sin carrera";
        usuariosPorTipo.alumnos[carrera] = (usuariosPorTipo.alumnos[carrera] || 0) + 1;
      } else if (tipo === "Profesor") {
        const cargo = user.cargo?.Desc_Cargo || "Sin cargo";
        usuariosPorTipo.profesores[cargo] = (usuariosPorTipo.profesores[cargo] || 0) + 1;
      }
    });

    // 4. SOLICITUDES POR MES (Tendencia)
    // Reutiliza los filtros de fecha (si existen, o usa el rango por defecto), carrera y categoría
    const meses = filtros.meses || 6;
    const d = new Date();
    d.setMonth(d.getMonth() - meses);
    d.setDate(1);

    // Copiamos el query base de solicitudes para mantener filtros de carrera/categoría
    // Pero necesitamos ajustar el filtro de fecha para el rango del gráfico
    let tendenciaQuery = solicitudRepository
      .createQueryBuilder("solicitud")
      .select("DATE_TRUNC('month', solicitud.Fecha_Sol)", "mes")
      .addSelect("COUNT(*)", "cantidad")
      .leftJoin("solicitud.usuario", "usuario")
      .leftJoin("usuario.carrera", "carrera")
      .leftJoin("solicitud.equipo", "equipo")
      .leftJoin("equipo.categoria", "categoria")
      .where("solicitud.Fecha_Sol >= :fechaMinima", { fechaMinima: d });

    // Aplicar otros filtros si existen (carrera, categoría, fechaFin)
    if (filtros.fechaFin) {
       const fechaFinAjustada = new Date(filtros.fechaFin);
       fechaFinAjustada.setHours(23, 59, 59, 999);
       tendenciaQuery.andWhere("solicitud.Fecha_Sol <= :fechaFin", { fechaFin: fechaFinAjustada });
    }
    // Nota: Si hay fechaInicio, podría entrar en conflicto con 'meses', 
    // pero priorizamos el filtro explícito si el usuario lo pone, o el rango de meses si no.
    // Para simplificar, si hay fechaInicio, la usamos EN LUGAR de 'meses' si es mayor que fechaMinima
    if (filtros.fechaInicio) {
        tendenciaQuery.andWhere("solicitud.Fecha_Sol >= :fechaInicio", { fechaInicio: filtros.fechaInicio });
    }

    if (filtros.carrera) {
      tendenciaQuery.andWhere("carrera.Nombre_Carrera = :carrera", { carrera: filtros.carrera });
    }
    if (filtros.categoria) {
      tendenciaQuery.andWhere("categoria.Descripcion = :categoria", { categoria: filtros.categoria });
    }

    tendenciaQuery
      .groupBy("DATE_TRUNC('month', solicitud.Fecha_Sol)")
      .orderBy("DATE_TRUNC('month', solicitud.Fecha_Sol)", "ASC");

    const solicitudesPorMes = await tendenciaQuery.getRawMany();

    // 5. SOLICITUDES POR CARRERA/CARGO (Desglosado por tipo)
    const solicitudesPorCarrera = {};
    solicitudes.forEach(sol => {
      const tipoU = sol.usuario?.tipoUsuario?.Descripcion;
      let label = "Personal/Docente";
      
      if (tipoU === "Alumno") {
        label = sol.usuario?.carrera?.Nombre_Carrera || "Sin carrera";
      } else if (tipoU === "Profesor") {
        label = sol.usuario?.cargo?.Desc_Cargo || "Profesor (Sin cargo)";
      }

      if (!solicitudesPorCarrera[label]) {
        solicitudesPorCarrera[label] = { diario: 0, largoPlazo: 0 };
      }

      // Lógica SIREC: comparar solo YYYY-MM-DD para determinar si es el mismo día
      const iniStr = sol.Fecha_inicio_sol ? new Date(sol.Fecha_inicio_sol).toISOString().split('T')[0] : null;
      const finStr = sol.Fecha_termino_sol ? new Date(sol.Fecha_termino_sol).toISOString().split('T')[0] : null;

      const esLargoPlazo = iniStr && finStr && iniStr !== finStr;

      if (esLargoPlazo) {
        solicitudesPorCarrera[label].largoPlazo++;
      } else {
        solicitudesPorCarrera[label].diario++;
      }
    });

    // 6. PRÉSTAMOS POR CATEGORÍA DE EQUIPO Y TIPO DE USUARIO (Agrupado)
    let equipoTipoQuery = solicitudRepository
      .createQueryBuilder("solicitud")
      .leftJoin("solicitud.usuario", "usuario")
      .leftJoin("usuario.tipoUsuario", "tipoUsuario")
      .leftJoin("solicitud.equipo", "equipo")
      .leftJoin("equipo.categoria", "categoria")
      .leftJoin("solicitud.prestamo", "prestamo")
      .select("categoria.Descripcion", "categoria")
      .addSelect("tipoUsuario.Descripcion", "tipoUsuario")
      .addSelect("COUNT(*)", "cantidad")
      .where("prestamo.ID_Prestamo IS NOT NULL")
      .groupBy("categoria.Descripcion")
      .addGroupBy("tipoUsuario.Descripcion");

    // Aplicar filtros (incluyendo rango de meses)
    equipoTipoQuery.andWhere("solicitud.Fecha_Sol >= :fechaMinimaEq", { fechaMinimaEq: d });
    if (filtros.fechaInicio) equipoTipoQuery.andWhere("solicitud.Fecha_Sol >= :fechaInicio", { fechaInicio: filtros.fechaInicio });
    if (filtros.fechaFin) {
        const f = new Date(filtros.fechaFin); f.setHours(23,59,59,999);
        equipoTipoQuery.andWhere("solicitud.Fecha_Sol <= :fechaFin", { fechaFin: f });
    }
    if (filtros.carrera) {
        equipoTipoQuery.leftJoin("usuario.carrera", "carrera")
        .andWhere("carrera.Nombre_Carrera = :carrera", { carrera: filtros.carrera });
    }
    if (filtros.categoria) equipoTipoQuery.andWhere("categoria.Descripcion = :categoria", { categoria: filtros.categoria });

    const equipoTipoRaw = await equipoTipoQuery.getRawMany();
    
    // Estructurar: { "Notebook": { "Alumno": 5, "Profesor": 2 }, ... }
    const prestamosPorEquipoTipo = {};
    equipoTipoRaw.forEach(row => {
        const cat = row.categoria || "Sin categoría";
        const tipo = row.tipoUsuario || "Otro";
        if (!prestamosPorEquipoTipo[cat]) prestamosPorEquipoTipo[cat] = {};
        prestamosPorEquipoTipo[cat][tipo] = parseInt(row.cantidad);
    });

    // 7. [NUEVO] TENDENCIA POR CATEGORÍA (Multiserie)
    let tendenciaCatQuery = solicitudRepository
      .createQueryBuilder("solicitud")
      .leftJoin("solicitud.equipo", "equipo")
      .leftJoin("equipo.categoria", "categoria")
      .select("DATE_TRUNC('month', solicitud.Fecha_Sol)", "mes")
      .addSelect("categoria.Descripcion", "categoria")
      .addSelect("COUNT(*)", "cantidad")
      .where("solicitud.Fecha_Sol >= :fechaMinima", { fechaMinima: d }) // Reusamos 'd' (meses atrás)
      .groupBy("DATE_TRUNC('month', solicitud.Fecha_Sol)")
      .addGroupBy("categoria.Descripcion")
      .orderBy("DATE_TRUNC('month', solicitud.Fecha_Sol)", "ASC");

    // Aplicar filtros
    if (filtros.fechaFin) {
        const f = new Date(filtros.fechaFin); f.setHours(23,59,59,999);
        tendenciaCatQuery.andWhere("solicitud.Fecha_Sol <= :fechaFin", { fechaFin: f });
    }
    // Si hay filtros específicos, los aplicamos también
    if (filtros.carrera) {
        tendenciaCatQuery.leftJoin("solicitud.usuario", "usuario").leftJoin("usuario.carrera", "carrera")
        .andWhere("carrera.Nombre_Carrera = :carrera", { carrera: filtros.carrera });
    }
    if (filtros.categoria) tendenciaCatQuery.andWhere("categoria.Descripcion = :categoria", { categoria: filtros.categoria });

    const tendenciaCatRaw = await tendenciaCatQuery.getRawMany();
    
    // Estructurar: { "Enero": { "Notebook": 5, "Proyector": 2 }, ... }
    const tendenciaPorCategoria = {};
    tendenciaCatRaw.forEach(row => {
        const mes = new Date(row.mes).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
        const cat = row.categoria || "Otros";
        if (!tendenciaPorCategoria[mes]) tendenciaPorCategoria[mes] = {};
        tendenciaPorCategoria[mes][cat] = parseInt(row.cantidad);
    });



    // 8. TOTAL USUARIOS SANCIONADOS (Métrica General)
    const activeSanctions = await AppDataSource.getRepository(TienePenalizacion)
      .createQueryBuilder("tp")
      .select("COUNT(DISTINCT tp.Rut)", "count")
      .where("tp.Fecha_Inicio <= CURRENT_TIMESTAMP")
      .andWhere("(tp.Fecha_Fin IS NULL OR tp.Fecha_Fin >= CURRENT_TIMESTAMP)")
      .getRawOne();

    const totalSancionados = parseInt(activeSanctions?.count || 0);

    // 9. TOTAL USUARIOS EN EL SISTEMA (Alumnos + Profesores)
    const totalUsersSystemCount = await userRepository
      .createQueryBuilder("user")
      .leftJoin("user.tipoUsuario", "tipo")
      .where("tipo.Descripcion IN (:...tipos)", { tipos: ["Alumno", "Profesor"] })
      .getCount();

    return {
      solicitudesPorEstado,
      solicitudesPorTipo,
      equiposPorCategoria,
      usuariosPorTipo,
      solicitudesPorMes,
      solicitudesPorCarrera,
      // Nuevos datos cruzados
      prestamosPorEquipoTipo,         // Grouped Bar (Equipos vs Alumnos/Profesores)
      tendenciaPorCategoria,        // Multi-line
      totalSancionados,             // KPI
      totalUsuariosSistema: totalUsersSystemCount // KPI Arreglado
    };
  } catch (error) {
    console.error("Error al obtener datos para gráficos:", error);
    throw error;
  }
}
