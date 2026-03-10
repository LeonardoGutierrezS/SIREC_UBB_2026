"use strict";
import { AppDataSource } from "../config/configDb.js";
import Solicitud from "../entity/solicitud.entity.js";
import Autorizacion from "../entity/autorizacion.entity.js";
import Prestamo from "../entity/prestamo.entity.js";
import TieneEstado from "../entity/tiene_estado.entity.js";
import Equipos from "../entity/equipos.entity.js";
import EstadoSchema from "../entity/estado.entity.js";
import { enviarEmailSolicitudRechazadaAutomatico, enviarEmailAvisoAtraso } from "./email.service.js";
import { IsNull, LessThan } from "typeorm";

/**
 * Proceso para rechazar automáticamente solicitudes de largo plazo que no han sido
 * procesadas en un plazo de 48 horas.
 */
export async function rejectExpiredSolicitudes() {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const solicitudRepository = queryRunner.manager.getRepository(Solicitud);
    const prestamoRepository = queryRunner.manager.getRepository(Prestamo);
    const autorizacionRepository = queryRunner.manager.getRepository(Autorizacion);
    const tieneEstadoRepository = queryRunner.manager.getRepository(TieneEstado);
    const equipoRepository = queryRunner.manager.getRepository(Equipos);

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

    console.log(`[CHRONOS] Iniciando revisión. Ahora: ${now.toLocaleString()}. Límite expiración: ${fortyEightHoursAgo.toLocaleString()}`);

    // Filtro explícito usando IsNull() para garantizar que solo se traigan las no procesadas
    const pendingSolicitudes = await solicitudRepository.find({
      where: {
        ID_Prestamo: IsNull()
      },
      relations: ["usuario", "equipo", "equipo.marca", "equipo.categoria", "equipo.especificaciones", "usuario.tipoUsuario"]
    });

    if (pendingSolicitudes.length === 0) {
      console.log("[CHRONOS] No hay solicitudes pendientes para revisar.");
      await queryRunner.rollbackTransaction();
      return;
    }

    // Filtrar manualmente para logging preciso
    const expiredList = pendingSolicitudes.filter(s => {
      const isLargoPlazo = s.Fecha_inicio_sol && s.Fecha_termino_sol;
      if (!isLargoPlazo) return false;

      const fechaSol = new Date(s.Fecha_Sol);
      const isExpired = fechaSol < fortyEightHoursAgo;
      
      if (isExpired) {
        console.log(`[CHRONOS] DETECTADA EXPIRADA: ID=${s.ID_Solicitud}, FechaSol=${fechaSol.toLocaleString()}, Usuario=${s.usuario?.Nombre_Completo}`);
      }
      return isExpired;
    });

    if (expiredList.length === 0) {
      console.log("[CHRONOS] No se encontraron solicitudes que cumplan el criterio de expiración (Largo Plazo + 48hrs).");
      await queryRunner.rollbackTransaction();
      return;
    }

    console.log(`[CHRONOS] Procesando ${expiredList.length} solicitudes expiradas...`);

    for (const solicitud of expiredList) {
      // Doble verificación: cargar la solicitud desde la DB dentro de la transacción para estar 100% seguros
      const currentSol = await solicitudRepository.findOne({
        where: { ID_Solicitud: solicitud.ID_Solicitud, ID_Prestamo: IsNull() }
      });
      
      if (!currentSol) {
        console.log(`[CHRONOS] Solicitud ID=${solicitud.ID_Solicitud} ya no está pendiente, saltando.`);
        continue;
      }

      // 1. Crear Préstamo
      const newPrestamo = prestamoRepository.create({
        ID_Num_Inv: solicitud.ID_Num_Inv,
        Fecha_inicio_prestamo: new Date(),
        Hora_inicio_prestamo: new Date().toLocaleTimeString('es-CL', { hour12: false }),
      });
      const prestamoSaved = await prestamoRepository.save(newPrestamo);

      // 2. Autorización de rechazo automático
      const newAutorizacion = autorizacionRepository.create({
        Rut: "21308770-3", // Admin Sistema
        ID_Prestamo: prestamoSaved.ID_Prestamo,
        Fecha_Aut: new Date(),
        Hora_Aut: new Date().toLocaleTimeString('es-CL', { hour12: false }),
        Obs_Aut: "Rechazo automático del sistema: Expiración de plazo de 48 horas.",
      });
      await autorizacionRepository.save(newAutorizacion);

      // 3. Estado Rechazado
      const newEstado = tieneEstadoRepository.create({
        ID_Prestamo: prestamoSaved.ID_Prestamo,
        Cod_Estado: 5,
        Fecha_Estado: new Date(),
        Hora_Estado: new Date().toLocaleTimeString('es-CL', { hour12: false }),
        Obs_Estado: "Solicitud rechazada automáticamente por el sistema tras 48 horas.",
      });
      await tieneEstadoRepository.save(newEstado);

      // 4. Vincular Solicitud (Uso la entidad prestamo directamente para asegurar persistencia)
      solicitud.prestamo = prestamoSaved;
      await solicitudRepository.save(solicitud);

      // 5. Liberar Equipo y actualizar estado a Disponible
      const estadoRepository = queryRunner.manager.getRepository(EstadoSchema);
      const estadoDisponible = await estadoRepository.findOne({ where: { Descripcion: "Disponible" } });

      await equipoRepository.update(
        { ID_Num_Inv: solicitud.ID_Num_Inv },
        { 
          Disponible: true,
          estado: estadoDisponible
        }
      );

      console.log(`[CHRONOS] Solicitud ID=${solicitud.ID_Solicitud} marcada como RECHAZADA exitosamente.`);
      
      // 6. Notificar por correo
      try {
        await enviarEmailSolicitudRechazadaAutomatico(solicitud);
      } catch (emailErr) {
        console.error(`[CHRONOS] Error al enviar email para ID=${solicitud.ID_Solicitud}:`, emailErr);
      }
    }

    await queryRunner.commitTransaction();
    console.log(`[CHRONOS] Task finalizada correctamente.`);

  } catch (error) {
    console.error("[CHRONOS] CRITICAL ERROR:", error);
    await queryRunner.rollbackTransaction();
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
    
    // 1. Rechazo automático de solicitudes expiradas (cada 1 hora)
    setTimeout(() => rejectExpiredSolicitudes(), 30000); 
    setInterval(() => rejectExpiredSolicitudes(), 3600000);
    
    // 2. Notificación de préstamos vencidos (cada 24 horas)
    // Se ejecuta al minuto para verificar al inicio, luego diariamente
    setTimeout(() => checkPrestamosVencidos(), 60000);
    setInterval(() => checkPrestamosVencidos(), 86400000); 
}
