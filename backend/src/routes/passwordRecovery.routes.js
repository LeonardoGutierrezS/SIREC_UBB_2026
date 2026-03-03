"use strict";
import { Router } from "express";
import {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} from "../controllers/passwordRecovery.controller.js";

const router = Router();

// Solicitar recuperación de contraseña
router.post("/request", requestPasswordReset);

// Verificar si un token es válido
router.get("/verify/:token", verifyResetToken);

// Resetear contraseña con token
router.post("/reset/:token", resetPassword);

export default router;
