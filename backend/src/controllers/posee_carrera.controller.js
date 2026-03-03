"use strict";
import {
    createPoseeCarreraService,
    deletePoseeCarreraService,
    getCarreraPorUsuarioService,
    getEstudiantesPorCarreraService,
    updateAnioIngresoService,
} from "../services/posee_carrera.service.js";
import {
    poseeCarreraValidation,
    updateAnioIngresoValidation,
} from "../validations/posee_carrera.validation.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Asignar una carrera a un estudiante
 */
export async function createPoseeCarreraController(req, res) {
  try {
    const { body } = req;

    const { error } = poseeCarreraValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [poseeCarrera, errorPoseeCarrera] = await createPoseeCarreraService(body);

    if (errorPoseeCarrera) return handleErrorClient(res, 400, errorPoseeCarrera);

    handleSuccess(res, 201, "Carrera asignada correctamente", poseeCarrera);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener la carrera de un estudiante
 */
export async function getCarreraPorUsuarioController(req, res) {
  try {
    const { rut } = req.params;

    const [carrera, errorCarrera] = await getCarreraPorUsuarioService(rut);

    if (errorCarrera) return handleErrorClient(res, 404, errorCarrera);

    handleSuccess(res, 200, "Carrera encontrada", carrera);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todos los estudiantes de una carrera
 */
export async function getEstudiantesPorCarreraController(req, res) {
  try {
    const { idCarrera } = req.params;

    const [estudiantes, errorEstudiantes] = await getEstudiantesPorCarreraService(idCarrera);

    if (errorEstudiantes) return handleErrorClient(res, 404, errorEstudiantes);

    estudiantes.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Estudiantes encontrados", estudiantes);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Actualizar el año de ingreso de un estudiante
 */
export async function updateAnioIngresoController(req, res) {
  try {
    const { rut, idCarrera } = req.params;
    const { body } = req;

    const { error } = updateAnioIngresoValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [carrera, errorCarrera] = await updateAnioIngresoService(rut, idCarrera, body.Anio_Ingreso);

    if (errorCarrera) return handleErrorClient(res, 400, errorCarrera);

    handleSuccess(res, 200, "Año de ingreso actualizado correctamente", carrera);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Eliminar una asignación de carrera
 */
export async function deletePoseeCarreraController(req, res) {
  try {
    const { rut, idCarrera } = req.params;

    const [carrera, errorCarrera] = await deletePoseeCarreraService(rut, idCarrera);

    if (errorCarrera) return handleErrorClient(res, 404, errorCarrera);

    handleSuccess(res, 200, "Asignación de carrera eliminada correctamente", carrera);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
