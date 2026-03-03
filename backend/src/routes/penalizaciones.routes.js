"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createPenalizacionController,
  deletePenalizacionController,
  getPenalizacionController,
  getPenalizacionesController,
  updatePenalizacionController,
} from "../controllers/penalizaciones.controller.js";

const router = Router();

router.use(authenticateJwt);
router.use(isAdmin);

router
  .post("/", createPenalizacionController)
  .get("/", getPenalizacionesController)
  .get("/:id", getPenalizacionController)
  .patch("/:id", updatePenalizacionController)
  .delete("/:id", deletePenalizacionController);

export default router;
