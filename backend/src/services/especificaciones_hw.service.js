"use strict";
import EspecificacionesHW from "../entity/especificaciones_hw.entity.js";
import Equipos from "../entity/equipos.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Crear una especificación de hardware para un equipo
 */
export async function createEspecificacionService(body) {
  try {
    const especificacionRepository = AppDataSource.getRepository(EspecificacionesHW);
    const equipoRepository = AppDataSource.getRepository(Equipos);

    // Verificar que el equipo existe
    const equipoFound = await equipoRepository.findOne({
      where: { ID_Num_Inv: body.ID_Num_Inv },
    });

    if (!equipoFound) {
      return [null, "El equipo no existe"];
    }

    const newEspecificacion = especificacionRepository.create({
      ID_Num_Inv: body.ID_Num_Inv,
      Tipo_Especificacion_HW: body.Tipo_Especificacion_HW,
      Descripcion: body.Descripcion || null,
    });

    const especificacionSaved = await especificacionRepository.save(newEspecificacion);

    const especificacionWithRelations = await especificacionRepository.findOne({
      where: { ID_Especificaciones_HW: especificacionSaved.ID_Especificaciones_HW },
      relations: ["equipo", "equipo.marca", "equipo.categoria", "equipo.estado"],
    });

    return [especificacionWithRelations, null];
  } catch (error) {
    console.error("Error al crear la especificación:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todas las especificaciones de un equipo
 */
export async function getEspecificacionesPorEquipoService(idNumInv) {
  try {
    const especificacionRepository = AppDataSource.getRepository(EspecificacionesHW);

    const especificaciones = await especificacionRepository.find({
      where: { equipo: { ID_Num_Inv: idNumInv } },
      relations: ["equipo"],
    });

    return [especificaciones || [], null];
  } catch (error) {
    console.error("Error al obtener las especificaciones del equipo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualizar una especificación
 */
export async function updateEspecificacionService(id, body) {
  try {
    const especificacionRepository = AppDataSource.getRepository(EspecificacionesHW);

    const especificacionFound = await especificacionRepository.findOne({
      where: { ID_Especificaciones_HW: id },
    });

    if (!especificacionFound) return [null, "Especificación no encontrada"];

    await especificacionRepository.update(
      { ID_Especificaciones_HW: id },
      {
        Tipo_Especificacion_HW: body.Tipo_Especificacion_HW || especificacionFound.Tipo_Especificacion_HW,
        Descripcion: body.Descripcion !== undefined ? body.Descripcion : especificacionFound.Descripcion,
      },
    );

    const especificacionUpdated = await especificacionRepository.findOne({
      where: { ID_Especificaciones_HW: id },
      relations: ["equipo"],
    });

    return [especificacionUpdated, null];
  } catch (error) {
    console.error("Error al actualizar la especificación:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Eliminar una especificación
 */
export async function deleteEspecificacionService(id) {
  try {
    const especificacionRepository = AppDataSource.getRepository(EspecificacionesHW);

    const especificacionFound = await especificacionRepository.findOne({
      where: { ID_Especificaciones_HW: id },
    });

    if (!especificacionFound) return [null, "Especificación no encontrada"];

    const especificacionDeleted = await especificacionRepository.remove(especificacionFound);

    return [especificacionDeleted, null];
  } catch (error) {
    console.error("Error al eliminar la especificación:", error);
    return [null, "Error interno del servidor"];
  }
}
