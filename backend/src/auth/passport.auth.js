"use strict";
import passport from "passport";
import User from "../entity/user.entity.js";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { AppDataSource } from "../config/configDb.js";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: {
          Correo: jwt_payload.email,
        },
        relations: ["tipoUsuario", "carrera", "cargo"],
      });

      if (user) {
        // Verificar si tiene cargo activo de Director de Escuela
        let esDirectorEscuela = false;
        
        // Cargar los cargos del usuario para verificar si es director
        const poseesCargosRepository = AppDataSource.getRepository("PoseeCargo");
        const cargosActivos = await poseesCargosRepository.find({
            where: { Rut_profesor: user.Rut, Fecha_Fin: null },
            relations: ["cargo"]
        });
        
        const cargoActivo = cargosActivos.length > 0 ? cargosActivos[0] : null;
        if (cargoActivo && (cargoActivo.cargo?.ID_Cargo === 1 || cargoActivo.cargo?.ID_Cargo === 2)) {
            esDirectorEscuela = true;
        }

        // Crear objeto con la estructura esperada por los middlewares
        const userPayload = {
          rut: user.Rut,
          email: user.Correo,
          nombreCompleto: user.Nombre_Completo,
          tipoUsuario: user.tipoUsuario?.Descripcion,
          cargo: user.cargo?.Desc_Cargo,
          carrera: user.carrera?.Carrera,
          idCarrera: user.ID_Carrera, // Inyectado para filtrado de directores
          esDirectorEscuela: esDirectorEscuela, // Inyectado para acceso a vistas
          vigente: user.Vigente,
        };
        return done(null, userPayload);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }),
);

export function passportJwtSetup() {
  passport.initialize();
}
