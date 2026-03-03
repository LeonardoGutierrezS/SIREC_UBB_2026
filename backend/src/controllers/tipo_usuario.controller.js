"use strict";
import {
  createTipoUsuarioService,
  deleteTipoUsuarioService,
  getTiposUsuarioService,
  getTipoUsuarioService,
  updateTipoUsuarioService,
} from "../services/tipo_usuario.service.js";
import {
  tipoUsuarioValidation,
  updateTipoUsuarioValidation,
} from "../validations/tipo_usuario.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Crear un nuevo tipo de usuario
 */
export async function createTipoUsuarioController(req, res) {
  try {
    const { body } = req;

    const { error } = tipoUsuarioValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [tipoUsuario, errorTipoUsuario] = await createTipoUsuarioService(body);

    if (errorTipoUsuario) return handleErrorClient(res, 400, errorTipoUsuario);

    handleSuccess(res, 201, "Tipo de usuario creado correctamente", tipoUsuario);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todos los tipos de usuario
 */
export async function getTiposUsuarioController(req, res) {
  try {
    const [tiposUsuario, errorTiposUsuario] = await getTiposUsuarioService();

    if (errorTiposUsuario) return handleErrorClient(res, 404, errorTiposUsuario);

    tiposUsuario.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Tipos de usuario encontrados", tiposUsuario);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener un tipo de usuario por código
 */
export async function getTipoUsuarioController(req, res) {
  try {
    const { cod } = req.params;

    const [tipoUsuario, errorTipoUsuario] = await getTipoUsuarioService(cod);

    if (errorTipoUsuario) return handleErrorClient(res, 404, errorTipoUsuario);

    handleSuccess(res, 200, "Tipo de usuario encontrado", tipoUsuario);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Actualizar un tipo de usuario
 */
export async function updateTipoUsuarioController(req, res) {
  try {
    const { cod } = req.params;
    const { body } = req;

    const { error } = updateTipoUsuarioValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [tipoUsuario, errorTipoUsuario] = await updateTipoUsuarioService(cod, body);

    if (errorTipoUsuario) return handleErrorClient(res, 400, errorTipoUsuario);

    handleSuccess(res, 200, "Tipo de usuario actualizado correctamente", tipoUsuario);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Eliminar un tipo de usuario
 */
export async function deleteTipoUsuarioController(req, res) {
  try {
    const { cod } = req.params;

    const [tipoUsuario, errorTipoUsuario] = await deleteTipoUsuarioService(cod);

    if (errorTipoUsuario) return handleErrorClient(res, 404, errorTipoUsuario);

    handleSuccess(res, 200, "Tipo de usuario eliminado correctamente", tipoUsuario);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
