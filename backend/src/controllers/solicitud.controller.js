"use strict";
import {
  createSolicitudService,
  deleteSolicitudService,
  getSolicitudesPorPrestamoService,
  getSolicitudesPorUsuarioService,
  getSolicitudesService,
  getSolicitudService,  
} from "../services/solicitud.service.js";
import { generarPDFAutorizacion } from "../services/pdf.service.js";
import { solicitudValidation } from "../validations/solicitud.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Crear una nueva solicitud de préstamo
 */
export async function createSolicitudController(req, res) {
  try {
    const { body } = req;

    const { error } = solicitudValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [solicitud, errorSolicitud] = await createSolicitudService(body);

    if (errorSolicitud) return handleErrorClient(res, 400, errorSolicitud);

    handleSuccess(res, 201, "Solicitud creada correctamente", solicitud);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todas las solicitudes
 */
export async function getSolicitudesController(req, res) {
  try {
    const [solicitudes, errorSolicitudes] = await getSolicitudesService();

    if (errorSolicitudes) return handleErrorClient(res, 404, errorSolicitudes);

    let filteredSolicitudes = solicitudes;

    // Si el usuario es Director, filtrar por su carrera
    if (req.user.esDirectorEscuela && req.user.idCarrera) {
      filteredSolicitudes = solicitudes.filter(sol => 
        sol.usuario?.ID_Carrera === req.user.idCarrera
      );
    }

    filteredSolicitudes.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Solicitudes encontradas", filteredSolicitudes);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener solicitudes por usuario (RUT)
 */
export async function getSolicitudesPorUsuarioController(req, res) {
  try {
    const { rut } = req.params;

    const [solicitudes, errorSolicitudes] = await getSolicitudesPorUsuarioService(rut);

    if (errorSolicitudes) return handleErrorClient(res, 404, errorSolicitudes);

    solicitudes.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Solicitudes encontradas", solicitudes);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener mis solicitudes (usuario autenticado)
 */
export async function getMisSolicitudesController(req, res) {
  try {
    const rut = req.user.rut; // Obtener RUT del usuario autenticado
    console.log("[DEBUG] getMisSolicitudesController - RUT del usuario:", rut);

    const [solicitudes, errorSolicitudes] = await getSolicitudesPorUsuarioService(rut);

    if (errorSolicitudes) {
      console.log("[DEBUG] getMisSolicitudesController - Error en service:", errorSolicitudes);
      return handleErrorClient(res, 404, errorSolicitudes);
    }

    console.log("[DEBUG] getMisSolicitudesController - Cantidad encontrada:", solicitudes?.length || 0);

    solicitudes.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Solicitudes encontradas", solicitudes);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener solicitudes por préstamo
 */
export async function getSolicitudesPorPrestamoController(req, res) {
  try {
    const { idPrestamo } = req.params;

    const [solicitudes, errorSolicitudes] = await getSolicitudesPorPrestamoService(idPrestamo);

    if (errorSolicitudes) return handleErrorClient(res, 404, errorSolicitudes);

    solicitudes.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Solicitudes del préstamo encontradas", solicitudes);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener una solicitud por ID de Solicitud
 */
export async function getSolicitudController(req, res) {
  try {
    const { idSolicitud } = req.params;

    const [solicitud, errorSolicitud] = await getSolicitudService(parseInt(idSolicitud));

    if (errorSolicitud) return handleErrorClient(res, 404, errorSolicitud);

    handleSuccess(res, 200, "Solicitud encontrada", solicitud);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Eliminar una solicitud
 */
export async function deleteSolicitudController(req, res) {
  try {
    const { idSolicitud } = req.params;

    const [solicitud, errorSolicitud] = await deleteSolicitudService(parseInt(idSolicitud));

    if (errorSolicitud) return handleErrorClient(res, 404, errorSolicitud);

    handleSuccess(res, 200, "Solicitud eliminada correctamente", solicitud);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Descargar PDF de autorización de préstamo
 */
export async function descargarPDFAutorizacionController(req, res) {
  try {
    const { idSolicitud } = req.params;
    const adminName = req.user?.nombreCompleto;

    const doc = await generarPDFAutorizacion(parseInt(idSolicitud), adminName);

    // Configurar headers para descarga de PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=autorizacion-prestamo-${idSolicitud}.pdf`
    );

    // Enviar el PDF
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    handleErrorServer(res, 500, error.message);
  }
}
