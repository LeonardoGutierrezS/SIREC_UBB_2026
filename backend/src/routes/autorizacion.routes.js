"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrDirector } from "../middlewares/authorization.middleware.js";
import {
  aprobarSolicitudController,
  getAutorizacionesController,
  rechazarSolicitudController,
} from "../controllers/autorizacion.controller.js";

const router = Router();

router.use(authenticateJwt);
router.use(isAdminOrDirector);

router
  .post("/aprobar", aprobarSolicitudController)
  .post("/rechazar", rechazarSolicitudController)
  .get("/", getAutorizacionesController);

export default router;
