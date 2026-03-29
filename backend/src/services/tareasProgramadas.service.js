"use strict";
import { AppDataSource } from "../config/configDb.js";
import Solicitud from "../entity/solicitud.entity.js";
import User from "../entity/user.entity.js";
import Autorizacion from "../entity/autorizacion.entity.js";
import Prestamo from "../entity/prestamo.entity.js";
import TieneEstado from "../entity/tiene_estado.entity.js";
import Equipos from "../entity/equipos.entity.js";
import EstadoSchema from "../entity/estado.entity.js";
import { enviarEmailAvisoAtraso, enviarEmailRecordatorioDirectores } from "./email.service.js";
import { IsNull, LessThan } from "typeorm";

/**
 * Proceso para agrupar y notificar a los Directores sobre solicitudes de Largo Plazo 
 * que lleven más de 24 horas pendientes de revisión (estado Null en Préstamo).
 */
export async function notifyPendingDirectors() {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const solicitudRepository = queryRunner.manager.getRepository(Solicitud);
    const userRepository = queryRunner.manager.getRepository(User);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    console.log(`[CHRONOS] Iniciando revisión de recordatorios a Directores. Límite: ${twentyFourHoursAgo.toLocaleString()}`);

    // Filtrar solicitudes de Largo Plazo (Fecha_inicio_sol y Fecha_termino no Nulas)
    // Que sigan pendientes (ID_Prestamo Null) y tengan más de 24h desde Fecha_Sol
    const pendingSolicitudes = await solicitudRepository.createQueryBuilder("solicitud")
        .leftJoinAndSelect("solicitud.usuario", "usuario")
        .leftJoinAndSelect("usuario.tipoUsuario", "tipoUsuario")
        .where("solicitud.ID_Prestamo IS NULL")
        .andWhere("solicitud.Fecha_inicio_sol IS NOT NULL")
        .andWhere("solicitud.Fecha_termino_sol IS NOT NULL")
        .andWhere("solicitud.Fecha_Sol < :timeLimit", { timeLimit: twentyFourHoursAgo })
        .getMany();

    if (pendingSolicitudes.length === 0) {
      console.log("[CHRONOS] No hay solicitudes pendientes > 24hrs para notificar a Directores.");
      return;
    }

    let countIECI = 0;
    let countICI = 0;

    pendingSolicitudes.forEach(s => {
       const tipo = s.usuario?.tipoUsuario?.Descripcion;
       const carrera = s.usuario?.ID_Carrera;
       // Validar quién debe revisarlo
       if (tipo === "Profesor") {
           countIECI++; // Profesores suman para ambos directores
           countICI++;
       } else if (tipo === "Alumno") {
           if (carrera === 1) countIECI++;
           if (carrera === 2) countICI++;
       }
    });

    // Enviar correos si hay solicitudes pendientes para informar
    if (countIECI > 0) {
        const directoresIECI = await userRepository.find({ where: { ID_Cargo: 1, Vigente: true }});
        for (const dir of directoresIECI) {
            await enviarEmailRecordatorioDirectores(dir, countIECI);
        }
    }

    if (countICI > 0) {
        const directoresICI = await userRepository.find({ where: { ID_Cargo: 2, Vigente: true }});
        for (const dir of directoresICI) {
            await enviarEmailRecordatorioDirectores(dir, countICI);
        }
    }

    console.log(`[CHRONOS] Recordatorios enviados con éxito: ${countIECI} solicitudes pendientes para IECI, ${countICI} para ICI.`);

  } catch (error) {
    console.error("[CHRONOS] CRITICAL ERROR en notifyPendingDirectors:", error);
  } finally {
    await queryRunner.release();
  }
}

/**
 * Proceso para verificar préstamos vencidos y notificar a los usuarios
 */
