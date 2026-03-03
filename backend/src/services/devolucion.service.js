"use strict";
import Devolucion from "../entity/devolucion.entity.js";
import Prestamo from "../entity/prestamo.entity.js";
import Equipos from "../entity/equipos.entity.js";
import TieneEstado from "../entity/tiene_estado.entity.js";
import User from "../entity/user.entity.js";
import EstadoSchema from "../entity/estado.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Registrar una devolución
 */
export async function registrarDevolucionService(body) {
  try {
    const devolucionRepository = AppDataSource.getRepository(Devolucion);
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    const equipoRepository = AppDataSource.getRepository(Equipos);
    const tieneEstadoRepository = AppDataSource.getRepository(TieneEstado);
    const userRepository = AppDataSource.getRepository(User);

    // Verificar que el préstamo existe
    const prestamoFound = await prestamoRepository.findOne({
      where: { ID_Prestamo: body.ID_Prestamo },
      relations: ["devolucion"],
    });

    if (!prestamoFound) {
      return [null, "El préstamo no existe"];
    }

    // Verificar que no tenga devolución registrada
    if (prestamoFound.devolucion) {
      return [null, "El préstamo ya tiene una devolución registrada"];
    }

    // Verificar que el usuario que devuelve existe
    const userFound = await userRepository.findOne({
      where: { Rut: body.Rut },
    });

    if (!userFound) {
      return [null, "El usuario no existe"];
    }

    // Crear la devolución
    const newDevolucion = devolucionRepository.create({
      Rut: body.Rut,
      ID_Prestamo: body.ID_Prestamo,
      Fecha_Dev: body.Fecha_Dev || new Date(),
      Hora_Dev: body.Hora_Dev,
      Obs_Dev: body.Obs_Dev || null,
    });

    const devolucionSaved = await devolucionRepository.save(newDevolucion);

    // Crear el estado de devolución
    const newEstado = tieneEstadoRepository.create({
      ID_Prestamo: body.ID_Prestamo,
      Cod_Estado: 4, // Estado "Devuelto"
      Fecha_Estado: body.Fecha_Dev || new Date(),
      Hora_Estado: body.Hora_Dev,
      Obs_Estado: body.Obs_Dev || "Equipo devuelto",
    });

    await tieneEstadoRepository.save(newEstado);

    // Obtener estado Disponible
    const estadoRepository = AppDataSource.getRepository(EstadoSchema);
    const estadoDisponible = await estadoRepository.findOne({ where: { Descripcion: "Disponible" } });

    // Marcar el equipo como disponible y actualizar estado
    await equipoRepository.update(
      { ID_Num_Inv: prestamoFound.ID_Num_Inv },
      { 
        Disponible: true,
        estado: estadoDisponible
      },
    );

    const devolucionWithRelations = await devolucionRepository.findOne({
      where: { ID_Devolucion: devolucionSaved.ID_Devolucion },
      relations: [
        "usuario",
        "usuario.cargo",
        "usuario.carrera",
        "usuario.tipoUsuario",
        "prestamo",
        "prestamo.equipos",
        "prestamo.solicitud",
        "prestamo.solicitud.usuario",
      ],
    });

    return [devolucionWithRelations, null];
  } catch (error) {
    console.error("Error al registrar la devolución:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todas las devoluciones
 */
export async function getDevolucionesService() {
  try {
    const devolucionRepository = AppDataSource.getRepository(Devolucion);

    const devoluciones = await devolucionRepository.find({
      relations: [
        "usuario",
        "usuario.cargo",
        "usuario.carrera",
        "usuario.tipoUsuario",
        "prestamo",
        "prestamo.equipos",
        "prestamo.solicitud",
        "prestamo.solicitud.usuario",
      ],
      order: { Fecha_Dev: "DESC" },
    });

    return [devoluciones || [], null];
  } catch (error) {
    console.error("Error al obtener las devoluciones:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener devoluciones por usuario
 */
export async function getDevolucionesPorUsuarioService(rut) {
  try {
    const devolucionRepository = AppDataSource.getRepository(Devolucion);

    const devoluciones = await devolucionRepository.find({
      where: { usuario: { Rut: rut } },
      relations: [
        "usuario",
        "usuario.cargo",
        "usuario.carrera",
        "usuario.tipoUsuario",
        "prestamo",
        "prestamo.equipos",
        "prestamo.solicitud",
      ],
      order: { Fecha_Dev: "DESC" },
    });

    return [devoluciones || [], null];
  } catch (error) {
    console.error("Error al obtener las devoluciones por usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener una devolución por ID
 */
export async function getDevolucionService(id) {
  try {
    const devolucionRepository = AppDataSource.getRepository(Devolucion);

    const devolucionFound = await devolucionRepository.findOne({
      where: { ID_Devolucion: id },
      relations: [
        "usuario",
        "usuario.cargo",
        "usuario.carrera",
        "usuario.tipoUsuario",
        "prestamo",
        "prestamo.equipos",
        "prestamo.solicitud",
        "prestamo.solicitud.usuario",
      ],
    });

    if (!devolucionFound) return [null, "Devolución no encontrada"];

    return [devolucionFound, null];
  } catch (error) {
    console.error("Error al obtener la devolución:", error);
    return [null, "Error interno del servidor"];
  }
}
