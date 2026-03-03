"use strict";
import {
  createEquipoService,
  getEquipoService,
  getEquiposService,
  getEquiposDisponiblesService,
  getEquiposPorCategoriaService,
  updateEquipoService,
  deleteEquipoService,
  cambiarDisponibilidadEquipoService,
} from "../services/equipos.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  equipoUpdateValidation,
  equipoValidation,
} from "../validations/equipos.validation.js";

export async function createEquipo(req, res) {
  try {
    const { body } = req;

    const { error: validationError } = equipoValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [equipo, error] = await createEquipoService(body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Equipo creado exitosamente", equipo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEquipo(req, res) {
  try {
    const { id } = req.params;

    const [equipo, error] = await getEquipoService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Equipo encontrado", equipo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEquipos(req, res) {
  try {
    const [equipos, error] = await getEquiposService();

    if (error) return handleErrorClient(res, 404, error);

    const message = equipos.length === 0 ? "No hay equipos registrados" : "Equipos encontrados";
    handleSuccess(res, 200, message, equipos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEquiposDisponibles(req, res) {
  try {
    const [equipos, error] = await getEquiposDisponiblesService();

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Equipos disponibles encontrados", equipos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEquiposPorCategoria(req, res) {
  try {
    const { categoriaId } = req.params;

    const [equipos, error] = await getEquiposPorCategoriaService(categoriaId);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Equipos encontrados", equipos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateEquipo(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error: validationError } = equipoUpdateValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [equipo, error] = await updateEquipoService(id, body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Equipo actualizado correctamente", equipo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteEquipo(req, res) {
  try {
    const { id } = req.params;

    const [equipo, error] = await deleteEquipoService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Equipo eliminado correctamente", equipo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function cambiarDisponibilidadEquipo(req, res) {
  try {
    const { id } = req.params;
    const { disponible } = req.body;

    if (disponible === undefined) {
      return handleErrorClient(res, 400, "El campo disponible es requerido");
    }

    const [equipo, error] = await cambiarDisponibilidadEquipoService(id, disponible);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Disponibilidad del equipo actualizada", equipo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
