"use strict";
import Estado from "../entity/estado.entity.js";
import Equipos from "../entity/equipos.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createEstadoService(body) {
  try {
    const estadoRepository = AppDataSource.getRepository(Estado);

    const existingEstado = await estadoRepository.findOne({
      where: { Descripcion: body.Descripcion },
    });

    if (existingEstado) {
      return [null, "El estado ya existe"];
    }

    const newEstado = estadoRepository.create({
      Descripcion: body.Descripcion,
    });

    const estadoSaved = await estadoRepository.save(newEstado);

    return [estadoSaved, null];
  } catch (error) {
    console.error("Error al crear el estado:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getEstadoService(id) {
  try {
    const estadoRepository = AppDataSource.getRepository(Estado);

    const estadoFound = await estadoRepository.findOne({
      where: { Cod_Estado: id },
    });

    if (!estadoFound) return [null, "Estado no encontrado"];

    return [estadoFound, null];
  } catch (error) {
    console.error("Error al obtener el estado:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getEstadosService() {
  try {
    const estadoRepository = AppDataSource.getRepository(Estado);

    const estados = await estadoRepository.find();

    if (!estados || estados.length === 0) return [null, "No hay estados"];

    return [estados, null];
  } catch (error) {
    console.error("Error al obtener los estados:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateEstadoService(id, body) {
  try {
    const estadoRepository = AppDataSource.getRepository(Estado);
    const equiposRepository = AppDataSource.getRepository(Equipos);

    const estadoFound = await estadoRepository.findOne({
      where: { Cod_Estado: id },
    });

    if (!estadoFound) return [null, "Estado no encontrado"];

    // Verificar si hay equipos asociados a este estado
    const equiposCount = await equiposRepository.count({
      where: { ID_Estado: id },
    });

    if (equiposCount > 0) {
      return [null, `No se puede editar el estado porque tiene ${equiposCount} equipo(s) asociado(s)`];
    }

    // Solo limpiar espacios, NO convertir a minúsculas
    const estadoNormalizado = body.Descripcion.trim()
      .replace(/\s+/g, ' ');

    const existingEstado = await estadoRepository.findOne({
      where: { Descripcion: estadoNormalizado },
    });

    if (existingEstado && existingEstado.Cod_Estado !== id) {
      return [null, "Ya existe otro estado con el mismo nombre"];
    }

    // Actualizar usando save() en lugar de update()
    estadoFound.Descripcion = estadoNormalizado;
    const estadoUpdated = await estadoRepository.save(estadoFound);

    return [estadoUpdated, null];
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteEstadoService(id) {
  try {
    const estadoRepository = AppDataSource.getRepository(Estado);
    const equiposRepository = AppDataSource.getRepository(Equipos);

    const estadoFound = await estadoRepository.findOne({
      where: { Cod_Estado: id },
    });

    if (!estadoFound) return [null, "Estado no encontrado"];

    // Verificar si hay equipos asociados a este estado
    const equiposCount = await equiposRepository.count({
      where: { ID_Estado: id },
    });

    if (equiposCount > 0) {
      return [null, `No se puede eliminar el estado porque tiene ${equiposCount} equipo(s) asociado(s)`];
    }

    const estadoDeleted = await estadoRepository.remove(estadoFound);

    return [estadoDeleted, null];
  } catch (error) {
    console.error("Error al eliminar el estado:", error);
    return [null, "Error interno del servidor"];
  }
}
