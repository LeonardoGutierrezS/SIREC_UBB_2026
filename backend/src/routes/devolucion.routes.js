"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  getDevolucionController,
  getDevolucionesController,
  getDevolucionesPorUsuarioController,
  registrarDevolucionController,
} from "../controllers/devolucion.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .post("/", registrarDevolucionController)
  .get("/", getDevolucionesController)
  .get("/usuario/:rut", getDevolucionesPorUsuarioController)
  .get("/:id", getDevolucionController);

export default router;
