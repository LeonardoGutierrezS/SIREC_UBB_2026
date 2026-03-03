"use strict";
import Cargo from "../entity/cargo.entity.js";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Crear un nuevo cargo
 */
export async function createCargoService(body) {
  try {
    const cargoRepository = AppDataSource.getRepository(Cargo);
    const userRepository = AppDataSource.getRepository(User);

    // Verificar que el usuario existe
    const userFound = await userRepository.findOne({
      where: { Rut: body.Rut },
    });

    if (!userFound) {
      return [null, "El usuario no existe"];
    }

    const newCargo = cargoRepository.create({
      Rut: body.Rut,
      Desc_Cargo: body.Desc_Cargo,
    });

    const cargoSaved = await cargoRepository.save(newCargo);

    return [cargoSaved, null];
  } catch (error) {
    console.error("Error al crear el cargo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todos los cargos
 */
export async function getCargosService() {
  try {
    const cargoRepository = AppDataSource.getRepository(Cargo);

    const cargos = await cargoRepository.find({
      order: {
        ID_Cargo: "ASC"
      }
    });

    return [cargos || [], null];
  } catch (error) {
    console.error("Error al obtener los cargos:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener un cargo por ID
 */
export async function getCargoService(id) {
  try {
    const cargoRepository = AppDataSource.getRepository(Cargo);

    const cargoFound = await cargoRepository.findOne({
      where: { ID_Cargo: id },
    });

    if (!cargoFound) return [null, "Cargo no encontrado"];

    return [cargoFound, null];
  } catch (error) {
    console.error("Error al obtener el cargo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualizar un cargo
 */
export async function updateCargoService(id, body) {
  try {
    const cargoRepository = AppDataSource.getRepository(Cargo);

    const cargoFound = await cargoRepository.findOne({
      where: { ID_Cargo: id },
    });

    if (!cargoFound) return [null, "Cargo no encontrado"];

    await cargoRepository.update(
      { ID_Cargo: id },
      { Desc_Cargo: body.Desc_Cargo },
    );

    const cargoUpdated = await cargoRepository.findOne({
      where: { ID_Cargo: id },
    });

    return [cargoUpdated, null];
  } catch (error) {
    console.error("Error al actualizar el cargo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Eliminar un cargo
 */
export async function deleteCargoService(id) {
  try {
    const cargoRepository = AppDataSource.getRepository(Cargo);

    const cargoFound = await cargoRepository.findOne({
      where: { ID_Cargo: id },
    });

    if (!cargoFound) return [null, "Cargo no encontrado"];

    const cargoDeleted = await cargoRepository.remove(cargoFound);

    return [cargoDeleted, null];
  } catch (error) {
    console.error("Error al eliminar el cargo:", error);
    return [null, "Error interno del servidor"];
  }
}
