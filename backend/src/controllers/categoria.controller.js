"use strict";
import {
  createCategoriaService,
  deleteCategoriaService,
  getCategoriaService,
  getCategoriasService,
  updateCategoriaService,
  
} from "../services/categoria.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { categoriaValidation } from "../validations/categoria.validation.js";

export async function createCategoria(req, res) {
  try {
    const { body } = req;

    const { error: validationError } = categoriaValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [categoria, error] = await createCategoriaService(body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Categoría creada exitosamente", categoria);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getCategoria(req, res) {
  try {
    const { id } = req.params;

    const [categoria, error] = await getCategoriaService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Categoría encontrada", categoria);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getCategorias(req, res) {
  try {
    const [categorias, error] = await getCategoriasService();

    if (error) return handleErrorClient(res, 404, error);

    categorias.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Categorías encontradas", categorias);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateCategoria(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error: validationError } = categoriaValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [categoria, error] = await updateCategoriaService(id, body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Categoría actualizada correctamente", categoria);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteCategoria(req, res) {
  try {
    const { id } = req.params;

    const [categoria, error] = await deleteCategoriaService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Categoría eliminada correctamente", categoria);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
