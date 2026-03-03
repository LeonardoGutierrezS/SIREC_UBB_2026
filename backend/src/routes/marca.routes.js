"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createMarca,
  getMarca,
  getMarcas,
  updateMarca,
  deleteMarca,
} from "../controllers/marca.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (para usuarios autenticados)
router.get("/", getMarcas);
router.get("/:id", getMarca);

// Rutas protegidas (solo administradores)
router.use(isAdmin);
router.post("/", createMarca);
router.put("/:id", updateMarca);
router.delete("/:id", deleteMarca);

export default router;
