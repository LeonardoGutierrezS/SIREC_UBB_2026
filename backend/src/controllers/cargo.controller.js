"use strict";
import {
  createCargoService,
  deleteCargoService,
  getCargoService,
  getCargosService,
  updateCargoService,
} from "../services/cargo.service.js";
import {
  cargoValidation,
  updateCargoValidation,
} from "../validations/cargo.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Crear un nuevo cargo
 */
export async function createCargoController(req, res) {
  try {
    const { body } = req;

    const { error } = cargoValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [cargo, errorCargo] = await createCargoService(body);

    if (errorCargo) return handleErrorClient(res, 400, errorCargo);

    handleSuccess(res, 201, "Cargo creado correctamente", cargo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todos los cargos
 */
export async function getCargosController(req, res) {
  try {
    const [cargos, errorCargos] = await getCargosService();

    if (errorCargos) return handleErrorClient(res, 404, errorCargos);

    cargos.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Cargos encontrados", cargos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener un cargo por ID
 */
export async function getCargoController(req, res) {
  try {
    const { id } = req.params;

    const [cargo, errorCargo] = await getCargoService(id);

    if (errorCargo) return handleErrorClient(res, 404, errorCargo);

    handleSuccess(res, 200, "Cargo encontrado", cargo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Actualizar un cargo
 */
export async function updateCargoController(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error } = updateCargoValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [cargo, errorCargo] = await updateCargoService(id, body);

    if (errorCargo) return handleErrorClient(res, 400, errorCargo);

    handleSuccess(res, 200, "Cargo actualizado correctamente", cargo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Eliminar un cargo
 */
export async function deleteCargoController(req, res) {
  try {
    const { id } = req.params;

    const [cargo, errorCargo] = await deleteCargoService(id);

    if (errorCargo) return handleErrorClient(res, 404, errorCargo);

    handleSuccess(res, 200, "Cargo eliminado correctamente", cargo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
