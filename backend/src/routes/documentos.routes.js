"use strict";
import { Router } from "express";
import { subirActa, descargarActa, getInfoActa, updateCondiciones } from "../controllers/documentos.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadActa } from "../middlewares/upload.middleware.js";

const router = Router();

// Todas las rutas de documentos requieren estar autenticado
router.use(authenticateJwt);

// Obtener info para el acta (GET)
// Usamos el ID de solicitud porque es la etapa previa a la generación
router.get("/acta/solicitud/:idSolicitud", getInfoActa);

// Actualizar condiciones del acta (PATCH)
router.patch("/acta/condiciones/:id", updateCondiciones);

// Subir acta firmada (PATCH)
router.patch("/acta/subir/:id", uploadActa, subirActa);

// Descargar acta (GET)
router.get("/acta/descargar/:id", descargarActa);

export default router;
