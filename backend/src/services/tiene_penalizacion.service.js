"use strict";
import TienePenalizacion from "../entity/tiene_penalizacion.entity.js";
import Penalizaciones from "../entity/penalizaciones.entity.js";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Asignar una penalización a un usuario
 */
export async function asignarPenalizacionService(body) {
  try {
    const tienePenalizacionRepository = AppDataSource.getRepository(TienePenalizacion);
    const penalizacionRepository = AppDataSource.getRepository(Penalizaciones);
    const userRepository = AppDataSource.getRepository(User);

    // Normalizar el RUT de entrada para la búsqueda (quitar puntos y guiones)
    const rutParaBusqueda = body.Rut.replace(/[-\.]/g, '').toUpperCase();

    // Buscar al usuario comparando con el RUT de la base de datos (que también normalizamos para la comparación)
    const users = await userRepository.find();
    const userFound = users.find(u => u.Rut.replace(/[-\.]/g, '').toUpperCase() === rutParaBusqueda);

    if (!userFound) {
      return [null, "El usuario no existe"];
    }

    // Verificar que la penalización existe
    const penalizacionFound = await penalizacionRepository.findOne({
      where: { ID_Penalizaciones: body.ID_Penalizaciones },
    });

    if (!penalizacionFound) {
      return [null, "La penalización no existe"];
    }

    // Crear la asignación de penalización
    const newTienePenalizacion = tienePenalizacionRepository.create({
      Rut: userFound.Rut,
      ID_Penalizaciones: body.ID_Penalizaciones,
      Fecha_Inicio: body.Fecha_Inicio || new Date(),
      Fecha_Fin: body.Fecha_Fin || null,
      Motivo_Obs: body.Motivo_Obs || null,
    });

    const tienePenalizacionSaved = await tienePenalizacionRepository.save(newTienePenalizacion);


    const tienePenalizacionWithRelations = await tienePenalizacionRepository.findOne({
      where: { ID: tienePenalizacionSaved.ID },
      relations: [
        "usuario",
        "usuario.cargo",
        "usuario.carrera",
        "usuario.tipoUsuario",
        "penalizacion",
      ],
    });

    return [tienePenalizacionWithRelations, null];
  } catch (error) {
    console.error("Error al asignar la penalización:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todas las penalizaciones asignadas
 */
export async function getTienePenalizacionesService() {
  try {
    const tienePenalizacionRepository = AppDataSource.getRepository(TienePenalizacion);

    const penalizaciones = await tienePenalizacionRepository.find({
      relations: [
        "usuario",
        "usuario.cargo",
        "usuario.carrera",
        "usuario.tipoUsuario",
        "penalizacion",
      ],
      order: { Fecha_Inicio: "DESC" },
    });

    return [penalizaciones || [], null];
  } catch (error) {
    console.error("Error al obtener las penalizaciones asignadas:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener penalizaciones de un usuario
 */
export async function getPenalizacionesPorUsuarioService(rut) {
  try {
    const tienePenalizacionRepository = AppDataSource.getRepository(TienePenalizacion);

    const penalizaciones = await tienePenalizacionRepository.find({
      where: { usuario: { Rut: rut } },
      relations: ["penalizacion"],
      order: { Fecha_Inicio: "DESC" },
    });

    return [penalizaciones || [], null];
  } catch (error) {
    console.error("Error al obtener las penalizaciones por usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener penalizaciones activas de un usuario
 */
export async function getPenalizacionesActivasService(rut) {
  try {
    const tienePenalizacionRepository = AppDataSource.getRepository(TienePenalizacion);
    const now = new Date();

    const penalizaciones = await tienePenalizacionRepository
      .createQueryBuilder("tp")
      .leftJoinAndSelect("tp.usuario", "usuario")
      .leftJoinAndSelect("tp.penalizacion", "penalizacion")
      .where("tp.Rut = :rut", { rut })
      .andWhere("(tp.Fecha_Fin IS NULL OR tp.Fecha_Fin > :now)", { now })
      .orderBy("tp.Fecha_Inicio", "DESC")
      .getMany();

    return [penalizaciones || [], null];
  } catch (error) {
    console.error("Error al obtener las penalizaciones activas:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Finalizar una penalización
 */
export async function finalizarPenalizacionService(id, fechaFin) {
  try {
    const tienePenalizacionRepository = AppDataSource.getRepository(TienePenalizacion);
    const userRepository = AppDataSource.getRepository(User);

    const penalizacionFound = await tienePenalizacionRepository.findOne({
      where: { ID: id },
      relations: ["usuario"],
    });

    if (!penalizacionFound) return [null, "Penalización no encontrada"];

    if (penalizacionFound.Fecha_Fin && new Date(penalizacionFound.Fecha_Fin) <= new Date()) {
      return [null, "La penalización ya fue finalizada"];
    }

    await tienePenalizacionRepository.update(
      { ID: id },
      { Fecha_Fin: fechaFin || new Date() },
    );

    // Verificar si el usuario tiene otras penalizaciones activas
    const penalizacionesActivas = await getPenalizacionesActivasService(
      penalizacionFound.usuario.Rut,
    );


    const penalizacionUpdated = await tienePenalizacionRepository.findOne({
      where: { ID: id },
      relations: ["usuario", "penalizacion"],
    });

    return [penalizacionUpdated, null];
  } catch (error) {
    console.error("Error al finalizar la penalización:", error);
    return [null, "Error interno del servidor"];
  }
}
