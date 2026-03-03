"use strict";
import PDFDocument from "pdfkit";
import { AppDataSource } from "../config/configDb.js";
import Solicitud from "../entity/solicitud.entity.js";

/**
 * Generar PDF de autorización de préstamo
 * @param {number} idSolicitud - ID de la solicitud aprobada
 * @param {string} adminName - Nombre del administrador que genera el acta
 * @returns {Promise<PDFDocument>} - Documento PDF generado
 */
export async function generarPDFAutorizacion(idSolicitud, adminName) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    // Obtener la solicitud con todas sus relaciones
    const solicitud = await solicitudRepository.findOne({
      where: { ID_Solicitud: idSolicitud },
      relations: [
        "usuario",
        "usuario.carrera",
        "usuario.tipoUsuario",
        "usuario.cargo",
        "equipo",
        "equipo.marca",
        "equipo.categoria",
        "equipo.especificaciones", // Añadida relación para specs
        "prestamo",
        "prestamo.autorizacion",
        "prestamo.autorizacion.usuario",
        "prestamo.autorizacion.usuario.cargo",
      ],
    });

    if (!solicitud) {
      throw new Error("Solicitud no encontrada");
    }

    if (!solicitud.prestamo || !solicitud.prestamo.autorizacion) {
      throw new Error("La solicitud no tiene autorización asociada");
    }

    // Validar que sea un préstamo de largo plazo (tiene fechas de inicio y término)
    if (!solicitud.Fecha_inicio_sol || !solicitud.Fecha_termino_sol) {
      throw new Error("El PDF de autorización solo se genera para préstamos de largo plazo");
    }

    const doc = new PDFDocument({ size: "letter", margin: 50 });

    // Configuración de rutas de logotipos
    const path = await import("path");
    const logoSirecPath = path.join(process.cwd(), "public", "images", "sirec-logo.png");
    const logoFacePath = path.join(process.cwd(), "public", "images", "Face_azul_2.png");

    // Configuración de constantes UNIFICADAS
    const L_MARGIN = 50;
    const CENTER = 306;
    const CONTENT_WIDTH = 512;
    const titleSize = 18;
    const headerSize = 13;
    const bodySize = 11; 
    const smallSize = 8.5;

    // --- ENCABEZADO INSTITUCIONAL ---
    try {
      doc.image(logoSirecPath, L_MARGIN, 40, { height: 50 });
      doc.image(logoFacePath, 415, 40, { height: 50 }); 
    } catch (e) {
      console.warn("No se pudieron cargar los logos:", e.message);
    }

    doc.y = 110; 

    // Título Central
    doc
      .fontSize(titleSize)
      .font("Helvetica-Bold")
      .fillColor("#003366")
      .text("ACTA DE PRÉSTAMO DE EQUIPOS COMPUTACIONALES", L_MARGIN, doc.y, { align: "center", width: CONTENT_WIDTH })
      .moveDown(0.1);

    doc
      .fontSize(bodySize)
      .font("Helvetica-Bold")
      .fillColor("#444444")
      .text("Facultad de Ciencias Empresariales - Universidad del Bío-Bío", L_MARGIN, doc.y, { align: "center", width: CONTENT_WIDTH })
      .moveDown(0.6);

    // Línea divisoria azul
    doc
      .save()
      .moveTo(180, doc.y)
      .lineTo(430, doc.y)
      .lineWidth(2)
      .strokeColor("#006edf")
      .stroke()
      .restore()
      .moveDown(1.2);

    // --- METADATOS (ID y FECHA) ---
    const fechaActual = new Date().toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const metaY = doc.y;
    const metaColWidth = 140;
    
    doc.fontSize(smallSize).fillColor("#777777").font("Helvetica-Bold");
    doc.text("ID SOLICITUD", 80, metaY, { width: metaColWidth, align: "center" });
    doc.text("ID PRÉSTAMO", 230, metaY, { width: metaColWidth, align: "center" });
    doc.text("FECHA EMISIÓN", 380, metaY, { width: metaColWidth, align: "center" });

    doc.fontSize(bodySize).fillColor("#333333");
    doc.text(`#${solicitud.ID_Solicitud}`, 80, metaY + 12, { width: metaColWidth, align: "center" });
    doc.text(`#${solicitud.ID_Prestamo || 'N/A'}`, 230, metaY + 12, { width: metaColWidth, align: "center" });
    doc.text(fechaActual, 380, metaY + 12, { width: metaColWidth, align: "center" });

    doc.y = metaY + 40; 

    // --- CUERPO DEL ACTA ---
    const usuario = solicitud.usuario;
    const equipo = solicitud.equipo;

    doc
      .fontSize(bodySize)
      .font("Helvetica")
      .fillColor("#000000")
      .text(
        `En Chillán, a ${fechaActual}, se procede a la entrega del equipo computacional detallado a continuación, bajo la modalidad de préstamo institucional del Sistema de Reserva de Equipos Computacionales (SIREC).`,
        L_MARGIN, doc.y, { align: "justify", width: CONTENT_WIDTH }
      )
      .moveDown(1);

    const drawGridRow = (label, value, label2, value2) => {
      const currentY = doc.y;
      doc.fontSize(bodySize).font("Helvetica-Bold").fillColor("#333333").text(label, L_MARGIN, currentY);
      doc.fontSize(bodySize).font("Helvetica").fillColor("#000000").text(value || "N/A", L_MARGIN + 115, currentY, { width: 170 });
      const p1Y = doc.y;

      let p2Y = currentY;
      if (label2) {
        doc.fontSize(bodySize).font("Helvetica-Bold").fillColor("#333333").text(label2, CENTER + 20, currentY);
        doc.fontSize(bodySize).font("Helvetica").fillColor("#000000").text(value2 || "N/A", CENTER + 115, currentY, { width: 170 });
        p2Y = doc.y;
      }
      doc.y = Math.max(p1Y, p2Y) + 6;
    };

    // 1. DATOS DEL SOLICITANTE
    doc.fontSize(headerSize).font("Helvetica-Bold").fillColor("#003366").text("1. DATOS DEL SOLICITANTE", L_MARGIN).moveDown(0.4);
    drawGridRow("Nombre Completo:", usuario.Nombre_Completo, "RUT:", usuario.Rut);
    drawGridRow("Correo:", usuario.Correo, "Tipo Usuario:", solicitud.usuario.tipoUsuario?.Descripcion || "N/A");
    drawGridRow("Carrera/Cargo:", usuario.carrera?.Nombre_Carrera || usuario.cargo?.Desc_Cargo);
    doc.moveDown(0.8);

    // 2. IDENTIFICACIÓN DEL EQUIPO
    doc.fontSize(headerSize).font("Helvetica-Bold").fillColor("#003366").text("2. IDENTIFICACIÓN DEL EQUIPO", L_MARGIN).moveDown(0.4);
    drawGridRow("N° Inventario:", equipo.ID_Num_Inv, "Marca/Cat:", `${equipo.marca?.Descripcion || 'Genérica'} / ${equipo.categoria?.Descripcion || 'Equipo'}`);
    drawGridRow("Modelo:", equipo.Modelo, "N° Serie:", equipo.Numero_Serie);

    // Agregar especificaciones si existen
    if (equipo.especificaciones && equipo.especificaciones.length > 0) {
      doc.fontSize(9.5).font("Helvetica-Bold").fillColor("#333333").text("Especificaciones:", L_MARGIN, doc.y + 4);
      const specsText = equipo.especificaciones.map(s => `${s.Tipo_Especificacion_HW}: ${s.Descripcion}`).join(" | ");
      doc.fontSize(9.5).font("Helvetica").fillColor("#444444").text(specsText, L_MARGIN + 90, doc.y - 12.5, { width: CONTENT_WIDTH - 90 });
      doc.moveDown(0.3);
    }
    doc.moveDown(0.8);

    // 3. CONDICIONES Y VIGENCIA
    doc.fontSize(headerSize).font("Helvetica-Bold").fillColor("#003366").text("3. CONDICIONES Y VIGENCIA", L_MARGIN).moveDown(0.4);
    const fInicio = new Date(solicitud.Fecha_inicio_sol).toLocaleDateString('es-CL');
    const fFin = new Date(solicitud.Fecha_termino_sol).toLocaleDateString('es-CL');
    drawGridRow("Fecha Inicio:", fInicio, "Fecha Devolución:", fFin);

    const autorizador = solicitud.prestamo.autorizacion.usuario;
    const cargoAut = autorizador.cargo?.Desc_Cargo || "Director/a de Escuela";
    drawGridRow("Autorizado por:", `${autorizador.Nombre_Completo} (${cargoAut})`);
    doc.moveDown(1.2);

    // OBLIGACIONES
    doc.fontSize(bodySize).font("Helvetica-Bold").fillColor("#000000").text("Obligaciones del Usuario:", L_MARGIN).moveDown(0.4);
    doc.fontSize(bodySize - 1).font("Helvetica").list([
        "El equipo debe ser utilizado exclusivamente para fines académicos o institucionales.",
        "Es responsabilidad del usuario el cuidado, integridad y correcto funcionamiento del equipo.",
        "No está permitido intervenir el hardware ni instalar software que vulnere la seguridad del equipo.",
        "En caso de pérdida, robo o daño, el usuario debe informar de inmediato a la administración.",
        "El retraso en la devolución generará sanciones automáticas en el sistema SIREC.",
      ], { bulletRadius: 3, textIndent: 15 }).moveDown(1);

    // --- SECCIÓN DE FIRMAS ---
    const firmasY = 640; 
    const firmaBoxWidth = 165;
    const firmaGap = 15;

    const drawFirma = (label, name, detail, x) => {
      doc.save();
      doc.moveTo(x, firmasY + 30).lineTo(x + firmaBoxWidth, firmasY + 30).strokeColor("#333333").lineWidth(0.8).stroke();
      doc.fontSize(bodySize).font("Helvetica-Bold").text(label, x, firmasY + 40, { width: firmaBoxWidth, align: "center" });
      if (name) {
        doc.fontSize(smallSize).font("Helvetica").text(name, x, firmasY + 52, { width: firmaBoxWidth, align: "center" });
      }
      if (detail) {
        doc.fontSize(smallSize - 0.5).font("Helvetica").fillColor("#666666").text(detail, x, firmasY + 62, { width: firmaBoxWidth, align: "center" });
      }
      doc.restore();
    };

    const tipoUser = solicitud.usuario.tipoUsuario?.Descripcion || 'Usuario';
    drawFirma(`Firma ${tipoUser}`, usuario.Nombre_Completo, `RUT: ${usuario.Rut}`, 50);
    drawFirma("Firma Encargado", adminName || '____________________', "Facultad de Ciencias Empresariales", 50 + firmaBoxWidth + firmaGap);
    drawFirma("Firma y Timbre Bodega", null, null, 50 + (firmaBoxWidth + firmaGap) * 2);

    // PIE DE PÁGINA
    doc
      .fontSize(8)
      .fillColor("#999999")
      .text(
        `Documento generado automáticamente por SIREC UBB el ${new Date().toLocaleString('es-CL')}`,
        50, 725, { align: "center", width: CONTENT_WIDTH }
      );

    return doc;
  } catch (error) {
    console.error("Error al generar PDF de autorización:", error);
    throw error;
  }
}
