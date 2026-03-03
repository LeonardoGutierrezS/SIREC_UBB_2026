"use strict";
import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Middleware para verificar que un usuario no tiene penalizaciones activas
 */
export async function noPenalizacionesActivas(req, res, next) {
  try {
    const rut = req.params.rut || req.body.Rut || req.user?.rut;

    if (!rut) {
      return handleErrorClient(
        res,
        400,
        "RUT del usuario es requerido",
      );
    }

    const TienePenalizacionSchema = AppDataSource.getRepository("TienePenalizacion");

    // Buscar si el usuario tiene penalizaciones activas
    const penalizacionActiva = await TienePenalizacionSchema
      .createQueryBuilder("tp")
      .leftJoinAndSelect("tp.penalizacion", "penalizacion")
      .where("tp.Rut = :rut", { rut })
      .andWhere("tp.Fecha_Fin >= :today", { today: new Date() })
      .getOne();

    if (penalizacionActiva) {
      return handleErrorClient(
        res,
        403,
        "Usuario con penalización activa",
        `El usuario tiene una penalización activa hasta ${penalizacionActiva.Fecha_Fin}. Motivo: ${penalizacionActiva.penalizacion?.Descripcion || 'No especificado'}`,
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Middleware para verificar que un usuario está vigente
 */
export async function usuarioVigente(req, res, next) {
  try {
    const rut = req.params.rut || req.body.Rut || req.user?.rut;

    if (!rut) {
      return handleErrorClient(
        res,
        400,
        "RUT del usuario es requerido",
      );
    }

    const userRepository = AppDataSource.getRepository(User);

    const usuario = await userRepository.findOne({
      where: { Rut: rut },
    });

    if (!usuario) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado",
      );
    }

    if (!usuario.Vigente) {
      return handleErrorClient(
        res,
        403,
        "Usuario no vigente",
        "El usuario no está habilitado para realizar préstamos.",
      );
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
