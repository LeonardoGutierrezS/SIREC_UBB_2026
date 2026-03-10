"use strict";

/**
 * Autor: Leonardo Gutierrez
 * Proyecto: SIREC UBB
 * Versión: 5.0.0
 * Año: 2026
 */
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import indexRoutes from "./routes/index.routes.js";
import session from "express-session";
import passport from "passport";
import express, { json, urlencoded } from "express";
import { cookieKey, HOST, PORT } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import {
  
  createCargos,
  createCarreras,
  createCategorias,
  createEquipos,
  createEstados,
  createEstadosPrestamo,
  createMarcas,
  createPenalizaciones,
  createTiposUsuario,
  createUsers,

} from "./config/initialSetup.js";
import { passportJwtSetup } from "./auth/passport.auth.js";
import { startCronJobs } from "./services/tareasProgramadas.service.js";

async function setupServer() {
  try {
    const app = express();

    app.disable("x-powered-by");

    app.use(
      cors({
        credentials: true,
        origin: true,
      }),
    );

    app.use(
      urlencoded({
        extended: true,
        limit: "1mb",
      }),
    );

    app.use(
      json({
        limit: "1mb",
      }),
    );

    app.use(cookieParser());

    // Configurar morgan para mostrar fecha y hora
    morgan.token('date', () => {
      // Retorna la fecha y hora local ajustada (ej: 06/03/2026, 20:56:15)
      return new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
    });
    
    app.use(morgan('[:date] :method :url :status :response-time ms - :res[content-length]', {
      skip: (req, res) => {
        const url = req.baseUrl + req.path;
        // Omitir logs de polling para las burbujas de notificación (sólo si son exitosos)
        const isPollingPath = url.includes('/api/user/pending') || url.includes('/api/solicitud');
        const isSuccess = res.statusCode === 200 || res.statusCode === 304;
        return isPollingPath && isSuccess;
      }
    }));

    // Servir archivos estáticos (logos para emails)
    app.use('/public', express.static('public'));

    app.use(
      session({
        secret: cookieKey,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          sameSite: "strict",
        },
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passportJwtSetup();

    app.use("/api", indexRoutes);

    app.listen(PORT, () => {
      console.log(`=> Servidor corriendo en ${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.log("Error en index.js -> setupServer(), el error es: ", error);
  }
}

async function setupAPI() {
  try {
    await connectDB();
    await setupServer();
    await createTiposUsuario();
    await createCarreras();
    await createMarcas();
    await createCategorias();
    await createEstados();
    await createEstadosPrestamo();
    await createCargos();
    await createUsers();
    await createEquipos();
    await createPenalizaciones();
    startCronJobs();
  } catch (error) {
    console.log("Error en index.js -> setupAPI(), el error es: ", error);
  }
}

setupAPI()
  .then(() => console.log("=> API Iniciada exitosamente"))
  .catch((error) =>
    console.log("Error en index.js -> setupAPI(), el error es: ", error),
  );