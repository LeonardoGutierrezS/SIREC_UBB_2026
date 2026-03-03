"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Middleware para verificar que el usuario tiene tipo de usuario administrador
 */
export async function isAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.email) {
      return handleErrorClient(
        res,
        401,
        "No autenticado",
        "No se encontró información del usuario en la petición",
      );
    }

    // Ya tenemos el tipo de usuario desde passport
    if (req.user.tipoUsuario?.toLowerCase() === "administrador") {
      next();
      return;
    }

    return handleErrorClient(
      res,
      403,
      "Error al acceder al recurso",
      "Se requiere tipo de usuario Administrador para realizar esta acción.",
    );
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

/**
 * Middleware para verificar que el usuario tiene cargo de Director de Escuela
 * Ahora Director de Escuela es un cargo, no un tipo de usuario
 */
export async function isDirector(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const poseeCargoRepository = AppDataSource.getRepository("PoseeCargo");

    const userFound = await userRepository.findOne({
      where: { Correo: req.user.email },
      relations: ["tipoUsuario"],
    });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    if (!userFound.Vigente) {
      return handleErrorClient(
        res,
        403,
        "Usuario no vigente",
        "El usuario no está habilitado para realizar acciones en el sistema.",
      );
    }

    // Verificar que sea profesor
    const tipoUsuarioDesc = userFound.tipoUsuario?.Descripcion;
    if (tipoUsuarioDesc?.toLowerCase() !== "profesor") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere ser Profesor con cargo de Director/a de Escuela para realizar esta acción.",
      );
    }

    // Verificar que tenga cargo de Director de Escuela (ID_Cargo = 1 o 2)
    const cargo = await poseeCargoRepository.findOne({
      where: [
        { Rut_profesor: userFound.Rut, ID_Cargo: 1, Fecha_Fin: null },
        { Rut_profesor: userFound.Rut, ID_Cargo: 2, Fecha_Fin: null }
      ],
      relations: ["cargo"],
    });

    if (!cargo) {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere cargo activo de Director/a de Escuela para realizar esta acción.",
      );
    }

    req.user.tipoUsuario = tipoUsuarioDesc;
    req.user.cargo = cargo.cargo?.Desc_Cargo || "Director/a de Escuela";
    req.user.idCarrera = userFound.ID_Carrera; // Para filtrar solicitudes
    req.user.rut = userFound.Rut;
    req.user.vigente = userFound.Vigente;
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

/**
 * Middleware para verificar que el usuario tiene rol de Alumno
 */
export async function isAlumno(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: { Correo: req.user.email },
      relations: ["tipoUsuario"],
    });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    if (!userFound.Vigente) {
      return handleErrorClient(
        res,
        403,
        "Usuario no vigente",
        "El usuario no está habilitado para realizar acciones en el sistema.",
      );
    }

    const tipoUsuarioDesc = userFound.tipoUsuario?.Descripcion;

    if (tipoUsuarioDesc?.toLowerCase() !== "alumno") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere tipo de usuario Alumno para realizar esta acción.",
      );
    }

    req.user.tipoUsuario = tipoUsuarioDesc;
    req.user.vigente = userFound.Vigente;
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

/**
 * Middleware para verificar que el usuario tiene rol de Profesor
 */
export async function isProfesor(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: { Correo: req.user.email },
      relations: ["tipoUsuario"],
    });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    if (!userFound.Vigente) {
      return handleErrorClient(
        res,
        403,
        "Usuario no vigente",
        "El usuario no está habilitado para realizar acciones en el sistema.",
      );
    }

    const tipoUsuarioDesc = userFound.tipoUsuario?.Descripcion;

    if (tipoUsuarioDesc?.toLowerCase() !== "profesor") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere tipo de usuario Profesor para realizar esta acción.",
      );
    }

    req.user.tipoUsuario = tipoUsuarioDesc;
    req.user.vigente = userFound.Vigente;
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

/**
 * Middleware para verificar que el usuario tiene rol de Alumno o Profesor
 * (misma vista según requerimiento)
 */
export async function isAlumnoOrProfesor(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: { Correo: req.user.email },
      relations: ["tipoUsuario"],
    });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    if (!userFound.Vigente) {
      return handleErrorClient(
        res,
        403,
        "Usuario no vigente",
        "El usuario no está habilitado para realizar acciones en el sistema.",
      );
    }

    const tipoUsuarioDesc = userFound.tipoUsuario?.Descripcion;
    const tipoLower = tipoUsuarioDesc?.toLowerCase();

    if (tipoLower !== "alumno" && tipoLower !== "profesor") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere tipo de usuario Alumno o Profesor para realizar esta acción.",
      );
    }

    req.user.tipoUsuario = tipoUsuarioDesc;
    req.user.vigente = userFound.Vigente;
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

/**
 * Middleware para verificar que el usuario tiene rol de Administrador o Director
 */
export async function isAdminOrDirector(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const poseeCargoRepository = AppDataSource.getRepository("PoseeCargo");

    const userFound = await userRepository.findOne({
      where: { Correo: req.user.email },
      relations: ["tipoUsuario"],
    });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    if (!userFound.Vigente) {
      return handleErrorClient(
        res,
        403,
        "Usuario no vigente",
        "El usuario no está habilitado para realizar acciones en el sistema.",
      );
    }

    const tipoUsuarioDesc = userFound.tipoUsuario?.Descripcion;
    const tipoLower = tipoUsuarioDesc?.toLowerCase();

    // Si es administrador, tiene acceso directo
    if (tipoLower === "administrador") {
      req.user.tipoUsuario = tipoUsuarioDesc;
      req.user.vigente = userFound.Vigente;
      req.user.rut = userFound.Rut;
      next();
      return;
    }

    // Si es profesor, verificar si tiene cargo de Director de Escuela activo
    if (tipoLower === "profesor") {
      const cargo = await poseeCargoRepository.findOne({
        where: [
          { Rut_profesor: userFound.Rut, ID_Cargo: 1, Fecha_Fin: null },
          { Rut_profesor: userFound.Rut, ID_Cargo: 2, Fecha_Fin: null }
        ],
        relations: ["cargo"],
      });

      if (cargo) {
        // Es profesor con cargo de Director de Escuela activo
        req.user.tipoUsuario = tipoUsuarioDesc;
        req.user.cargo = cargo.cargo?.Desc_Cargo || "Director/a de Escuela";
        req.user.vigente = userFound.Vigente;
        req.user.rut = userFound.Rut;
        req.user.idCarrera = userFound.ID_Carrera;
        req.user.esDirectorEscuela = true;
        next();
        return;
      }
    }

    // No cumple ninguna de las condiciones
    return handleErrorClient(
      res,
      403,
      "Error al acceder al recurso",
      "Se requiere ser Administrador o Profesor con cargo de Director/a de Escuela para realizar esta acción.",
    );
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

/**
 * Middleware para verificar que el usuario está vigente
 */
export async function isVigente(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: { Correo: req.user.email },
    });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    if (!userFound.Vigente) {
      return handleErrorClient(
        res,
        403,
        "Usuario no vigente",
        "El usuario no está habilitado. Puede estar en lista negra.",
      );
    }

    req.user.vigente = userFound.Vigente;
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}