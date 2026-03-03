"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createTipoUsuarioController,
  deleteTipoUsuarioController,
  getTiposUsuarioController,
  getTipoUsuarioController,
  updateTipoUsuarioController,
} from "../controllers/tipo_usuario.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (autenticadas) - consulta
router
  .get("/", getTiposUsuarioController)
  .get("/:cod", getTipoUsuarioController);

// Rutas de administrador - modificación
router.use(isAdmin);

router
  .post("/", createTipoUsuarioController)
  .patch("/:cod", updateTipoUsuarioController)
  .delete("/:cod", deleteTipoUsuarioController);

export default router;
