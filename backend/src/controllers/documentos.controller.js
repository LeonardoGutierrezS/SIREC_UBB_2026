"use strict";
import * as documentosService from "../services/documentos.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

/**
 * Sube un acta firmada para un préstamo
 */
export async function subirActa(req, res) {
    try {
        const { id } = req.params;
        if (!req.file) {
            return handleErrorClient(res, 400, "No se ha subido ningún archivo o el formato no es válido");
        }

        const filePath = `uploads/actas/${req.file.filename}`;
        const [prestamo, error] = await documentosService.subirActaSuscritaService(Number(id), filePath);

        if (error) {
            return handleErrorClient(res, 404, error);
        }

        return handleSuccess(res, 200, "Acta subida correctamente", prestamo);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Descarga o visualiza el acta firmada de un préstamo
 */
export async function descargarActa(req, res) {
    try {
        const { id } = req.params;
        const { view } = req.query; // Parámetro opcional para visualizar en lugar de descargar
        
        const [fullPath, error] = await documentosService.getActaPathService(Number(id));

        if (error) {
            return handleErrorClient(res, 404, error);
        }

        if (view === 'true') {
            return res.sendFile(fullPath);
        }

        res.download(fullPath);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtiene la información para generar el acta de una solicitud
 */
export async function getInfoActa(req, res) {
    try {
        const { idSolicitud } = req.params;
        const [data, error] = await documentosService.getInfoParaActaService(Number(idSolicitud));

        if (error) {
            return handleErrorClient(res, 404, error);
        }

        return handleSuccess(res, 200, "Información del acta obtenida", data);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}
/**
 * Actualiza las condiciones de un préstamo
 */
export async function updateCondiciones(req, res) {
    try {
        const { id } = req.params;
        const { condiciones } = req.body;

        if (!condiciones) {
            return handleErrorClient(res, 400, "Las condiciones son requeridas");
        }

        const [prestamo, error] = await documentosService.updateCondicionesService(Number(id), condiciones);

        if (error) {
            return handleErrorClient(res, 404, error);
        }

        return handleSuccess(res, 200, "Condiciones actualizadas correctamente", prestamo);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}
