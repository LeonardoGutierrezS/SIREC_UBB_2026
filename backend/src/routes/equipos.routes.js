"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
cambiarDisponibilidadEquipo,
createEquipo,
deleteEquipo,
getEquipo,
getEquipos,
getEquiposDisponibles,
getEquiposPorCategoria,
updateEquipo,


} from "../controllers/equipos.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas públicas (para usuarios autenticados)
router.get("/", getEquipos);
router.get("/disponibles", getEquiposDisponibles);
router.get("/categoria/:categoriaId", getEquiposPorCategoria);
router.get("/:id", getEquipo);

// Rutas protegidas (solo administradores)
router.use(isAdmin);
router.post("/", createEquipo);
router.put("/:id", updateEquipo);
router.patch("/:id/disponibilidad", cambiarDisponibilidadEquipo);
router.delete("/:id", deleteEquipo);

export default router;
