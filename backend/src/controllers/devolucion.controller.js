"use strict";
import {
  getDevolucionesPorUsuarioService,
  getDevolucionesService,
  getDevolucionService,
  registrarDevolucionService,
} from "../services/devolucion.service.js";
import { devolucionValidation } from "../validations/devolucion.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Registrar una devolución de equipo
 */
export async function registrarDevolucionController(req, res) {
  try {
    const { body } = req;

    const { error } = devolucionValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [devolucion, errorDevolucion] = await registrarDevolucionService(body);

    if (errorDevolucion) return handleErrorClient(res, 400, errorDevolucion);

    handleSuccess(res, 201, "Devolución registrada correctamente", devolucion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todas las devoluciones
 */
export async function getDevolucionesController(req, res) {
  try {
    const [devoluciones, errorDevoluciones] = await getDevolucionesService();

    if (errorDevoluciones) return handleErrorClient(res, 404, errorDevoluciones);

    devoluciones.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Devoluciones encontradas", devoluciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener devoluciones por usuario (RUT)
 */
export async function getDevolucionesPorUsuarioController(req, res) {
  try {
    const { rut } = req.params;

    const [devoluciones, errorDevoluciones] = await getDevolucionesPorUsuarioService(rut);

    if (errorDevoluciones) return handleErrorClient(res, 404, errorDevoluciones);

    devoluciones.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Devoluciones encontradas", devoluciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener una devolución por ID
 */
export async function getDevolucionController(req, res) {
  try {
    const { id } = req.params;

    const [devolucion, errorDevolucion] = await getDevolucionService(id);

    if (errorDevolucion) return handleErrorClient(res, 404, errorDevolucion);

    handleSuccess(res, 200, "Devolución encontrada", devolucion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
