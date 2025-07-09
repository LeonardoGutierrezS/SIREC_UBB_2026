"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import equipoRoutes from "./equipo.routes.js";
import pdfEquiposroutes from "./PDFequipos.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/equipo", equipoRoutes)
    .use("/pdf/equipos", pdfEquiposroutes);

export default router;