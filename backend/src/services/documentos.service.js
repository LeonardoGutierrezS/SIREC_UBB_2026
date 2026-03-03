"use strict";
import { AppDataSource } from "../config/configDb.js";
import Prestamo from "../entity/prestamo.entity.js";
import Autorizacion from "../entity/autorizacion.entity.js";
import Solicitud from "../entity/solicitud.entity.js";
import path from "path";
import fs from "fs";

/**
 * Registra la subida de un acta firmada en el préstamo
 */
export async function subirActaSuscritaService(idPrestamo, filePath) {
    try {
        const prestamoRepository = AppDataSource.getRepository(Prestamo);
        
        // Asegurar que el directorio de destino exista
        const dir = path.join(process.cwd(), 'uploads', 'actas');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const prestamo = await prestamoRepository.findOne({
            where: { ID_Prestamo: idPrestamo }
        });

        if (!prestamo) {
            return [null, "El préstamo no existe"];
        }

        // Si ya existe un documento, podríamos borrar el anterior físicamente
        if (prestamo.Documento_Suscrito) {
            const oldPath = path.join(process.cwd(), prestamo.Documento_Suscrito);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        prestamo.Documento_Suscrito = filePath;
        const prestamoUpdated = await prestamoRepository.save(prestamo);

        return [prestamoUpdated, null];
    } catch (error) {
        console.error("Error al registrar acta:", error);
        return [null, "Error interno al registrar el documento"];
    }
}

/**
 * Obtiene la ruta del acta para su descarga
 */
export async function getActaPathService(idPrestamo) {
    try {
        const prestamoRepository = AppDataSource.getRepository(Prestamo);
        
        const prestamo = await prestamoRepository.findOne({
            where: { ID_Prestamo: idPrestamo }
        });

        if (!prestamo || !prestamo.Documento_Suscrito) {
            return [null, "El documento no existe para este préstamo"];
        }

        const fullPath = path.join(process.cwd(), prestamo.Documento_Suscrito);
        if (!fs.existsSync(fullPath)) {
            return [null, "El archivo físico no se encuentra en el servidor"];
        }

        return [fullPath, null];
    } catch (error) {
        console.error("Error al obtener ruta de acta:", error);
        return [null, "Error interno al buscar el documento"];
    }
}

/**
 * Obtiene toda la información necesaria para generar el acta pre-impresión
 */
export async function getInfoParaActaService(idSolicitud) {
    try {
        const solicitudRepository = AppDataSource.getRepository(Solicitud);
        
        const solicitud = await solicitudRepository.findOne({
            where: { ID_Solicitud: idSolicitud },
            relations: [
                "usuario", 
                "usuario.tipoUsuario", 
                "usuario.carrera", 
                "usuario.cargo",
                "equipo",
                "equipo.marca",
                "equipo.categoria",
                "equipo.especificaciones",
                "prestamo",
                "prestamo.autorizacion",
                "prestamo.autorizacion.usuario",
                "prestamo.autorizacion.usuario.cargo"
            ]
        });

        if (!solicitud) {
            return [null, "La solicitud no existe"];
        }

        const data = {
            idSolicitud: solicitud.ID_Solicitud,
            idPrestamo: solicitud.ID_Prestamo,
            fechaSolicitud: solicitud.Fecha_Sol,
            usuario: {
                nombre: solicitud.usuario.Nombre_Completo,
                rut: solicitud.usuario.Rut,
                correo: solicitud.usuario.Correo,
                tipo: solicitud.usuario.tipoUsuario?.Descripcion,
                carrera: solicitud.usuario.carrera?.Nombre_Carrera || solicitud.usuario.cargo?.Desc_Cargo
            },
            equipo: {
                inv: solicitud.equipo.ID_Num_Inv,
                modelo: solicitud.equipo.Modelo,
                marca: solicitud.equipo.marca?.Descripcion,
                categoria: solicitud.equipo.categoria?.Descripcion,
                specs: solicitud.equipo.especificaciones
            },
            plazo: {
                inicio: solicitud.Fecha_inicio_sol || solicitud.Fecha_Sol,
                fin: solicitud.Fecha_termino_sol || (solicitud.prestamo?.Fecha_fin_prestamo)
            },
            autorizacion: solicitud.prestamo?.autorizacion ? {
                director: solicitud.prestamo.autorizacion.usuario?.Nombre_Completo,
                cargoDirector: solicitud.prestamo.autorizacion.usuario?.cargo?.Desc_Cargo,
                fechaAut: solicitud.prestamo.autorizacion.Fecha_Aut
            } : null
        };

        return [data, null];
    } catch (error) {
        console.error("Error al recopilar info para acta:", error);
        return [null, "Error interno al recopilar datos del acta"];
    }
}

/**
 * Actualiza las condiciones de un préstamo
 */
export async function updateCondicionesService(idPrestamo, condiciones) {
    try {
        const prestamoRepository = AppDataSource.getRepository(Prestamo);
        
        const prestamo = await prestamoRepository.findOne({
            where: { ID_Prestamo: idPrestamo }
        });

        if (!prestamo) {
            return [null, "El préstamo no existe"];
        }

        prestamo.Condiciones_Prestamo = condiciones;
        const prestamoUpdated = await prestamoRepository.save(prestamo);

        return [prestamoUpdated, null];
    } catch (error) {
        console.error("Error al actualizar condiciones:", error);
        return [null, "Error interno al actualizar las condiciones"];
    }
}

