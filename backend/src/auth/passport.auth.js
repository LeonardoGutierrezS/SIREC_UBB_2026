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
        // Crear objeto con la estructura esperada por los middlewares
        const userPayload = {
          rut: user.Rut,
          email: user.Correo,
          nombreCompleto: user.Nombre_Completo,
          tipoUsuario: user.tipoUsuario?.Descripcion,
          cargo: user.cargo?.Desc_Cargo,
          carrera: user.carrera?.Carrera,
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
