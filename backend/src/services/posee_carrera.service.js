"use strict";
import PoseeCarrera from "../entity/posee_carrera.entity.js";
import User from "../entity/user.entity.js";
import Carrera from "../entity/carrera.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Asignar una carrera a un estudiante
 */
export async function createPoseeCarreraService(body) {
  try {
    const poseeCarreraRepository = AppDataSource.getRepository(PoseeCarrera);
    const userRepository = AppDataSource.getRepository(User);
    const carreraRepository = AppDataSource.getRepository(Carrera);

    // Verificar que el usuario existe
    const userFound = await userRepository.findOne({
      where: { Rut: body.Rut_profesor },
    });

    if (!userFound) {
      return [null, "El usuario no existe"];
    }

    // Verificar que la carrera existe
    const carreraFound = await carreraRepository.findOne({
      where: { ID_Carrera: body.ID_Carrera },
    });

    if (!carreraFound) {
      return [null, "La carrera no existe"];
    }

    // Verificar si ya existe esta asignación
    const existingPoseeCarrera = await poseeCarreraRepository.findOne({
      where: { Rut_profesor: body.Rut_profesor, ID_Carrera: body.ID_Carrera },
    });

    if (existingPoseeCarrera) {
      return [null, "El estudiante ya tiene esta carrera asignada"];
    }

    const newPoseeCarrera = poseeCarreraRepository.create({
      Rut_profesor: body.Rut_profesor,
      ID_Carrera: body.ID_Carrera,
      Anio_Ingreso: body.Anio_Ingreso || null,
    });

    const poseeCarreraSaved = await poseeCarreraRepository.save(newPoseeCarrera);

    const poseeCarreraWithRelations = await poseeCarreraRepository.findOne({
      where: { Rut_profesor: poseeCarreraSaved.Rut_profesor, ID_Carrera: poseeCarreraSaved.ID_Carrera },
      relations: ["usuario", "carrera"],
    });

    return [poseeCarreraWithRelations, null];
  } catch (error) {
    console.error("Error al asignar la carrera:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener la carrera de un estudiante
 */
export async function getCarreraPorUsuarioService(rut) {
  try {
    const poseeCarreraRepository = AppDataSource.getRepository(PoseeCarrera);

    const carrera = await poseeCarreraRepository.findOne({
      where: { usuario: { Rut: rut } },
      relations: ["carrera"],
    });

    if (!carrera) return [null, "El estudiante no tiene carrera asignada"];

    return [carrera, null];
  } catch (error) {
    console.error("Error al obtener la carrera del estudiante:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todos los estudiantes de una carrera
 */
export async function getEstudiantesPorCarreraService(idCarrera) {
  try {
    const poseeCarreraRepository = AppDataSource.getRepository(PoseeCarrera);

    const estudiantes = await poseeCarreraRepository.find({
      where: { carrera: { ID_Carrera: idCarrera } },
      relations: ["usuario", "usuario.tipoUsuario"],
      order: { Anio_Ingreso: "DESC" },
    });

    return [estudiantes || [], null];
  } catch (error) {
    console.error("Error al obtener los estudiantes de la carrera:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualizar el año de ingreso
 */
export async function updateAnioIngresoService(rut, idCarrera, anioIngreso) {
  try {
    const poseeCarreraRepository = AppDataSource.getRepository(PoseeCarrera);

    const poseeCarreraFound = await poseeCarreraRepository.findOne({
      where: { Rut_profesor: rut, ID_Carrera: idCarrera },
    });

    if (!poseeCarreraFound) return [null, "Asignación de carrera no encontrada"];

    await poseeCarreraRepository.update(
      { Rut_profesor: rut, ID_Carrera: idCarrera },
      { Anio_Ingreso: anioIngreso },
    );

    const poseeCarreraUpdated = await poseeCarreraRepository.findOne({
      where: { Rut_profesor: rut, ID_Carrera: idCarrera },
      relations: ["usuario", "carrera"],
    });

    return [poseeCarreraUpdated, null];
  } catch (error) {
    console.error("Error al actualizar el año de ingreso:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Eliminar una asignación de carrera
 */
export async function deletePoseeCarreraService(rut, idCarrera) {
  try {
    const poseeCarreraRepository = AppDataSource.getRepository(PoseeCarrera);

    const poseeCarreraFound = await poseeCarreraRepository.findOne({
      where: { Rut_profesor: rut, ID_Carrera: idCarrera },
      relations: ["usuario", "carrera"],
    });

    if (!poseeCarreraFound) return [null, "Asignación de carrera no encontrada"];

    const poseeCarreraDeleted = await poseeCarreraRepository.remove(poseeCarreraFound);

    return [poseeCarreraDeleted, null];
  } catch (error) {
    console.error("Error al eliminar la asignación de carrera:", error);
    return [null, "Error interno del servidor"];
  }
}
