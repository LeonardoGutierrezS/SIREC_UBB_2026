"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  createTieneEstadoController,
  getEstadoActualController,
  getHistorialEstadosController,
} from "../controllers/tiene_estado.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .post("/", createTieneEstadoController)
  .get("/historial/:idEquipo", getHistorialEstadosController)
  .get("/actual/:idEquipo", getEstadoActualController);

export default router;
