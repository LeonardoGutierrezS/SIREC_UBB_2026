"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  asignarPenalizacionController,
  finalizarPenalizacionController,
  getPenalizacionesActivasController,
  getPenalizacionesPorUsuarioController,
  getTienePenalizacionesController,
} from "../controllers/tiene_penalizacion.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (autenticadas)
router
  .get("/usuario/:rut", getPenalizacionesPorUsuarioController)
  .get("/activas/:rut", getPenalizacionesActivasController);

// Rutas de administrador
router.use(isAdmin);

router
  .post("/", asignarPenalizacionController)
  .get("/", getTienePenalizacionesController)
  .patch("/:id/finalizar", finalizarPenalizacionController);

export default router;
