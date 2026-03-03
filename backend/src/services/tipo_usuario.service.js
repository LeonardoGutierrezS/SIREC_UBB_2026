"use strict";
import TipoUsuario from "../entity/tipo_usuario.entity.js";
import { AppDataSource } from "../config/configDb.js";

/**
 * Crear un nuevo tipo de usuario
 */
export async function createTipoUsuarioService(body) {
  try {
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

    const newTipoUsuario = tipoUsuarioRepository.create({
      Descripcion: body.Descripcion,
    });

    const tipoUsuarioSaved = await tipoUsuarioRepository.save(newTipoUsuario);

    return [tipoUsuarioSaved, null];
  } catch (error) {
    console.error("Error al crear el tipo de usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todos los tipos de usuario
 */
export async function getTiposUsuarioService() {
  try {
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

    const tiposUsuario = await tipoUsuarioRepository.find();

    return [tiposUsuario || [], null];
  } catch (error) {
    console.error("Error al obtener los tipos de usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener un tipo de usuario por ID
 */
export async function getTipoUsuarioService(id) {
  try {
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

    const tipoUsuarioFound = await tipoUsuarioRepository.findOne({
      where: { Cod_TipoUsuario: id },
    });

    if (!tipoUsuarioFound) return [null, "Tipo de usuario no encontrado"];

    return [tipoUsuarioFound, null];
  } catch (error) {
    console.error("Error al obtener el tipo de usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualizar un tipo de usuario
 */
export async function updateTipoUsuarioService(id, body) {
  try {
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

    const tipoUsuarioFound = await tipoUsuarioRepository.findOne({
      where: { Cod_TipoUsuario: id },
    });

    if (!tipoUsuarioFound) return [null, "Tipo de usuario no encontrado"];

    await tipoUsuarioRepository.update(
      { Cod_TipoUsuario: id },
      { Descripcion: body.Descripcion },
    );

    const tipoUsuarioUpdated = await tipoUsuarioRepository.findOne({
      where: { Cod_TipoUsuario: id },
    });

    return [tipoUsuarioUpdated, null];
  } catch (error) {
    console.error("Error al actualizar el tipo de usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Eliminar un tipo de usuario
 */
export async function deleteTipoUsuarioService(id) {
  try {
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

    const tipoUsuarioFound = await tipoUsuarioRepository.findOne({
      where: { Cod_TipoUsuario: id },
    });

    if (!tipoUsuarioFound) return [null, "Tipo de usuario no encontrado"];

    const tipoUsuarioDeleted = await tipoUsuarioRepository.remove(tipoUsuarioFound);

    return [tipoUsuarioDeleted, null];
  } catch (error) {
    console.error("Error al eliminar el tipo de usuario:", error);
    return [null, "Error interno del servidor"];
  }
}
