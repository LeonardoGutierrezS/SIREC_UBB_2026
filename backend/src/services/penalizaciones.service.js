"use strict";
import Penalizaciones from "../entity/penalizaciones.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Crear una nueva penalización
 */
export async function createPenalizacionService(body) {
  try {
    const penalizacionRepository = AppDataSource.getRepository(Penalizaciones);

    const newPenalizacion = penalizacionRepository.create({
      Descripcion: body.Descripcion,
      Dias_Sancion: body.Dias_Sancion,
    });

    const penalizacionSaved = await penalizacionRepository.save(newPenalizacion);

    return [penalizacionSaved, null];
  } catch (error) {
    console.error("Error al crear la penalización:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todas las penalizaciones
 */
export async function getPenalizacionesService() {
  try {
    const penalizacionRepository = AppDataSource.getRepository(Penalizaciones);

    const penalizaciones = await penalizacionRepository.find();

    return [penalizaciones || [], null];
  } catch (error) {
    console.error("Error al obtener las penalizaciones:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener una penalización por ID
 */
export async function getPenalizacionService(id) {
  try {
    const penalizacionRepository = AppDataSource.getRepository(Penalizaciones);

    const penalizacionFound = await penalizacionRepository.findOne({
      where: { ID_Penalizaciones: id },
    });

    if (!penalizacionFound) return [null, "Penalización no encontrada"];

    return [penalizacionFound, null];
  } catch (error) {
    console.error("Error al obtener la penalización:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualizar una penalización
 */
export async function updatePenalizacionService(id, body) {
  try {
    const penalizacionRepository = AppDataSource.getRepository(Penalizaciones);

    const penalizacionFound = await penalizacionRepository.findOne({
      where: { ID_Penalizaciones: id },
    });

    if (!penalizacionFound) return [null, "Penalización no encontrada"];

    await penalizacionRepository.update(
      { ID_Penalizaciones: id },
      { 
        Descripcion: body.Descripcion,
        Dias_Sancion: body.Dias_Sancion
      },
    );

    const penalizacionUpdated = await penalizacionRepository.findOne({
      where: { ID_Penalizaciones: id },
    });

    return [penalizacionUpdated, null];
  } catch (error) {
    console.error("Error al actualizar la penalización:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Eliminar una penalización
 */
export async function deletePenalizacionService(id) {
  try {
    const penalizacionRepository = AppDataSource.getRepository(Penalizaciones);

    const penalizacionFound = await penalizacionRepository.findOne({
      where: { ID_Penalizaciones: id },
    });

    if (!penalizacionFound) return [null, "Penalización no encontrada"];

    const penalizacionDeleted = await penalizacionRepository.remove(penalizacionFound);

    return [penalizacionDeleted, null];
  } catch (error) {
    console.error("Error al eliminar la penalización:", error);
    return [null, "Error interno del servidor"];
  }
}
