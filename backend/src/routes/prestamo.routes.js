"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createPrestamo,
  getPrestamo,
  getPrestamos,
  getPrestamosPorUsuario,
  getPrestamosActivos,
  updatePrestamo,
  finalizarPrestamo,
  deletePrestamo,
} from "../controllers/prestamo.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (para usuarios autenticados)
router.post("/", createPrestamo); // Cualquier usuario autenticado puede crear una solicitud
router.get("/activos", getPrestamosActivos);
router.get("/usuario/mis-prestamos", getPrestamosPorUsuario); // Obtener préstamos del usuario autenticado
router.get("/usuario/:rut", getPrestamosPorUsuario);
router.get("/:id", getPrestamo);

// Rutas que requieren permisos de administrador
router.use(isAdmin);
router.get("/", getPrestamos);
router.put("/:id", updatePrestamo);
router.patch("/:id/finalizar", finalizarPrestamo);
router.delete("/:id", deletePrestamo);

export default router;
