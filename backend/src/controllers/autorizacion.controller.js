"use strict";
import {
  aprobarSolicitudService,
  getAutorizacionesService,
  rechazarSolicitudService,
} from "../services/autorizacion.service.js";
import {
  aprobarSolicitudValidation,
  rechazarSolicitudValidation,
} from "../validations/autorizacion.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Aprobar una solicitud y crear préstamo
 */
export async function aprobarSolicitudController(req, res) {
  try {
    const { body } = req;

    const { error } = aprobarSolicitudValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [resultado, errorResultado] = await aprobarSolicitudService(body);

    if (errorResultado) return handleErrorClient(res, 400, errorResultado);

    handleSuccess(res, 201, "Solicitud aprobada y préstamo creado correctamente", resultado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Rechazar una solicitud
 */
export async function rechazarSolicitudController(req, res) {
  try {
    const { body } = req;

    const { error } = rechazarSolicitudValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [autorizacion, errorAutorizacion] = await rechazarSolicitudService(body);

    if (errorAutorizacion) return handleErrorClient(res, 400, errorAutorizacion);

    handleSuccess(res, 201, "Solicitud rechazada correctamente", autorizacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todas las autorizaciones
 */
export async function getAutorizacionesController(req, res) {
  try {
    const [autorizaciones, errorAutorizaciones] = await getAutorizacionesService();

    if (errorAutorizaciones) return handleErrorClient(res, 404, errorAutorizaciones);

    autorizaciones.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Autorizaciones encontradas", autorizaciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
