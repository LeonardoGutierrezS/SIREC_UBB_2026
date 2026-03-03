"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
    devolverPrestamoController,
    entregarPrestamoController,
} from "../controllers/prestamo-acciones.controller.js";

const router = Router();

router.use(authenticateJwt);
router.use(isAdmin); // Solo admin puede entregar y recibir equipos

router
  .post("/:idPrestamo/entregar", entregarPrestamoController)
  .post("/:idPrestamo/devolver", devolverPrestamoController);

export default router;
