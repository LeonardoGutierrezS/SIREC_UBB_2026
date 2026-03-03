"use strict";
import {
  generarReporteSolicitudesPDF,
  generarReporteSolicitudesCSV,
  generarReportePrestamosPDF,
  generarReportePrestamosCSV,
  generarReporteEquiposPDF,
  generarReporteEquiposCSV,
  generarReporteEstadisticasPDF,
  generarReporteUsuariosPDF,
  generarReporteUsuariosCSV,
  obtenerDatosGraficos,
} from "../services/reportes.service.js";
import { handleErrorServer } from "../handlers/responseHandlers.js";

/**
 * Descargar reporte de solicitudes en PDF
 */
export async function descargarReporteSolicitudesPDF(req, res) {
  try {
    const { fechaInicio, fechaFin, tipoUsuario, cargo } = req.query;
    
    const filtros = {};
    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    if (fechaFin) filtros.fechaFin = fechaFin;
    if (tipoUsuario) filtros.tipoUsuario = tipoUsuario;
    if (cargo) filtros.cargo = cargo;

    const doc = await generarReporteSolicitudesPDF(filtros);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-solicitudes-${new Date().getTime()}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error al descargar reporte de solicitudes PDF:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar reporte de solicitudes en CSV
 */
export async function descargarReporteSolicitudesCSV(req, res) {
  try {
    const { fechaInicio, fechaFin, tipoUsuario, cargo } = req.query;
    
    const filtros = {};
    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    if (fechaFin) filtros.fechaFin = fechaFin;
    if (tipoUsuario) filtros.tipoUsuario = tipoUsuario;
    if (cargo) filtros.cargo = cargo;

    const csv = await generarReporteSolicitudesCSV(filtros);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-solicitudes-${new Date().getTime()}.csv`
    );

    res.send("\uFEFF" + csv); // BOM para UTF-8
  } catch (error) {
    console.error("Error al descargar reporte de solicitudes CSV:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar reporte de préstamos en PDF
 */
export async function descargarReportePrestamosPDF(req, res) {
  try {
    const { fechaInicio, fechaFin, tipoUsuario, rut } = req.query;
    
    const filtros = {};
    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    if (fechaFin) filtros.fechaFin = fechaFin;
    if (tipoUsuario) filtros.tipoUsuario = tipoUsuario;
    if (rut) filtros.rut = rut;

    const doc = await generarReportePrestamosPDF(filtros);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-prestamos-${new Date().getTime()}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error al descargar reporte de préstamos PDF:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar reporte de préstamos en CSV
 */
export async function descargarReportePrestamosCSV(req, res) {
  try {
    const { fechaInicio, fechaFin, tipoUsuario, rut } = req.query;
    
    const filtros = {};
    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    if (fechaFin) filtros.fechaFin = fechaFin;
    if (tipoUsuario) filtros.tipoUsuario = tipoUsuario;
    if (rut) filtros.rut = rut;

    const csv = await generarReportePrestamosCSV(filtros);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-prestamos-${new Date().getTime()}.csv`
    );

    res.send("\uFEFF" + csv);
  } catch (error) {
    console.error("Error al descargar reporte de préstamos CSV:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar reporte de equipos en PDF
 */
export async function descargarReporteEquiposPDF(req, res) {
  try {
    const doc = await generarReporteEquiposPDF();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-equipos-${new Date().getTime()}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error al descargar reporte de equipos PDF:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar reporte de equipos en CSV
 */
export async function descargarReporteEquiposCSV(req, res) {
  try {
    const csv = await generarReporteEquiposCSV();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-equipos-${new Date().getTime()}.csv`
    );

    res.send("\uFEFF" + csv);
  } catch (error) {
    console.error("Error al descargar reporte de equipos CSV:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar reporte de estadísticas generales en PDF
 */
export async function descargarReporteEstadisticasPDF(req, res) {
  try {
    const { meses, fechaInicio, fechaFin, carrera, categoria } = req.query;
    const filtros = {
      meses: meses ? parseInt(meses) : 6,
      fechaInicio,
      fechaFin,
      carrera,
      categoria
    };
    const doc = await generarReporteEstadisticasPDF(filtros);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-estadisticas-${new Date().getTime()}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error al descargar reporte de estadísticas PDF:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar reporte de usuarios en PDF
 */
export async function descargarReporteUsuariosPDF(req, res) {
  try {
    const { tipoUsuario, carrera } = req.query;
    
    const filtros = {};
    if (tipoUsuario) filtros.tipoUsuario = tipoUsuario;
    if (carrera) filtros.carrera = carrera;

    const doc = await generarReporteUsuariosPDF(filtros);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-usuarios-${new Date().getTime()}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error al descargar reporte de usuarios PDF:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar reporte de usuarios en CSV
 */
export async function descargarReporteUsuariosCSV(req, res) {
  try {
    const { tipoUsuario, carrera } = req.query;
    
    const filtros = {};
    if (tipoUsuario) filtros.tipoUsuario = tipoUsuario;
    if (carrera) filtros.carrera = carrera;

    const csv = await generarReporteUsuariosCSV(filtros);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-usuarios-${new Date().getTime()}.csv`
    );

    res.send(csv);
  } catch (error) {
    console.error("Error al descargar reporte de usuarios CSV:", error);
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener datos para gráficos
 */
export async function obtenerDatosGraficosController(req, res) {
  try {
    const { meses, fechaInicio, fechaFin, carrera, categoria } = req.query;
    const datos = await obtenerDatosGraficos({ 
      meses: meses ? parseInt(meses) : 6,
      fechaInicio,
      fechaFin,
      carrera,
      categoria
    });
    res.status(200).json({
      status: "Success",
      data: datos
    });
  } catch (error) {
    console.error("Error al obtener datos para gráficos:", error);
    handleErrorServer(res, 500, error.message);
  }
}
