"use strict";
import { AppDataSource } from "../config/configDb.js";
import Prestamo from "../entity/prestamo.entity.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Middleware para verificar que un préstamo existe
 */
export async function prestamoExists(req, res, next) {
  try {
    const prestamoId = req.params.id;

    if (!prestamoId) {
      return handleErrorClient(
        res,
        400,
        "ID del préstamo es requerido",
      );
    }

    const prestamoRepository = AppDataSource.getRepository(Prestamo);

    const prestamo = await prestamoRepository.findOne({
      where: { ID_Prestamo: prestamoId },
      relations: [
        "solicitud",
        "solicitud.usuario",
        "tieneEstados",
        "tieneEstados.estado",
      ],
    });

    if (!prestamo) {
      return handleErrorClient(
        res,
        404,
        "Préstamo no encontrado",
      );
    }

    req.prestamo = prestamo;
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Middleware para verificar que un préstamo está activo
 */
export async function prestamoActivo(req, res, next) {
  try {
    const prestamoId = req.params.id;

    if (!prestamoId) {
      return handleErrorClient(
        res,
        400,
        "ID del préstamo es requerido",
      );
    }

    const prestamoRepository = AppDataSource.getRepository(Prestamo);

    const prestamo = await prestamoRepository.findOne({
      where: { ID_Prestamo: prestamoId },
    });

    if (!prestamo) {
      return handleErrorClient(
        res,
        404,
        "Préstamo no encontrado",
      );
    }

    // Verificar si tiene devolución registrada
    const prestamoConDevolucion = await prestamoRepository.findOne({
      where: { ID_Prestamo: prestamoId },
      relations: ["devolucion"],
    });

    if (prestamoConDevolucion?.devolucion) {
      return handleErrorClient(
        res,
        400,
        "Préstamo ya finalizado",
        "Este préstamo ya ha sido devuelto.",
      );
    }

    req.prestamo = prestamo;
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Middleware para verificar límite de préstamos activos por usuario
 */
export async function limitePrestamosPorUsuario(req, res, next) {
  try {
    const rut = req.body.Rut || req.user?.rut;
    const limitePrestamos = 3; // Configurar según necesidad

    if (!rut) {
      return handleErrorClient(
        res,
        400,
        "RUT del usuario es requerido",
      );
    }

    const prestamoRepository = AppDataSource.getRepository(Prestamo);

    // Contar préstamos activos (sin devolución) del usuario
    const prestamosActivos = await prestamoRepository
      .createQueryBuilder("prestamo")
      .leftJoin("prestamo.solicitud", "solicitud")
      .leftJoin("prestamo.devolucion", "devolucion")
      .where("solicitud.Rut = :rut", { rut })
      .andWhere("devolucion.ID_Devolucion IS NULL")
      .getCount();

    if (prestamosActivos >= limitePrestamos) {
      return handleErrorClient(
        res,
        400,
        "Límite de préstamos alcanzado",
        `El usuario tiene ${prestamosActivos} préstamos activos. Límite máximo: ${limitePrestamos}`,
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
