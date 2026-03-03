"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createPoseeCarreraController,
  getCarreraPorUsuarioController,
  getEstudiantesPorCarreraController,
  updateAnioIngresoController,
  deletePoseeCarreraController,
} from "../controllers/posee_carrera.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (autenticadas) - consulta
router
  .get("/usuario/:rut", getCarreraPorUsuarioController)
  .get("/carrera/:idCarrera/estudiantes", getEstudiantesPorCarreraController);

// Rutas de administrador - modificación
router.use(isAdmin);

router
  .post("/", createPoseeCarreraController)
  .patch("/:rut/:idCarrera", updateAnioIngresoController)
  .delete("/:rut/:idCarrera", deletePoseeCarreraController);

export default router;
