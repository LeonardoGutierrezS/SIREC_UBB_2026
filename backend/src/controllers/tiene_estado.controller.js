"use strict";
import {
  createTieneEstadoService,
  getEstadoActualService,
  getHistorialEstadosService,
} from "../services/tiene_estado.service.js";
import { tieneEstadoValidation } from "../validations/tiene_estado.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Crear un registro de estado para un préstamo
 */
export async function createTieneEstadoController(req, res) {
  try {
    const { body } = req;

    const { error } = tieneEstadoValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [tieneEstado, errorTieneEstado] = await createTieneEstadoService(body);

    if (errorTieneEstado) return handleErrorClient(res, 400, errorTieneEstado);

    handleSuccess(res, 201, "Estado registrado correctamente", tieneEstado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener historial completo de estados de un equipo
 */
export async function getHistorialEstadosController(req, res) {
  try {
    const { idEquipo } = req.params;

    const [historial, errorHistorial] = await getHistorialEstadosService(idEquipo);

    if (errorHistorial) return handleErrorClient(res, 404, errorHistorial);

    historial.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Historial de estados encontrado", historial);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener el estado actual de un equipo (último registro)
 */
export async function getEstadoActualController(req, res) {
  try {
    const { idEquipo } = req.params;

    const [estadoActual, errorEstadoActual] = await getEstadoActualService(idEquipo);

    if (errorEstadoActual) return handleErrorClient(res, 404, errorEstadoActual);

    handleSuccess(res, 200, "Estado actual encontrado", estadoActual);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
