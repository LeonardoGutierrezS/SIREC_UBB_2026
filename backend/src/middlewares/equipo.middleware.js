"use strict";
import { AppDataSource } from "../config/configDb.js";
import Equipos from "../entity/equipos.entity.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Middleware para verificar que un equipo existe
 */
export async function equipoExists(req, res, next) {
  try {
    const equipoId = req.params.id || req.body.ID_Num_Inv;

    if (!equipoId) {
      return handleErrorClient(
        res,
        400,
        "ID del equipo es requerido",
      );
    }

    const equipoRepository = AppDataSource.getRepository(Equipos);

    const equipo = await equipoRepository.findOne({
      where: { ID_Num_Inv: equipoId },
    });

    if (!equipo) {
      return handleErrorClient(
        res,
        404,
        "Equipo no encontrado",
      );
    }

    req.equipo = equipo;
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Middleware para verificar que un equipo está disponible
 */
export async function equipoDisponible(req, res, next) {
  try {
    const equipoId = req.params.id || req.body.ID_Num_Inv;

    if (!equipoId) {
      return handleErrorClient(
        res,
        400,
        "ID del equipo es requerido",
      );
    }

    const equipoRepository = AppDataSource.getRepository(Equipos);

    const equipo = await equipoRepository.findOne({
      where: { ID_Num_Inv: equipoId },
    });

    if (!equipo) {
      return handleErrorClient(
        res,
        404,
        "Equipo no encontrado",
      );
    }

    if (!equipo.Disponible) {
      return handleErrorClient(
        res,
        400,
        "Equipo no disponible",
        "El equipo no está disponible para préstamo en este momento.",
      );
    }

    req.equipo = equipo;
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
