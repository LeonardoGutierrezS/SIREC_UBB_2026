"use strict";
import { AppDataSource } from "../config/configDb.js";
import Prestamo from "../entity/prestamo.entity.js";
import TieneEstado from "../entity/tiene_estado.entity.js";
import Devolucion from "../entity/devolucion.entity.js";
import Equipos from "../entity/equipos.entity.js";
import EstadoSchema from "../entity/estado.entity.js";
import Penalizaciones from "../entity/penalizaciones.entity.js";
import TienePenalizacion from "../entity/tiene_penalizacion.entity.js";
import { enviarEmailEquipoEntregado, enviarEmailEquipoDevuelto, enviarEmailSancion } from "./email.service.js";

/**
 * Marcar préstamo como entregado (Admin entrega el equipo al alumno)
 * @param {number} idPrestamo - ID del préstamo
 * @param {string} nombreAdmin - Nombre del administrador que entrega
 * @param {string} [tipoDocumento] - Tipo de documento en garantía (opcional)
 * @returns {Promise<[Object|null, string|null]>}
 */
export async function entregarPrestamoService(idPrestamo, nombreAdmin, tipoDocumento = null) {
  try {
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    const tieneEstadoRepository = AppDataSource.getRepository(TieneEstado);

    // Verificar que el préstamo existe
    const prestamo = await prestamoRepository.findOne({
      where: { ID_Prestamo: idPrestamo },
      relations: ["tieneEstados", "tieneEstados.estadoPrestamo", "solicitudes"],
    });

    if (!prestamo) {
      return [null, "El préstamo no existe"];
    }

    // Verificar que el estado actual es "Listo para Entregar" (ID_Estado = 2)
    const estadoActual = prestamo.tieneEstados
      .sort((a, b) => new Date(b.Fecha_Estado) - new Date(a.Fecha_Estado))[0];

    if (!estadoActual || estadoActual.Cod_Estado !== 2) {
      return [null, "El préstamo no está en estado 'Listo para Entregar'"];
    }

    // [NUEVO] Validar que el acta firmada esté subida antes de entregar (SOLO PARA LARGO PLAZO)
    if (prestamo.solicitudes && prestamo.solicitudes.length > 0) {
        const solicitud = prestamo.solicitudes[0];
        
        // Comparación de fechas robusta (ignorar la hora)
        const fechaInicio = new Date(solicitud.Fecha_inicio_sol).setHours(0,0,0,0);
        const fechaTermino = new Date(solicitud.Fecha_termino_sol).setHours(0,0,0,0);
        
        const esLargoPlazo = solicitud.Fecha_inicio_sol && solicitud.Fecha_termino_sol && fechaInicio !== fechaTermino;

        if (esLargoPlazo && !prestamo.Documento_Suscrito) {
            return [null, "Debe subir el acta firmada antes de proceder con la entrega del equipo (Solicitud Largo Plazo)"];
        }
    }

    // Si se proporciona tipoDocumento, actualizar el préstamo
    if (tipoDocumento) {
        prestamo.Tipo_documento = tipoDocumento;
        await prestamoRepository.save(prestamo);
    }

    // Crear nuevo estado "Entregado" (ID_Estado = 3)
    const now = new Date();
    const horaActual = now.toTimeString().split(" ")[0];

    const nuevoEstado = tieneEstadoRepository.create({
      ID_Prestamo: idPrestamo,
      Cod_Estado: 3, // Estado "Entregado"
      Fecha_Estado: now,
      Hora_Estado: horaActual,
      Obs_Estado: `Equipo entregado por administrador (${nombreAdmin})`,
    });

    await tieneEstadoRepository.save(nuevoEstado);

    // Obtener préstamo actualizado con todas las relaciones
    const prestamoActualizado = await prestamoRepository.findOne({
      where: { ID_Prestamo: idPrestamo },
      relations: [
        "equipos",
        "equipos.marca",
        "equipos.categoria",
        "equipos.especificaciones",
        "solicitudes",
        "solicitudes.usuario",
        "solicitudes.equipo",
        "solicitudes.equipo.marca",
        "solicitudes.equipo.categoria",
        "solicitudes.equipo.especificaciones",
        "tieneEstados",
        "tieneEstados.estadoPrestamo",
      ],
    });

    // Enviar notificación por correo
    if (prestamoActualizado && prestamoActualizado.solicitudes && prestamoActualizado.solicitudes.length > 0) {
      await enviarEmailEquipoEntregado(prestamoActualizado.solicitudes[0], prestamoActualizado);
    }

    return [prestamoActualizado, null];
  } catch (error) {
    console.error("Error al entregar préstamo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Registrar devolución de préstamo (Admin recibe el equipo del alumno)
 * @param {Object} data - Datos de la devolución
 * @returns {Promise<[Object|null, string|null]>}
 */
export async function devolverPrestamoService(data) {
  try {
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    const tieneEstadoRepository = AppDataSource.getRepository(TieneEstado);
    const devolucionRepository = AppDataSource.getRepository(Devolucion);
    const equipoRepository = AppDataSource.getRepository(Equipos);

    const { ID_Prestamo, Rut_Recibe, Fecha_Dev, Hora_Dev, Obs_Dev, Estado_Equipo_Devolucion } = data;

    // Verificar que el préstamo existe
    const prestamo = await prestamoRepository.findOne({
      where: { ID_Prestamo },
      relations: ["tieneEstados", "tieneEstados.estadoPrestamo", "devolucion"],
    });

    if (!prestamo) {
      return [null, "El préstamo no existe"];
    }

    // Verificar que el estado actual es "Entregado" (ID_Estado = 3)
    const estadoActual = prestamo.tieneEstados
      .sort((a, b) => new Date(b.Fecha_Estado) - new Date(a.Fecha_Estado))[0];

    if (!estadoActual || estadoActual.Cod_Estado !== 3) {
      return [null, "El préstamo no está en estado 'Entregado'"];
    }

    // Verificar que no tenga ya una devolución registrada
    if (prestamo.devolucion) {
      return [null, "Este préstamo ya tiene una devolución registrada"];
    }

    // Crear registro de devolución
    const nuevaDevolucion = devolucionRepository.create({
      Rut: Rut_Recibe,
      ID_Prestamo,
      Fecha_Dev: Fecha_Dev || new Date(),
      Hora_Dev: Hora_Dev,
      Obs_Dev: Obs_Dev || null,
      Estado_Equipo_Devolucion: Estado_Equipo_Devolucion || "En buen estado",
    });

    // [NUEVO] Calcular retrasos y aplicar sanciones automáticas
    // -------------------------------------------------------------
    
    // 1. Obtener fecha de devolución (hoy si no se especifica)
    const fechaDev = Fecha_Dev ? new Date(Fecha_Dev) : new Date();
    // Normalizar a medianoche para comparar solo fechas
    const fechaDevNormalizada = new Date(fechaDev.getFullYear(), fechaDev.getMonth(), fechaDev.getDate());
    
    // 2. Obtener fecha límite del préstamo
    let fechaLimite = null;
    if (prestamo.Fecha_fin_prestamo) {
        const fp = new Date(prestamo.Fecha_fin_prestamo);
        fechaLimite = new Date(fp.getFullYear(), fp.getMonth(), fp.getDate());
    } else if (prestamo.solicitudes && prestamo.solicitudes.length > 0 && prestamo.solicitudes[0].Fecha_termino_sol) {
        // Fallback: usar fecha término de la solicitud
        const fs = new Date(prestamo.solicitudes[0].Fecha_termino_sol);
        fechaLimite = new Date(fs.getFullYear(), fs.getMonth(), fs.getDate());
    }

    // 3. Comparar y sancionar si corresponde
    if (fechaLimite && fechaDevNormalizada > fechaLimite) {
         // Calcular días de retraso
         const diffTime = Math.abs(fechaDevNormalizada - fechaLimite);
         const diasRetraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
         
         if (diasRetraso > 0) {
             console.log(`[Sanciones] Retraso detectado: ${diasRetraso} días.`);
             
             const penalizacionesRepo = AppDataSource.getRepository(Penalizaciones);
             const tienePenalizacionRepo = AppDataSource.getRepository(TienePenalizacion);
             
             // Identificar tipo de penalización automática por retraso
             let descripcionPenalizacion = "";
             if (diasRetraso < 7) {
                 descripcionPenalizacion = "Retraso en devolución de equipo (menor a 7 días)";
             } else {
                 descripcionPenalizacion = "Retraso en devolución de equipo (mayor a 7 días)";
             }

             const penalizacion = await penalizacionesRepo.findOne({ where: { Descripcion: descripcionPenalizacion } });
             
             if (penalizacion && prestamo.solicitudes && prestamo.solicitudes.length > 0) {
                 const usuarioRut = prestamo.solicitudes[0].usuario.Rut;
                 
                 // Calcular duración sanción
                 // Prioridad: 1. Valor en DB, 2. Lógica hardcoded
                 const diasSancion = penalizacion.Dias_Sancion || (diasRetraso < 7 ? 3 : 7);
                 
                 const fechaInicioSancion = new Date();
                 const fechaFinSancion = new Date();
                 fechaFinSancion.setDate(fechaInicioSancion.getDate() + diasSancion);
                 
                 // Crear registro de sanción
                 const nuevaSancion = tienePenalizacionRepo.create({
                     Rut: usuarioRut,
                     ID_Penalizaciones: penalizacion.ID_Penalizaciones,
                     Fecha_Inicio: fechaInicioSancion,
                     Fecha_Fin: fechaFinSancion,
                     Motivo_Obs: `Sanción automática. Devolución con ${diasRetraso} días de retraso. (ID Préstamo: ${ID_Prestamo})`
                 });
                 
                 await tienePenalizacionRepo.save(nuevaSancion);
                 console.log(`[Sanciones] Sanción aplicada a usuario ${usuarioRut} por ${diasSancion} días.`);
                 
                 // Enviar correo de notificación de sanción
                 await enviarEmailSancion(prestamo.solicitudes[0], penalizacion, fechaFinSancion, diasRetraso);
             }
         }
    }
    // -------------------------------------------------------------

    await devolucionRepository.save(nuevaDevolucion);

    // Crear nuevo estado "Devuelto" (ID_Estado = 4)
    const now = new Date();
    const horaActual = now.toTimeString().split(" ")[0];

    const nuevoEstado = tieneEstadoRepository.create({
      ID_Prestamo,
      Cod_Estado: 4, // Estado "Devuelto"
      Fecha_Estado: now,
      Hora_Estado: horaActual,
      Obs_Estado: `Equipo devuelto - Estado: ${Estado_Equipo_Devolucion || "En buen estado"}`,
    });

    await tieneEstadoRepository.save(nuevoEstado);

    // Obtener estado Disponible
    const estadoRepository = AppDataSource.getRepository(EstadoSchema);
    const estadoDisponible = await estadoRepository.findOne({ where: { Descripcion: "Disponible" } });

    // Marcar el equipo como disponible nuevamente y actualizar estado
    await equipoRepository.update(
      { ID_Num_Inv: prestamo.ID_Num_Inv },
      { 
        Disponible: true,
        estado: estadoDisponible
      }
    );

    // Obtener préstamo actualizado con todas las relaciones
    const prestamoActualizado = await prestamoRepository.findOne({
      where: { ID_Prestamo },
      relations: [
        "equipos",
        "equipos.marca",
        "equipos.categoria",
        "equipos.especificaciones",
        "solicitudes",
        "solicitudes.usuario",
        "solicitudes.equipo",
        "solicitudes.equipo.marca",
        "solicitudes.equipo.categoria",
        "solicitudes.equipo.especificaciones",
        "tieneEstados",
        "tieneEstados.estadoPrestamo",
        "devolucion",
        "devolucion.usuario",
      ],
    });

    // Enviar notificación por correo
    if (prestamoActualizado && prestamoActualizado.solicitudes && prestamoActualizado.solicitudes.length > 0 && prestamoActualizado.devolucion) {
      await enviarEmailEquipoDevuelto(prestamoActualizado.solicitudes[0], prestamoActualizado.devolucion, prestamoActualizado);
    }

    return [prestamoActualizado, null];
  } catch (error) {
    console.error("Error al registrar devolución:", error);
    return [null, "Error interno del servidor"];
  }
}
