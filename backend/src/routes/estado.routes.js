"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createEstado,
  getEstado,
  getEstados,
  updateEstado,
  deleteEstado,
} from "../controllers/estado.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (para usuarios autenticados)
router.get("/", getEstados);
router.get("/:id", getEstado);

// Rutas protegidas (solo administradores)
router.use(isAdmin);
router.post("/", createEstado);
router.put("/:id", updateEstado);
router.delete("/:id", deleteEstado);

export default router;
