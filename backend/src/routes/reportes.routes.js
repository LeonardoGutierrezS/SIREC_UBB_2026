"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  descargarReporteSolicitudesPDF,
  descargarReporteSolicitudesCSV,
  descargarReportePrestamosPDF,
  descargarReportePrestamosCSV,
  descargarReporteEquiposPDF,
  descargarReporteEquiposCSV,
  descargarReporteEstadisticasPDF,
  descargarReporteUsuariosPDF,
  descargarReporteUsuariosCSV,
  obtenerDatosGraficosController,
} from "../controllers/reportes.controller.js";

const router = Router();

// Aplicar autenticación y autorización de admin a todas las rutas
router.use(authenticateJwt);
router.use(isAdmin);

// Rutas de reportes
router
  .get("/solicitudes/pdf", descargarReporteSolicitudesPDF)
  .get("/solicitudes/csv", descargarReporteSolicitudesCSV)
  .get("/prestamos/pdf", descargarReportePrestamosPDF)
  .get("/prestamos/csv", descargarReportePrestamosCSV)
  .get("/equipos/pdf", descargarReporteEquiposPDF)
  .get("/equipos/csv", descargarReporteEquiposCSV)
  .get("/estadisticas/pdf", descargarReporteEstadisticasPDF)
  .get("/usuarios/pdf", descargarReporteUsuariosPDF)
  .get("/usuarios/csv", descargarReporteUsuariosCSV)
  .get("/graficos", obtenerDatosGraficosController);

export default router;
