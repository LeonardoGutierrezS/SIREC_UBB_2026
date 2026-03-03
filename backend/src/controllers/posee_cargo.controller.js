"use strict";
import {
    createPoseeCargoService,
    deletePoseeCargoService,
    finalizarCargoService,
    getCargoActualService,
    getCargosPorUsuarioService,
} from "../services/posee_cargo.service.js";
import {
    finalizarCargoValidation,
    poseeCargoValidation,
} from "../validations/posee_cargo.validation.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Asignar un cargo a un usuario
 */
export async function createPoseeCargoController(req, res) {
  try {
    const { body } = req;

    const { error } = poseeCargoValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [poseeCargo, errorPoseeCargo] = await createPoseeCargoService(body);

    if (errorPoseeCargo) return handleErrorClient(res, 400, errorPoseeCargo);

    handleSuccess(res, 201, "Cargo asignado correctamente", poseeCargo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todos los cargos de un usuario
 */
export async function getCargosPorUsuarioController(req, res) {
  try {
    const { rut } = req.params;

    const [cargos, errorCargos] = await getCargosPorUsuarioService(rut);

    if (errorCargos) return handleErrorClient(res, 404, errorCargos);

    cargos.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Cargos encontrados", cargos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener el cargo actual de un usuario
 */
export async function getCargoActualController(req, res) {
  try {
    const { rut } = req.params;

    const [cargoActual, errorCargoActual] = await getCargoActualService(rut);

    if (errorCargoActual) return handleErrorClient(res, 404, errorCargoActual);

    handleSuccess(res, 200, "Cargo actual encontrado", cargoActual);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Finalizar un cargo de usuario
 */
export async function finalizarCargoController(req, res) {
  try {
    const { rut, idCargo } = req.params;
    const { body } = req;

    const { error } = finalizarCargoValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [cargo, errorCargo] = await finalizarCargoService(rut, idCargo, body.Fecha_Fin);

    if (errorCargo) return handleErrorClient(res, 400, errorCargo);

    handleSuccess(res, 200, "Cargo finalizado correctamente", cargo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Eliminar una asignación de cargo
 */
export async function deletePoseeCargoController(req, res) {
  try {
    const { rut, idCargo } = req.params;

    const [cargo, errorCargo] = await deletePoseeCargoService(rut, idCargo);

    if (errorCargo) return handleErrorClient(res, 404, errorCargo);

    handleSuccess(res, 200, "Asignación de cargo eliminada correctamente", cargo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
