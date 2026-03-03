"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createEspecificacionController,
  getEspecificacionesPorEquipoController,
  updateEspecificacionController,
  deleteEspecificacionController,
} from "../controllers/especificaciones_hw.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (autenticadas) - consulta
router.get("/equipo/:idNumInv", getEspecificacionesPorEquipoController);

// Rutas de administrador - modificación
router.use(isAdmin);

router
  .post("/", createEspecificacionController)
  .patch("/:id", updateEspecificacionController)
  .delete("/:id", deleteEspecificacionController);

export default router;
