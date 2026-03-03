"use strict";
import TieneEstado from "../entity/tiene_estado.entity.js";
import Equipos from "../entity/equipos.entity.js";
import EstadoPrestamo from "../entity/estado_prestamo.entity.js";
import Estado from "../entity/estado.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Crear un nuevo registro de estado para un préstamo
 */
export async function createTieneEstadoService(body) {
  try {
    const tieneEstadoRepository = AppDataSource.getRepository(TieneEstado);
    const equipoRepository = AppDataSource.getRepository(Equipos);
    const estadoPrestamoRepository = AppDataSource.getRepository(EstadoPrestamo);
    const estadoRepository = AppDataSource.getRepository(Estado);

    // Verificar que el equipo existe
    const equipoFound = await equipoRepository.findOne({
      where: { ID_Num_Inv: body.ID_Num_Inv },
    });

    if (!equipoFound) {
      return [null, "El equipo no existe"];
    }

    // Verificar que el estado de préstamo existe
    const estadoPrestamoFound = await estadoPrestamoRepository.findOne({
      where: { ID_Estado: body.ID_Estado },
    });

    if (!estadoPrestamoFound) {
      return [null, "El estado de préstamo no existe"];
    }

    // Verificar que el estado existe
    const estadoFound = await estadoRepository.findOne({
      where: { Cod_Estado: body.Cod_Estado },
    });

    if (!estadoFound) {
      return [null, "El estado no existe"];
    }

    // Crear el registro de estado
    const newTieneEstado = tieneEstadoRepository.create({
      ID_Num_Inv: body.ID_Num_Inv,
      ID_Estado: body.ID_Estado,
      Cod_Estado: body.Cod_Estado,
      Fecha_Estado: body.Fecha_Estado || new Date(),
      Hora_Estado: body.Hora_Estado,
      Obs_Estado: body.Obs_Estado || null,
    });

    const tieneEstadoSaved = await tieneEstadoRepository.save(newTieneEstado);

    const tieneEstadoWithRelations = await tieneEstadoRepository.findOne({
      where: { 
        ID_Num_Inv: tieneEstadoSaved.ID_Num_Inv, 
        ID_Estado: tieneEstadoSaved.ID_Estado,
        Cod_Estado: tieneEstadoSaved.Cod_Estado 
      },
      relations: ["equipo", "estadoPrestamo", "estado"],
    });

    return [tieneEstadoWithRelations, null];
  } catch (error) {
    console.error("Error al crear el registro de estado:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener el historial de estados de un equipo
 */
export async function getHistorialEstadosService(equipoId) {
  try {
    const tieneEstadoRepository = AppDataSource.getRepository(TieneEstado);

    const historial = await tieneEstadoRepository.find({
      where: { equipo: { ID_Num_Inv: equipoId } },
      relations: ["estadoPrestamo", "estado"],
      order: { Fecha_Estado: "ASC", Hora_Estado: "ASC" },
    });

    return [historial || [], null];
  } catch (error) {
    console.error("Error al obtener el historial de estados:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener el estado actual de un equipo
 */
export async function getEstadoActualService(equipoId) {
  try {
    const tieneEstadoRepository = AppDataSource.getRepository(TieneEstado);

    const estadoActual = await tieneEstadoRepository.findOne({
      where: { equipo: { ID_Num_Inv: equipoId } },
      relations: ["estadoPrestamo", "estado"],
      order: { Fecha_Estado: "DESC", Hora_Estado: "DESC" },
    });

    if (!estadoActual) return [null, "No se encontró estado para el equipo"];

    return [estadoActual, null];
  } catch (error) {
    console.error("Error al obtener el estado actual:", error);
    return [null, "Error interno del servidor"];
  }
}
