"use strict";
import Carrera from "../entity/carrera.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createCarreraService(body) {
  try {
    const carreraRepository = AppDataSource.getRepository(Carrera);

    const existingCarrera = await carreraRepository.findOne({
      where: { Carrera: body.Carrera },
    });

    if (existingCarrera) {
      return [null, "La carrera ya existe"];
    }

    const newCarrera = carreraRepository.create({
      Carrera: body.Carrera,
    });

    const carreraSaved = await carreraRepository.save(newCarrera);

    return [carreraSaved, null];
  } catch (error) {
    console.error("Error al crear la carrera:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getCarreraService(id) {
  try {
    const carreraRepository = AppDataSource.getRepository(Carrera);

    const carreraFound = await carreraRepository.findOne({
      where: { ID_Carrera: id },
    });

    if (!carreraFound) return [null, "Carrera no encontrada"];

    return [carreraFound, null];
  } catch (error) {
    console.error("Error al obtener la carrera:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getCarrerasService() {
  try {
    const carreraRepository = AppDataSource.getRepository(Carrera);

    const carreras = await carreraRepository.find();

    if (!carreras || carreras.length === 0) return [null, "No hay carreras"];

    return [carreras, null];
  } catch (error) {
    console.error("Error al obtener las carreras:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateCarreraService(id, body) {
  try {
    const carreraRepository = AppDataSource.getRepository(Carrera);

    const carreraFound = await carreraRepository.findOne({
      where: { ID_Carrera: id },
    });

    if (!carreraFound) return [null, "Carrera no encontrada"];

    const existingCarrera = await carreraRepository.findOne({
      where: { Carrera: body.Carrera },
    });

    if (existingCarrera && existingCarrera.ID_Carrera !== id) {
      return [null, "Ya existe otra carrera con el mismo nombre"];
    }

    await carreraRepository.update(
      { ID_Carrera: id },
      { Carrera: body.Carrera },
    );

    const carreraUpdated = await carreraRepository.findOne({
      where: { ID_Carrera: id },
    });

    return [carreraUpdated, null];
  } catch (error) {
    console.error("Error al actualizar la carrera:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteCarreraService(id) {
  try {
    const carreraRepository = AppDataSource.getRepository(Carrera);

    const carreraFound = await carreraRepository.findOne({
      where: { ID_Carrera: id },
    });

    if (!carreraFound) return [null, "Carrera no encontrada"];

    const carreraDeleted = await carreraRepository.remove(carreraFound);

    return [carreraDeleted, null];
  } catch (error) {
    console.error("Error al eliminar la carrera:", error);
    return [null, "Error interno del servidor"];
  }
}
