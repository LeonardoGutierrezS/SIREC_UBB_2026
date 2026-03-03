"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  createSolicitudController,
  getSolicitudesController,
  getSolicitudesPorUsuarioController,
  getMisSolicitudesController,
  getSolicitudesPorPrestamoController,
  getSolicitudController,
  deleteSolicitudController,
  descargarPDFAutorizacionController,
} from "../controllers/solicitud.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .post("/", createSolicitudController)
  .get("/", getSolicitudesController)
  .get("/mis-solicitudes", getMisSolicitudesController)
  .get("/prestamo/:idPrestamo", getSolicitudesPorPrestamoController)
  .get("/usuario/:rut", getSolicitudesPorUsuarioController)
  .get("/:idSolicitud/pdf", descargarPDFAutorizacionController)
  .get("/:idSolicitud", getSolicitudController)
  .delete("/:idSolicitud", deleteSolicitudController);

export default router;
