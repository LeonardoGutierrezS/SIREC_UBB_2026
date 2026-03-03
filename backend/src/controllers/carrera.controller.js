"use strict";
import {
  createCarreraService,
  deleteCarreraService,
  getCarreraService,
  getCarrerasService,
  updateCarreraService,
} from "../services/carrera.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  carreraIdValidation,
  carreraValidation,
} from "../validations/carrera.validation.js";

export async function createCarrera(req, res) {
  try {
    const { body } = req;

    const { error: validationError } = carreraValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [carrera, error] = await createCarreraService(body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Carrera creada exitosamente", carrera);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getCarrera(req, res) {
  try {
    const { id } = req.params;

    const [carrera, error] = await getCarreraService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Carrera encontrada", carrera);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getCarreras(req, res) {
  try {
    const [carreras, error] = await getCarrerasService();

    if (error) return handleErrorClient(res, 404, error);

    carreras.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Carreras encontradas", carreras);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateCarrera(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error: validationError } = carreraValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [carrera, error] = await updateCarreraService(id, body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Carrera actualizada correctamente", carrera);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteCarrera(req, res) {
  try {
    const { id } = req.params;

    const [carrera, error] = await deleteCarreraService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Carrera eliminada correctamente", carrera);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
