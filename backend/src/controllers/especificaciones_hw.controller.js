"use strict";
import {
  createEspecificacionService,
  getEspecificacionesPorEquipoService,
  updateEspecificacionService,
  deleteEspecificacionService,
} from "../services/especificaciones_hw.service.js";
import {
  especificacionHWValidation,
  updateEspecificacionHWValidation,
} from "../validations/especificaciones_hw.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Crear una nueva especificación de hardware
 */
export async function createEspecificacionController(req, res) {
  try {
    const { body } = req;

    const { error } = especificacionHWValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [especificacion, errorEspecificacion] = await createEspecificacionService(body);

    if (errorEspecificacion) return handleErrorClient(res, 400, errorEspecificacion);

    handleSuccess(res, 201, "Especificación creada correctamente", especificacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todas las especificaciones de un equipo
 */
export async function getEspecificacionesPorEquipoController(req, res) {
  try {
    const { idNumInv } = req.params;

    const [especificaciones, errorEspecificaciones] = await getEspecificacionesPorEquipoService(idNumInv);

    if (errorEspecificaciones) return handleErrorClient(res, 404, errorEspecificaciones);

    especificaciones.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Especificaciones encontradas", especificaciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Actualizar una especificación de hardware
 */
export async function updateEspecificacionController(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error } = updateEspecificacionHWValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [especificacion, errorEspecificacion] = await updateEspecificacionService(id, body);

    if (errorEspecificacion) return handleErrorClient(res, 400, errorEspecificacion);

    handleSuccess(res, 200, "Especificación actualizada correctamente", especificacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Eliminar una especificación de hardware
 */
export async function deleteEspecificacionController(req, res) {
  try {
    const { id } = req.params;

    const [especificacion, errorEspecificacion] = await deleteEspecificacionService(id);

    if (errorEspecificacion) return handleErrorClient(res, 404, errorEspecificacion);

    handleSuccess(res, 200, "Especificación eliminada correctamente", especificacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
