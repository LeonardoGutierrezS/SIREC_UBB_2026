"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createCarrera,
  getCarrera,
  getCarreras,
  updateCarrera,
  deleteCarrera,
} from "../controllers/carrera.controller.js";

const router = Router();

// Ruta pública (sin autenticación para registro)
router.get("/", getCarreras);

// Rutas que requieren autenticación
router.get("/:id", authenticateJwt, getCarrera);

// Rutas protegidas (solo administradores)
router.post("/", authenticateJwt, isAdmin, createCarrera);
router.put("/:id", authenticateJwt, isAdmin, updateCarrera);
router.delete("/:id", authenticateJwt, isAdmin, deleteCarrera);

export default router;
