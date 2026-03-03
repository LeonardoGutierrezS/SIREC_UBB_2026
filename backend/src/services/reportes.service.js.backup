"use strict";
import PDFDocument from "pdfkit";
import { AppDataSource } from "../config/configDb.js";
import Solicitud from "../entity/solicitud.entity.js";
import Prestamo from "../entity/prestamo.entity.js";
import Equipos from "../entity/equipos.entity.js";
import User from "../entity/user.entity.js";
import Devolucion from "../entity/devolucion.entity.js";

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
      .leftJoinAndSelect("solicitud.equipo", "equipo")
      .leftJoinAndSelect("equipo.categoria", "categoria")
      .leftJoinAndSelect("solicitud.prestamo", "prestamo")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .orderBy("solicitud.Fecha_Sol", "DESC");

    // Aplicar filtros
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

    const solicitudes = await queryBuilder.getMany();

    // Crear PDF
    const doc = new PDFDocument({ size: "letter", margin: 40 });

    // Encabezado
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORTE DE SOLICITUDES", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Universidad del Bío-Bío - SIREC", { align: "center" })
      .text(`Fecha de generación: ${new Date().toLocaleString("es-CL")}`, { align: "center" })
      .moveDown(1);

    // Filtros aplicados
    if (filtros.fechaInicio || filtros.fechaFin) {
      doc.fontSize(9).font("Helvetica-Bold").text("Filtros aplicados:", { underline: true });
      if (filtros.fechaInicio) {
        doc.font("Helvetica").text(`Desde: ${new Date(filtros.fechaInicio).toLocaleDateString("es-CL")}`);
      }
      if (filtros.fechaFin) {
        doc.text(`Hasta: ${new Date(filtros.fechaFin).toLocaleDateString("es-CL")}`);
      }
      doc.moveDown(1);
    }

    // Resumen
    doc.fontSize(11).font("Helvetica-Bold").text(`Total de Solicitudes: ${solicitudes.length}`);
    doc.moveDown(1);

    // Tabla de solicitudes
    solicitudes.forEach((solicitud, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      const estado = obtenerEstadoSolicitud(solicitud);
      const tipo = solicitud.Fecha_inicio_sol && solicitud.Fecha_termino_sol ? "Largo Plazo" : "Diaria";

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`${index + 1}. Solicitud #${solicitud.ID_Solicitud}`, { continued: false })
        .font("Helvetica")
        .text(`Usuario: ${solicitud.usuario?.Nombre || ''} ${solicitud.usuario?.Apellido || ''}`)
        .text(`RUT: ${solicitud.Rut}`)
        .text(`Equipo: ${solicitud.ID_Num_Inv} - ${solicitud.equipo?.Modelo || "N/A"}`)
        .text(`Tipo: ${tipo}`)
        .text(`Estado: ${estado}`)
        .text(`Fecha Solicitud: ${new Date(solicitud.Fecha_Sol).toLocaleString("es-CL")}`)
        .text(`Motivo: ${solicitud.Motivo_Sol || "No especificado"}`)
        .moveDown(0.5);
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
      .leftJoinAndSelect("solicitud.equipo", "equipo")
      .leftJoinAndSelect("solicitud.prestamo", "prestamo")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .orderBy("solicitud.Fecha_Sol", "DESC");

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

    const solicitudes = await queryBuilder.getMany();

    // Crear CSV
    let csv = "ID Solicitud,Usuario,RUT,Equipo,Modelo,Tipo,Estado,Fecha Solicitud,Motivo\n";
    
    solicitudes.forEach(solicitud => {
      const estado = obtenerEstadoSolicitud(solicitud);
      const tipo = solicitud.Fecha_inicio_sol && solicitud.Fecha_termino_sol ? "Largo Plazo" : "Diaria";
      
      csv += `${solicitud.ID_Solicitud},`;
      csv += `"${solicitud.usuario?.Nombre || ''} ${solicitud.usuario?.Apellido || ''}",`;
      csv += `${solicitud.Rut},`;
      csv += `${solicitud.ID_Num_Inv},`;
      csv += `"${solicitud.equipo?.Modelo || "N/A"}",`;
      csv += `${tipo},`;
      csv += `${estado},`;
      csv += `"${new Date(solicitud.Fecha_Sol).toLocaleString("es-CL")}",`;
      csv += `"${solicitud.Motivo_Sol || "No especificado"}"\n`;
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
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .leftJoinAndSelect("prestamo.devolucion", "devolucion")
      .orderBy("prestamo.Fecha_inicio_prestamo", "DESC");

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

    const prestamos = await queryBuilder.getMany();

    const doc = new PDFDocument({ size: "letter", margin: 40 });

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORTE DE PRÉSTAMOS", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Universidad del Bío-Bío - SIREC", { align: "center" })
      .text(`Fecha de generación: ${new Date().toLocaleString("es-CL")}`, { align: "center" })
      .moveDown(1);

    doc.fontSize(11).font("Helvetica-Bold").text(`Total de Préstamos: ${prestamos.length}`);
    doc.moveDown(1);

    prestamos.forEach((prestamo, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      const estado = obtenerEstadoPrestamo(prestamo);
      const solicitud = prestamo.solicitudes && prestamo.solicitudes.length > 0 ? prestamo.solicitudes[0] : null;

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`${index + 1}. Préstamo #${prestamo.ID_Prestamo}`)
        .font("Helvetica")
        .text(`Usuario: ${solicitud?.usuario?.Nombre || ''} ${solicitud?.usuario?.Apellido || ''}`)
        .text(`Equipo: ${prestamo.ID_Num_Inv}`)
        .text(`Estado: ${estado}`)
        .text(`Fecha Inicio: ${new Date(prestamo.Fecha_inicio_prestamo).toLocaleString("es-CL")}`)
        .text(`Fecha Fin: ${new Date(prestamo.Fecha_fin_prestamo).toLocaleString("es-CL")}`)
        .moveDown(0.5);
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
      .leftJoinAndSelect("prestamo.solicitudes", "solicitud")
      .leftJoinAndSelect("solicitud.usuario", "usuario")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .orderBy("prestamo.Fecha_inicio_prestamo", "DESC");

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

    const prestamos = await queryBuilder.getMany();

    let csv = "ID Prestamo,Usuario,RUT,Equipo,Estado,Fecha Inicio,Fecha Fin\n";
    
    prestamos.forEach(prestamo => {
      const estado = obtenerEstadoPrestamo(prestamo);
      const solicitud = prestamo.solicitudes && prestamo.solicitudes.length > 0 ? prestamo.solicitudes[0] : null;
      
      csv += `${prestamo.ID_Prestamo},`;
      csv += `"${solicitud?.usuario?.Nombre || ''} ${solicitud?.usuario?.Apellido || ''}",`;
      csv += `${solicitud?.Rut || "N/A"},`;
      csv += `${prestamo.ID_Num_Inv},`;
      csv += `${estado},`;
      csv += `"${new Date(prestamo.Fecha_inicio_prestamo).toLocaleString("es-CL")}",`;
      csv += `"${new Date(prestamo.Fecha_fin_prestamo).toLocaleString("es-CL")}"\n`;
    });

    return csv;
  } catch (error) {
    console.error("Error al generar reporte de préstamos CSV:", error);
    throw error;
  }
}

/**
 * Generar reporte de equipos en PDF
 */
export async function generarReporteEquiposPDF() {
  try {
    const equipoRepository = AppDataSource.getRepository(Equipos);
    
    const equipos = await equipoRepository.find({
      relations: ["categoria", "marca", "estado"],
      order: { ID_Num_Inv: "ASC" }
    });

    const doc = new PDFDocument({ size: "letter", margin: 40 });

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORTE DE EQUIPOS", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Universidad del Bío-Bío - SIREC", { align: "center" })
      .text(`Fecha de generación: ${new Date().toLocaleString("es-CL")}`, { align: "center" })
      .moveDown(1);

    // Estadísticas
    const disponibles = equipos.filter(e => e.Disponible).length;
    const enPrestamo = equipos.filter(e => !e.Disponible).length;

    doc.fontSize(11).font("Helvetica-Bold").text("Resumen:");
    doc.fontSize(10).font("Helvetica")
      .text(`Total de Equipos: ${equipos.length}`)
      .text(`Disponibles: ${disponibles}`)
      .text(`En Préstamo: ${enPrestamo}`)
      .moveDown(1);

    // Tabla de equipos
    equipos.forEach((equipo, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${equipo.ID_Num_Inv}`)
        .font("Helvetica")
        .text(`Modelo: ${equipo.Modelo || "N/A"}`)
        .text(`Categoría: ${equipo.categoria?.Descripcion || "N/A"}`)
        .text(`Marca: ${equipo.marca?.Descripcion || "N/A"}`)
        .text(`Estado: ${equipo.estado?.Descripcion || "N/A"}`)
        .text(`Disponible: ${equipo.Disponible ? "Sí" : "No"}`)
        .moveDown(0.5);
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
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    const equipoRepository = AppDataSource.getRepository(Equipos);
    const devolucionRepository = AppDataSource.getRepository(Devolucion);
    const userRepository = AppDataSource.getRepository(User);

    // Obtener datos para gráficos (usando la misma lógica que obtenerDatosGraficos)
    const solicitudes = await solicitudRepository
      .createQueryBuilder("solicitud")
      .leftJoinAndSelect("solicitud.prestamo", "prestamo")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .getMany();

    const equipos = await equipoRepository
      .createQueryBuilder("equipo")
      .leftJoinAndSelect("equipo.categoria", "categoria")
      .getMany();

    const usuarios = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.tipoUsuario", "tipoUsuario")
      .getMany();

    // Estadísticas básicas
    const totalSolicitudes = solicitudes.length;
    const totalPrestamos = await prestamoRepository.count();
    const totalEquipos = equipos.length;
    const equiposDisponibles = equipos.filter(eq => eq.Disponible).length;
    const totalDevoluciones = await devolucionRepository.count();

    // Datos para gráficos
    const solicitudesPorEstado = {
      pendientes: 0,
      listoParaEntregar: 0,
      entregados: 0,
      devueltos: 0,
      rechazados: 0
    };

    solicitudes.forEach(sol => {
      const estado = obtenerEstadoSolicitud(sol);
      if (estado === "Pendiente") solicitudesPorEstado.pendientes++;
      else if (estado === "Listo para Entregar") solicitudesPorEstado.listoParaEntregar++;
      else if (estado === "Entregado") solicitudesPorEstado.entregados++;
      else if (estado === "Devuelto") solicitudesPorEstado.devueltos++;
      else if (estado === "Rechazado") solicitudesPorEstado.rechazados++;
    });

    const solicitudesPorTipo = {
      diarias: 0,
      largoPlazo: 0
    };

    solicitudes.forEach(sol => {
      if (sol.Fecha_inicio_sol && sol.Fecha_termino_sol) {
        solicitudesPorTipo.largoPlazo++;
      } else {
        solicitudesPorTipo.diarias++;
      }
    });

    const usuariosPorTipo = {
      alumnos: 0,
      profesores: 0,
      administradores: 0
    };

    usuarios.forEach(user => {
      const tipo = user.tipoUsuario?.Descripcion;
      if (tipo === "Alumno") usuariosPorTipo.alumnos++;
      else if (tipo === "Profesor") usuariosPorTipo.profesores++;
      else if (tipo === "Administrador") usuariosPorTipo.administradores++;
    });

    const doc = new PDFDocument({ size: "letter", margin: 40 });

    // Encabezado
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("REPORTE DE ESTADÍSTICAS GENERALES", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Universidad del Bío-Bío - SIREC", { align: "center" })
      .text(`Fecha de generación: ${new Date().toLocaleString("es-CL")}`, { align: "center" })
      .moveDown(2);

    // Estadísticas principales
    doc.fontSize(14).font("Helvetica-Bold").text("📊 Resumen General", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica")
      .text(`Total de Solicitudes: ${totalSolicitudes}`)
      .text(`Total de Préstamos: ${totalPrestamos}`)
      .text(`Total de Devoluciones: ${totalDevoluciones}`)
      .text(`Total de Equipos: ${totalEquipos}`)
      .text(`Equipos Disponibles: ${equiposDisponibles}`)
      .text(`Equipos en Préstamo: ${totalEquipos - equiposDisponibles}`)
      .moveDown(1);

    // Tasa de disponibilidad
    const tasaDisponibilidad = ((equiposDisponibles / totalEquipos) * 100).toFixed(2);
    doc.fontSize(11).font("Helvetica-Bold")
      .text(`Tasa de Disponibilidad: ${tasaDisponibilidad}%`)
      .moveDown(2);

    // Gráfico 1: Solicitudes por Estado (Gráfico de Barras)
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").text("📊 Solicitudes por Estado", { align: "center" });
    doc.moveDown(1);

    const chartX = 80;
    const chartY = 150;
    const chartWidth = 400;
    const chartHeight = 200;
    const maxValue = Math.max(...Object.values(solicitudesPorEstado));
    const barWidth = chartWidth / Object.keys(solicitudesPorEstado).length;

    // Dibujar ejes
    doc.strokeColor("#000000").lineWidth(2);
    doc.moveTo(chartX, chartY + chartHeight).lineTo(chartX + chartWidth, chartY + chartHeight).stroke(); // Eje X
    doc.moveTo(chartX, chartY).lineTo(chartX, chartY + chartHeight).stroke(); // Eje Y

    // Dibujar barras
    const colors = ["#FFD93D", "#36A2EB", "#4BC0C0", "#9966FF", "#FF6384"];
    const estados = ["pendientes", "listoParaEntregar", "entregados", "devueltos", "rechazados"];
    const etiquetas = ["Pendientes", "Listo p/Entregar", "Entregados", "Devueltos", "Rechazados"];

    estados.forEach((estado, index) => {
      const value = solicitudesPorEstado[estado];
      const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
      const x = chartX + (index * barWidth) + 10;
      const y = chartY + chartHeight - barHeight;

      // Dibujar barra
      doc.fillColor(colors[index]).rect(x, y, barWidth - 20, barHeight).fill();

      // Etiqueta del valor
      doc.fillColor("#000000").fontSize(10).font("Helvetica-Bold");
      doc.text(value.toString(), x + (barWidth - 20) / 2 - 5, y - 15);

      // Etiqueta del eje X
      doc.fontSize(8).font("Helvetica");
      doc.text(etiquetas[index], x - 5, chartY + chartHeight + 10, { width: barWidth, align: "center" });
    });

    // Gráfico 2: Tipos de Solicitud (Gráfico de Torta Simple)
    doc.moveDown(8);
    doc.fontSize(14).font("Helvetica-Bold").text("📊 Tipos de Solicitud", { align: "center" });
    doc.moveDown(1);

    const pieX = 300;
    const pieY = 450;
    const pieRadius = 60;
    const totalTipos = solicitudesPorTipo.diarias + solicitudesPorTipo.largoPlazo;

    if (totalTipos > 0) {
      const anguloInicioDiarias = 0;
      const anguloFinDiarias = (solicitudesPorTipo.diarias / totalTipos) * 360;
      const anguloInicioLargo = anguloFinDiarias;
      const anguloFinLargo = 360;

      // Dibujar sectores
      if (solicitudesPorTipo.diarias > 0) {
        doc.fillColor("#36A2EB");
        drawPieSlice(doc, pieX, pieY, pieRadius, anguloInicioDiarias, anguloFinDiarias);
      }

      if (solicitudesPorTipo.largoPlazo > 0) {
        doc.fillColor("#FF9F40");
        drawPieSlice(doc, pieX, pieY, pieRadius, anguloInicioLargo, anguloFinLargo);
      }

      // Leyenda
      doc.fillColor("#36A2EB").rect(150, 440, 15, 15).fill();
      doc.fillColor("#000000").fontSize(10).font("Helvetica");
      doc.text(`Diarias: ${solicitudesPorTipo.diarias}`, 170, 443);

      doc.fillColor("#FF9F40").rect(150, 460, 15, 15).fill();
      doc.fillColor("#000000");
      doc.text(`Largo Plazo: ${solicitudesPorTipo.largoPlazo}`, 170, 463);
    }

    // Gráfico 3: Usuarios por Tipo (Nueva página)
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").text("👥 Usuarios por Tipo", { align: "center" });
    doc.moveDown(1);

    const userChartX = 80;
    const userChartY = 150;
    const userChartWidth = 400;
    const userChartHeight = 200;
    const maxUsers = Math.max(...Object.values(usuariosPorTipo));
    const userBarWidth = userChartWidth / Object.keys(usuariosPorTipo).length;

    // Dibujar ejes
    doc.strokeColor("#000000").lineWidth(2);
    doc.moveTo(userChartX, userChartY + userChartHeight).lineTo(userChartX + userChartWidth, userChartY + userChartHeight).stroke();
    doc.moveTo(userChartX, userChartY).lineTo(userChartX, userChartY + userChartHeight).stroke();

    // Dibujar barras de usuarios
    const userColors = ["#36A2EB", "#FFD93D", "#9966FF"];
    const tiposUsuario = ["alumnos", "profesores", "administradores"];
    const etiquetasUsuario = ["Alumnos", "Profesores", "Administradores"];

    tiposUsuario.forEach((tipo, index) => {
      const value = usuariosPorTipo[tipo];
      const barHeight = maxUsers > 0 ? (value / maxUsers) * userChartHeight : 0;
      const x = userChartX + (index * userBarWidth) + 50;
      const y = userChartY + userChartHeight - barHeight;

      // Dibujar barra
      doc.fillColor(userColors[index]).rect(x, y, userBarWidth - 100, barHeight).fill();

      // Etiqueta del valor
      doc.fillColor("#000000").fontSize(12).font("Helvetica-Bold");
      doc.text(value.toString(), x + (userBarWidth - 100) / 2 - 5, y - 20);

      // Etiqueta del eje X
      doc.fontSize(10).font("Helvetica");
      doc.text(etiquetasUsuario[index], x - 20, userChartY + userChartHeight + 15, { width: userBarWidth - 60, align: "center" });
    });

    // Resumen final
    doc.moveDown(8);
    doc.fontSize(12).font("Helvetica-Bold").text("📋 Resumen Ejecutivo", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`• Se han registrado ${totalSolicitudes} solicitudes en total`);
    doc.text(`• ${solicitudesPorEstado.entregados} equipos han sido entregados exitosamente`);
    doc.text(`• La tasa de disponibilidad de equipos es del ${tasaDisponibilidad}%`);
    doc.text(`• ${usuariosPorTipo.alumnos} alumnos están registrados en el sistema`);
    doc.text(`• ${solicitudesPorTipo.largoPlazo} solicitudes son de largo plazo vs ${solicitudesPorTipo.diarias} diarias`);

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
      case 3: return "Entregado";
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
      case 3: return "Entregado";
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
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("user.carrera", "carrera")
      .leftJoinAndSelect("user.cargo", "cargo")
      .orderBy("user.createdAt", "DESC");

    // Aplicar filtros
    if (filtros.tipoUsuario) {
      queryBuilder.andWhere("tipoUsuario.Tipo = :tipoUsuario", { 
        tipoUsuario: filtros.tipoUsuario 
      });
    }

    const usuarios = await queryBuilder.getMany();

    // Crear PDF
    const doc = new PDFDocument({ size: "letter", margin: 40 });

    // Encabezado
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("REPORTE DE USUARIOS", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Universidad del Bío-Bío - SIREC", { align: "center" })
      .text(`Fecha de generación: ${new Date().toLocaleString("es-CL")}`, { align: "center" })
      .moveDown(1);

    // Filtros aplicados
    if (filtros.tipoUsuario) {
      doc.fontSize(9).font("Helvetica-Bold").text("Filtros aplicados:", { underline: true });
      doc.font("Helvetica").text(`Tipo de Usuario: ${filtros.tipoUsuario}`);
      doc.moveDown(1);
    }

    // Estadísticas
    const alumnosCount = usuarios.filter(u => u.tipoUsuario?.Descripcion === "Alumno").length;
    const profesoresCount = usuarios.filter(u => u.tipoUsuario?.Descripcion === "Profesor").length;
    const adminsCount = usuarios.filter(u => u.tipoUsuario?.Descripcion === "Administrador").length;

    doc.fontSize(11).font("Helvetica-Bold").text("Resumen:");
    doc.font("Helvetica")
      .text(`Total de Usuarios: ${usuarios.length}`)
      .text(`Alumnos: ${alumnosCount}`)
      .text(`Profesores: ${profesoresCount}`)
      .text(`Administradores: ${adminsCount}`)
      .moveDown(1);

    // Tabla de usuarios
    usuarios.forEach((usuario, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      const carreraOCargo = usuario.tipoUsuario?.Cod_TipoUsuario === 2 
        ? usuario.carrera?.Nombre || "Sin carrera"
        : usuario.tipoUsuario?.Cod_TipoUsuario === 3 
        ? usuario.cargo?.Nombre || "Sin cargo"
        : "-";

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${usuario.Nombre} ${usuario.Apellido}`, { continued: false })
        .font("Helvetica")
        .text(`RUT: ${usuario.Rut}`)
        .text(`Email: ${usuario.Email}`)
        .text(`Tipo: ${usuario.tipoUsuario?.Descripcion || "N/A"}`)
        .text(`${usuario.tipoUsuario?.Cod_TipoUsuario === 2 ? "Carrera" : "Cargo"}: ${carreraOCargo}`)
        .text(`Fecha Registro: ${new Date(usuario.createdAt).toLocaleDateString("es-CL")}`)
        .moveDown(0.5);
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
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.tipoUsuario", "tipoUsuario")
      .leftJoinAndSelect("user.carrera", "carrera")
      .leftJoinAndSelect("user.cargo", "cargo")
      .orderBy("user.createdAt", "DESC");

    if (filtros.tipoUsuario) {
      queryBuilder.andWhere("tipoUsuario.Tipo = :tipoUsuario", { 
        tipoUsuario: filtros.tipoUsuario 
      });
    }

    const usuarios = await queryBuilder.getMany();

    // Crear CSV
    let csv = "\uFEFFRUT,Nombre,Apellido,Email,Tipo Usuario,Carrera/Cargo,Fecha Registro\n";
    
    usuarios.forEach(usuario => {
      const carreraOCargo = usuario.tipoUsuario?.Cod_TipoUsuario === 2 
        ? usuario.carrera?.Nombre || "Sin carrera"
        : usuario.tipoUsuario?.Cod_TipoUsuario === 3 
        ? usuario.cargo?.Nombre || "Sin cargo"
        : "-";
      
      csv += `${usuario.Rut},`;
      csv += `"${usuario.Nombre}",`;
      csv += `"${usuario.Apellido}",`;
      csv += `${usuario.Email},`;
      csv += `"${usuario.tipoUsuario?.Descripcion || "N/A"}",`;
      csv += `"${carreraOCargo}",`;
      csv += `${new Date(usuario.createdAt).toLocaleDateString("es-CL")}\n`;
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
export async function obtenerDatosGraficos() {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    const equiposRepository = AppDataSource.getRepository(Equipos);
    const userRepository = AppDataSource.getRepository(User);

    // Solicitudes por estado
    const solicitudes = await solicitudRepository
      .createQueryBuilder("solicitud")
      .leftJoinAndSelect("solicitud.prestamo", "prestamo")
      .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstados")
      .leftJoinAndSelect("tieneEstados.estadoPrestamo", "estadoPrestamo")
      .getMany();

    const solicitudesPorEstado = {
      pendientes: 0,
      listoParaEntregar: 0,
      entregados: 0,
      devueltos: 0,
      rechazados: 0
    };

    solicitudes.forEach(sol => {
      const estado = obtenerEstadoSolicitud(sol);
      if (estado === "Pendiente") solicitudesPorEstado.pendientes++;
      else if (estado === "Listo para Entregar") solicitudesPorEstado.listoParaEntregar++;
      else if (estado === "Entregado") solicitudesPorEstado.entregados++;
      else if (estado === "Devuelto") solicitudesPorEstado.devueltos++;
      else if (estado === "Rechazado") solicitudesPorEstado.rechazados++;
    });

    // Solicitudes por tipo
    const solicitudesPorTipo = {
      diarias: 0,
      largoPlazo: 0
    };

    solicitudes.forEach(sol => {
      if (sol.Fecha_inicio_sol && sol.Fecha_termino_sol) {
        solicitudesPorTipo.largoPlazo++;
      } else {
        solicitudesPorTipo.diarias++;
      }
    });

    // Equipos por categoría
    const equipos = await equiposRepository
      .createQueryBuilder("equipo")
      .leftJoinAndSelect("equipo.categoria", "categoria")
      .getMany();

    const equiposPorCategoria = {};
    equipos.forEach(eq => {
      const categoria = eq.categoria?.Descripcion || "Sin categoría";
      equiposPorCategoria[categoria] = (equiposPorCategoria[categoria] || 0) + 1;
    });

    // Usuarios por tipo
    const usuarios = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.tipoUsuario", "tipoUsuario")
      .getMany();

    const usuariosPorTipo = {
      alumnos: 0,
      profesores: 0,
      administradores: 0
    };

    usuarios.forEach(user => {
      const tipo = user.tipoUsuario?.Descripcion;
      if (tipo === "Alumno") usuariosPorTipo.alumnos++;
      else if (tipo === "Profesor") usuariosPorTipo.profesores++;
      else if (tipo === "Administrador") usuariosPorTipo.administradores++;
    });

    // Solicitudes por mes (últimos 6 meses)
    const haceSeismeses = new Date();
    haceSeismeses.setMonth(haceSeismeses.getMonth() - 6);

    const solicitudesPorMes = await solicitudRepository
      .createQueryBuilder("solicitud")
      .select("DATE_TRUNC('month', solicitud.Fecha_Sol)", "mes")
      .addSelect("COUNT(*)", "cantidad")
      .where("solicitud.Fecha_Sol >= :fecha", { fecha: haceSeismeses })
      .groupBy("DATE_TRUNC('month', solicitud.Fecha_Sol)")
      .orderBy("DATE_TRUNC('month', solicitud.Fecha_Sol)", "ASC")
      .getRawMany();

    return {
      solicitudesPorEstado,
      solicitudesPorTipo,
      equiposPorCategoria,
      usuariosPorTipo,
      solicitudesPorMes
    };
  } catch (error) {
    console.error("Error al obtener datos para gráficos:", error);
    throw error;
  }
}
