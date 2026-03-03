"use strict";
import PoseeCargo from "../entity/posee_cargo.entity.js";
import User from "../entity/user.entity.js";
import Cargo from "../entity/cargo.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Asignar un cargo a un usuario
 */
export async function createPoseeCargoService(body) {
  try {
    const poseeCargoRepository = AppDataSource.getRepository(PoseeCargo);
    const userRepository = AppDataSource.getRepository(User);
    const cargoRepository = AppDataSource.getRepository(Cargo);

    // Verificar que el usuario existe
    const userFound = await userRepository.findOne({
      where: { Rut: body.Rut_profesor },
    });

    if (!userFound) {
      return [null, "El usuario no existe"];
    }

    // Verificar que el cargo existe
    const cargoFound = await cargoRepository.findOne({
      where: { ID_Cargo: body.ID_Cargo },
    });

    if (!cargoFound) {
      return [null, "El cargo no existe"];
    }

    // Verificar si ya existe esta asignación
    const existingPoseeCargo = await poseeCargoRepository.findOne({
      where: { Rut_profesor: body.Rut_profesor, ID_Cargo: body.ID_Cargo },
    });

    if (existingPoseeCargo) {
      return [null, "El usuario ya tiene este cargo asignado"];
    }

    const newPoseeCargo = poseeCargoRepository.create({
      Rut_profesor: body.Rut_profesor,
      ID_Cargo: body.ID_Cargo,
      Fecha_Inicio: body.Fecha_Inicio || new Date(),
      Fecha_Fin: body.Fecha_Fin || null,
    });

    const poseeCargoSaved = await poseeCargoRepository.save(newPoseeCargo);

    const poseeCargoWithRelations = await poseeCargoRepository.findOne({
      where: { Rut_profesor: poseeCargoSaved.Rut_profesor, ID_Cargo: poseeCargoSaved.ID_Cargo },
      relations: ["usuario", "cargo"],
    });

    return [poseeCargoWithRelations, null];
  } catch (error) {
    console.error("Error al asignar el cargo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todos los cargos de un usuario
 */
export async function getCargosPorUsuarioService(rut) {
  try {
    const poseeCargoRepository = AppDataSource.getRepository(PoseeCargo);

    const cargos = await poseeCargoRepository.find({
      where: { usuario: { Rut: rut } },
      relations: ["cargo"],
      order: { Fecha_Inicio: "DESC" },
    });

    return [cargos || [], null];
  } catch (error) {
    console.error("Error al obtener los cargos del usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener el cargo actual de un usuario
 */
export async function getCargoActualService(rut) {
  try {
    const poseeCargoRepository = AppDataSource.getRepository(PoseeCargo);

    const cargoActual = await poseeCargoRepository.findOne({
      where: { usuario: { Rut: rut }, Fecha_Fin: null },
      relations: ["cargo"],
    });

    if (!cargoActual) return [null, "El usuario no tiene cargo actual"];

    return [cargoActual, null];
  } catch (error) {
    console.error("Error al obtener el cargo actual:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Finalizar un cargo de usuario
 */
export async function finalizarCargoService(rut, idCargo, fechaFin) {
  try {
    const poseeCargoRepository = AppDataSource.getRepository(PoseeCargo);

    const poseeCargoFound = await poseeCargoRepository.findOne({
      where: { Rut_profesor: rut, ID_Cargo: idCargo },
    });

    if (!poseeCargoFound) return [null, "Asignación de cargo no encontrada"];

    await poseeCargoRepository.update(
      { Rut_profesor: rut, ID_Cargo: idCargo },
      { Fecha_Fin: fechaFin || new Date() },
    );

    const poseeCargoUpdated = await poseeCargoRepository.findOne({
      where: { Rut_profesor: rut, ID_Cargo: idCargo },
      relations: ["usuario", "cargo"],
    });

    return [poseeCargoUpdated, null];
  } catch (error) {
    console.error("Error al finalizar el cargo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Eliminar una asignación de cargo
 */
export async function deletePoseeCargoService(rut, idCargo) {
  try {
    const poseeCargoRepository = AppDataSource.getRepository(PoseeCargo);

    const poseeCargoFound = await poseeCargoRepository.findOne({
      where: { Rut_profesor: rut, ID_Cargo: idCargo },
      relations: ["usuario", "cargo"],
    });

    if (!poseeCargoFound) return [null, "Asignación de cargo no encontrada"];

    const poseeCargoDeleted = await poseeCargoRepository.remove(poseeCargoFound);

    return [poseeCargoDeleted, null];
  } catch (error) {
    console.error("Error al eliminar la asignación de cargo:", error);
    return [null, "Error interno del servidor"];
  }
}
