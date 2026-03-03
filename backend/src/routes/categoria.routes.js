"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createCategoria,
  getCategoria,
  getCategorias,
  updateCategoria,
  deleteCategoria,
} from "../controllers/categoria.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (para usuarios autenticados)
router.get("/", getCategorias);
router.get("/:id", getCategoria);

// Rutas protegidas (solo administradores)
router.use(isAdmin);
router.post("/", createCategoria);
router.put("/:id", updateCategoria);
router.delete("/:id", deleteCategoria);

export default router;
