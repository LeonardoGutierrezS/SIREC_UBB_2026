"use strict";
import {
  createEstadoService,
  getEstadoService,
  getEstadosService,
  updateEstadoService,
  deleteEstadoService,
} from "../services/estado.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { estadoValidation } from "../validations/estado.validation.js";

export async function createEstado(req, res) {
  try {
    const { body } = req;

    const { error: validationError } = estadoValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [estado, error] = await createEstadoService(body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Estado creado exitosamente", estado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEstado(req, res) {
  try {
    const { id } = req.params;

    const [estado, error] = await getEstadoService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Estado encontrado", estado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEstados(req, res) {
  try {
    const [estados, error] = await getEstadosService();

    if (error) return handleErrorClient(res, 404, error);

    estados.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Estados encontrados", estados);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateEstado(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error: validationError } = estadoValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [estado, error] = await updateEstadoService(id, body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Estado actualizado correctamente", estado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteEstado(req, res) {
  try {
    const { id } = req.params;

    const [estado, error] = await deleteEstadoService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Estado eliminado correctamente", estado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
