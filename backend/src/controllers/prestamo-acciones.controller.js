"use strict";
import {
    devolverPrestamoService,
    entregarPrestamoService,
} from "../services/prestamo-acciones.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Entregar préstamo (Admin entrega el equipo)
 */
export async function entregarPrestamoController(req, res) {
  try {
    const { idPrestamo } = req.params;
    const { nombreCompleto } = req.user;
    const { tipoDocumento } = req.body;

    const [prestamo, error] = await entregarPrestamoService(
      parseInt(idPrestamo),
      nombreCompleto,
      tipoDocumento
    );

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Equipo marcado como entregado", prestamo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Registrar devolución de préstamo (Admin recibe el equipo)
 */
export async function devolverPrestamoController(req, res) {
  try {
    const { idPrestamo } = req.params;
    const { body } = req;

    const now = new Date();
    const horaActual = now.toTimeString().split(" ")[0];

    const data = {
      ID_Prestamo: parseInt(idPrestamo),
      Rut_Recibe: req.user.rut,
      Fecha_Dev: body.Fecha_Dev || now,
      Hora_Dev: body.Hora_Dev || horaActual,
      Obs_Dev: body.Obs_Dev || null,
      Estado_Equipo_Devolucion: body.Estado_Equipo_Devolucion || "En buen estado",
    };

    const [prestamo, error] = await devolverPrestamoService(data);

    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Devolución registrada correctamente", prestamo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