export async function checkPrestamosVencidos() {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
        const prestamoRepository = queryRunner.manager.getRepository(Prestamo);
        const now = new Date();
        // Normalizar 'now' al inicio del día para comparaciones justas si se quisiera, 
        // pero Fecha_fin_prestamo suele tener hora exacta o fin del día.
        // Usaremos timestamp actual: Si ya pasó la fecha y hora de término, es vencido.

        console.log(`[CHRONOS] Iniciando revisión de préstamos vencidos a las ${now.toLocaleString()}...`);

        // Buscar préstamos que:
        // 1. Su fecha de término sea menor a AHORA
        // 2. NO tengan devolución asociada (están activos)
        // 3. Su estado sea 'Entregado' (Cod_Estado = 3). 
        //    (Validamos el estado después de traerlos para simplificar la query o usamos join)
        
        const prestamosVencidos = await prestamoRepository.createQueryBuilder("prestamo")
            .leftJoinAndSelect("prestamo.solicitudes", "solicitud")
            .leftJoinAndSelect("solicitud.usuario", "usuario")
            .leftJoinAndSelect("prestamo.equipos", "equipo")
            .leftJoinAndSelect("equipo.marca", "marca")
            .leftJoinAndSelect("equipo.categoria", "categoria")
            .leftJoinAndSelect("prestamo.tieneEstados", "tieneEstado") 
            .leftJoinAndSelect("tieneEstado.estadoPrestamo", "estadoPrestamo")
            .leftJoin("prestamo.devolucion", "devolucion") // Join para verificar existencia
            .where("prestamo.Fecha_fin_prestamo < :now", { now })
            .andWhere("devolucion.ID_Devolucion IS NULL") // Solo los NO devueltos
            .getMany();
            
        let notificados = 0;
        
        for (const p of prestamosVencidos) {
            // Verificar que el último estado sea realmente "Entregado"
            // Esto previene notificar préstamos que quizás quedaron en limbo o rechazados después de fecha
            const estados = p.tieneEstados || [];
            // Ordenar por ID descendente (el más reciente)
            estados.sort((a,b) => b.ID_Tiene_Estado - a.ID_Tiene_Estado);
            
            const ultimoEstado = estados.length > 0 ? estados[0] : null;
            
             // Cod_Estado 3 = "Listo para recepcionar" (Entregado al usuario)
            if (ultimoEstado && ultimoEstado.Cod_Estado === 3) {
                 const fechaFin = new Date(p.Fecha_fin_prestamo);
                 const diffTime = now.getTime() - fechaFin.getTime();
                 const diasRetraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 
                 if (diasRetraso > 0) {
                     // Obtener solicitud para datos de usuario
                     const solicitud = p.solicitudes && p.solicitudes.length > 0 ? p.solicitudes[0] : null;

                     if (solicitud && solicitud.usuario) {
                         // Asignar equipo al objeto solicitud para el template de correo
                         solicitud.equipo = p.equipos; 
                         
                         await enviarEmailAvisoAtraso(solicitud, diasRetraso, fechaFin);
                         notificados++;
                     }
                 }
            }
        }
        
        if (notificados > 0) {
            console.log(`[CHRONOS] Revisión finalizada. Se enviaron ${notificados} avisos de atraso.`);
        } else {
             console.log(`[CHRONOS] Revisión finalizada. No se encontraron préstamos vencidos nuevos.`);
        }

    } catch (error) {
        console.error("[CHRONOS] Error checking overdue loans:", error);
    } finally {
        await queryRunner.release();
    }
}

/**
 * Inicia el intervalo de revisión
 */
export function startCronJobs() {
    console.log("[CHRONOS] Iniciando servicio de tareas programadas...");
    
    // 1. Notificación de solicitudes de largo plazo pendientes a Directores (cada 24 horas)
    // Se ejecuta pasados unos segundos para no chocar con el boot, luego diariamente.
    setTimeout(() => notifyPendingDirectors(), 45000); 
    setInterval(() => notifyPendingDirectors(), 86400000);
    
    // 2. Notificación de préstamos vencidos (cada 24 horas)
    // Se ejecuta al minuto para verificar al inicio, luego diariamente
    setTimeout(() => checkPrestamosVencidos(), 60000);
    setInterval(() => checkPrestamosVencidos(), 86400000); 
}
