"use strict";
import {
  createMarcaService,
  getMarcaService,
  getMarcasService,
  updateMarcaService,
  deleteMarcaService,
} from "../services/marca.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { marcaValidation } from "../validations/marca.validation.js";

export async function createMarca(req, res) {
  try {
    const { body } = req;

    const { error: validationError } = marcaValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [marca, error] = await createMarcaService(body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Marca creada exitosamente", marca);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getMarca(req, res) {
  try {
    const { id } = req.params;

    const [marca, error] = await getMarcaService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Marca encontrada", marca);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getMarcas(req, res) {
  try {
    const [marcas, error] = await getMarcasService();

    if (error) return handleErrorClient(res, 404, error);

    marcas.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Marcas encontradas", marcas);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateMarca(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error: validationError } = marcaValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [marca, error] = await updateMarcaService(id, body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Marca actualizada correctamente", marca);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteMarca(req, res) {
  try {
    const { id } = req.params;

    const [marca, error] = await deleteMarcaService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Marca eliminada correctamente", marca);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
