"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createCargoController,
  deleteCargoController,
  getCargoController,
  getCargosController,
  updateCargoController,
} from "../controllers/cargo.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (autenticadas) - consulta
router
  .get("/", getCargosController)
  .get("/:id", getCargoController);

// Rutas de administrador - modificación
router.use(isAdmin);

router
  .post("/", createCargoController)
  .patch("/:id", updateCargoController)
  .delete("/:id", deleteCargoController);

export default router;
