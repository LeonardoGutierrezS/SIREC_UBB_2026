import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { 
  downloadEquiposPDF, 
  previewEquiposPDF 
} from "../controllers/PDFequipos.controller.js";

const router = Router();

router
  .use(authenticateJwt)
  .use(isAdmin);

router
  .get("/download", downloadEquiposPDF)
  .get("/preview", previewEquiposPDF);

export default router;