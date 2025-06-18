import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
    createEquipo,
    deleteEquipo,
    getEquipo,
    getEquipos,
    updateEquipo,
} from "../controllers/equipo.controller.js";

const router = Router();
router
    .use(authenticateJwt)
    .use(isAdmin);
router
    .get("/", getEquipos)
    .get("/:id", getEquipo)
    .post("/", createEquipo)
    .patch("/:id", updateEquipo)
    .delete("/:id", deleteEquipo);
export default router;
export const equipoRoutes = router;