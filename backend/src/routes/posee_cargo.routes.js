"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createPoseeCargoController,
  getCargosPorUsuarioController,
  getCargoActualController,
  finalizarCargoController,
  deletePoseeCargoController,
} from "../controllers/posee_cargo.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (autenticadas) - consulta
router
  .get("/usuario/:rut", getCargosPorUsuarioController)
  .get("/actual/:rut", getCargoActualController);

// Rutas de administrador - modificación
router.use(isAdmin);

router
  .post("/", createPoseeCargoController)
  .patch("/finalizar/:rut/:idCargo", finalizarCargoController)
  .delete("/:rut/:idCargo", deletePoseeCargoController);

export default router;
