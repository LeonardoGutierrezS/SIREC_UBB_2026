"use strict";
import {
  createPrestamoService,
  getPrestamoService,
  getPrestamosService,
  getPrestamosPorUsuarioService,
  getPrestamosActivosService,
  updatePrestamoService,
  finalizarPrestamoService,
  deletePrestamoService,
} from "../services/prestamo.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  finalizarPrestamoValidation,
  prestamoValidation,
} from "../validations/prestamo.validation.js";

export async function createPrestamo(req, res) {
  try {
    const { body } = req;

    // Agregar el RUT del usuario desde el token JWT
    const prestamoData = {
      ...body,
      Rut: req.user.rut, // Tomar el RUT del usuario autenticado
    };

    const { error: validationError } = prestamoValidation.validate(prestamoData);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [prestamo, error] = await createPrestamoService(prestamoData);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Préstamo creado exitosamente", prestamo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getPrestamo(req, res) {
  try {
    const { id } = req.params;

    const [prestamo, error] = await getPrestamoService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Préstamo encontrado", prestamo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getPrestamos(req, res) {
  try {
    const [prestamos, error] = await getPrestamosService();

    if (error) return handleErrorClient(res, 404, error);

    const message = prestamos.length === 0 ? "No hay préstamos registrados" : "Préstamos encontrados";
    handleSuccess(res, 200, message, prestamos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getPrestamosPorUsuario(req, res) {
  try {
    // Si viene de /usuario/mis-prestamos, usar el RUT del usuario autenticado
    const rut = req.params.rut || req.user.rut;

    const [prestamos, error] = await getPrestamosPorUsuarioService(rut);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Préstamos del usuario encontrados", prestamos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getPrestamosActivos(req, res) {
  try {
    const [prestamos, error] = await getPrestamosActivosService();

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Préstamos activos encontrados", prestamos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updatePrestamo(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const [prestamo, error] = await updatePrestamoService(id, body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Préstamo actualizado correctamente", prestamo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function finalizarPrestamo(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error: validationError } = finalizarPrestamoValidation.validate(body);

    if (validationError) {
      return handleErrorClient(
        res,
        400,
        validationError.details[0].message,
      );
    }

    const [prestamo, error] = await finalizarPrestamoService(id, body);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Préstamo finalizado correctamente", prestamo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deletePrestamo(req, res) {
  try {
    const { id } = req.params;

    const [prestamo, error] = await deletePrestamoService(id);

    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(res, 200, "Préstamo eliminado correctamente", prestamo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
