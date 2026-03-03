"use strict";
import Autorizacion from "../entity/autorizacion.entity.js";
import Prestamo from "../entity/prestamo.entity.js";
import Solicitud from "../entity/solicitud.entity.js";
import User from "../entity/user.entity.js";
import Equipos from "../entity/equipos.entity.js";
import TieneEstado from "../entity/tiene_estado.entity.js";
import EstadoSchema from "../entity/estado.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { enviarEmailSolicitudAprobada, enviarEmailSolicitudRechazada, enviarEmailNotificacionAdminAprobacion } from "./email.service.js";
import { Not } from "typeorm";

/**
 * Autorizar (aprobar) una solicitud creando un préstamo
 */
export async function aprobarSolicitudService(body) {
  try {
    const autorizacionRepository = AppDataSource.getRepository(Autorizacion);
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const equipoRepository = AppDataSource.getRepository(Equipos);
    const tieneEstadoRepository = AppDataSource.getRepository(TieneEstado);
    const userRepository = AppDataSource.getRepository(User);

    // Verificar que la solicitud existe
    const solicitudFound = await solicitudRepository.findOne({
      where: { ID_Solicitud: body.ID_Solicitud },
      relations: ["usuario"],
    });

    if (!solicitudFound) {
      return [null, "La solicitud no existe"];
    }

    // Verificar que no tenga préstamo asociado
    if (solicitudFound.ID_Prestamo) {
      return [null, "La solicitud ya tiene un préstamo asociado"];
    }

    // Verificar que el autorizador existe
    const autorizador = await userRepository.findOne({
      where: { Rut: body.Rut_Autorizador },
    });

    if (!autorizador) {
      return [null, "El usuario autorizador no existe"];
    }

    // Validar permisos según el tipo de solicitud y el rol del autorizador
    const errorPermisos = await validarPermisosAutorizacion(solicitudFound, autorizador);
    if (errorPermisos) {
      return [null, errorPermisos];
    }

    // Crear el préstamo
    const newPrestamo = prestamoRepository.create({
      ID_Num_Inv: body.ID_Num_Inv,
      Fecha_inicio_prestamo: body.Fecha_inicio_prestamo || new Date(),
      Hora_inicio_prestamo: body.Hora_inicio_prestamo,
      Fecha_fin_prestamo: body.Fecha_fin_prestamo || null,
      Hora_fin_prestamo: body.Hora_fin_prestamo || null,
      Tipo_documento: body.Tipo_documento || null,
      Condiciones_Prestamo: body.Condiciones_Prestamo || null,
    });

    const prestamoSaved = await prestamoRepository.save(newPrestamo);

    // Crear la autorización
    const newAutorizacion = autorizacionRepository.create({
      Rut: body.Rut_Autorizador,
      ID_Prestamo: prestamoSaved.ID_Prestamo,
      Fecha_Aut: body.Fecha_Aut || new Date(),
      Hora_Aut: body.Hora_Aut,
      Obs_Aut: body.Obs_Aut || null,
    });

    await autorizacionRepository.save(newAutorizacion);

    // Crear el primer estado del préstamo (Listo para Entregar)
    const newEstado = tieneEstadoRepository.create({
      ID_Prestamo: prestamoSaved.ID_Prestamo,
      Cod_Estado: 2, // Estado "Listo para Entregar" - esperando que Admin entregue
      Fecha_Estado: new Date(),
      Hora_Estado: body.Hora_Aut,
      Obs_Estado: "Solicitud aprobada por Director - Lista para entregar",
    });

    await tieneEstadoRepository.save(newEstado);

    // Actualizar la solicitud con el ID del préstamo
    await solicitudRepository.update(
      { ID_Solicitud: body.ID_Solicitud },
      { ID_Prestamo: prestamoSaved.ID_Prestamo },
    );

    // Marcar el equipo como no disponible (mantiene estado Solicitado)
    await equipoRepository.update(
      { ID_Num_Inv: body.ID_Num_Inv },
      { Disponible: false },
    );

    const prestamoWithRelations = await prestamoRepository.findOne({
      where: { ID_Prestamo: prestamoSaved.ID_Prestamo },
      relations: [
        "equipos",
        "equipos.marca",
        "equipos.categoria",
        "equipos.estado",
        "equipos.especificaciones",
        "solicitudes",
        "solicitudes.usuario",
        "solicitudes.equipo",
        "solicitudes.equipo.marca",
        "solicitudes.equipo.categoria",
        "solicitudes.equipo.especificaciones",
        "autorizacion",
        "autorizacion.usuario",
        "tieneEstados",
        "tieneEstados.estadoPrestamo",
      ],
    });

    // Enviar notificación por correo
    if (prestamoWithRelations && prestamoWithRelations.solicitudes && prestamoWithRelations.solicitudes.length > 0) {
      const solicitud = prestamoWithRelations.solicitudes[0];
      await enviarEmailSolicitudAprobada(solicitud, prestamoWithRelations);

      // Notificar a todos los administradores activos excepto al principal
      const admins = await userRepository.find({
        where: {
          Cod_TipoUsuario: 1, // Administrador
          Vigente: true,
          Rut: Not("21308770-3") // Administrador Principal
        }
      });

      if (admins.length > 0) {
        await enviarEmailNotificacionAdminAprobacion(admins, solicitud, prestamoWithRelations);
      }
    }

    return [prestamoWithRelations, null];
  } catch (error) {
    console.error("Error al aprobar la solicitud:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Rechazar una solicitud
 */
export async function rechazarSolicitudService(body) {
  try {
    const autorizacionRepository = AppDataSource.getRepository(Autorizacion);
    const prestamoRepository = AppDataSource.getRepository(Prestamo);
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const tieneEstadoRepository = AppDataSource.getRepository(TieneEstado);
    const userRepository = AppDataSource.getRepository(User);

    // Verificar que la solicitud existe
    const solicitudFound = await solicitudRepository.findOne({
      where: { ID_Solicitud: body.ID_Solicitud },
    });

    if (!solicitudFound) {
      return [null, "La solicitud no existe"];
    }

    // Verificar que no tenga préstamo asociado
    if (solicitudFound.ID_Prestamo) {
      return [null, "La solicitud ya fue procesada"];
    }

    // Verificar que el autorizador existe
    const autorizador = await userRepository.findOne({
      where: { Rut: body.Rut_Autorizador },
    });

    if (!autorizador) {
      return [null, "El usuario autorizador no existe"];
    }

    // Crear un préstamo rechazado
    const newPrestamo = prestamoRepository.create({
      ID_Num_Inv: body.ID_Num_Inv,
      Fecha_inicio_prestamo: new Date(),
      Hora_inicio_prestamo: body.Hora_Aut,
    });

    const prestamoSaved = await prestamoRepository.save(newPrestamo);

    // Crear la autorización (rechazo)
    const newAutorizacion = autorizacionRepository.create({
      Rut: body.Rut_Autorizador,
      ID_Prestamo: prestamoSaved.ID_Prestamo,
      Fecha_Aut: body.Fecha_Aut || new Date(),
      Hora_Aut: body.Hora_Aut,
      Obs_Aut: body.Motivo_Rechazo || "Solicitud rechazada",
    });

    await autorizacionRepository.save(newAutorizacion);

    // Crear el estado de rechazo
    const newEstado = tieneEstadoRepository.create({
      ID_Prestamo: prestamoSaved.ID_Prestamo,
      Cod_Estado: 5, // Estado "Rechazado"
      Fecha_Estado: new Date(),
      Hora_Estado: body.Hora_Aut,
      Obs_Estado: body.Motivo_Rechazo || "Solicitud rechazada",
    });

    await tieneEstadoRepository.save(newEstado);

    // Actualizar la solicitud con el ID del préstamo
    await solicitudRepository.update(
      { ID_Solicitud: body.ID_Solicitud },
      { ID_Prestamo: prestamoSaved.ID_Prestamo },
    );

    // Liberar el equipo ya que la solicitud fue rechazada
    const equipoRepository = AppDataSource.getRepository(Equipos);
    const estadoDisponible = await AppDataSource.getRepository(EstadoSchema).findOne({ where: { Descripcion: "Disponible" } });
    
    await equipoRepository.update(
      { ID_Num_Inv: body.ID_Num_Inv },
      { 
        Disponible: true,
        estado: estadoDisponible
      }
    );

    const prestamoWithRelations = await prestamoRepository.findOne({
      where: { ID_Prestamo: prestamoSaved.ID_Prestamo },
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
        "autorizacion",
        "autorizacion.usuario",
        "tieneEstados",
        "tieneEstados.estadoPrestamo",
      ],
    });

    // Enviar notificación por correo
    if (prestamoWithRelations && prestamoWithRelations.solicitudes && prestamoWithRelations.solicitudes.length > 0) {
      await enviarEmailSolicitudRechazada(prestamoWithRelations.solicitudes[0], body.Obs_Aut);
    }

    return [prestamoWithRelations, null];
  } catch (error) {
    console.error("Error al rechazar la solicitud:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todas las autorizaciones
 */
export async function getAutorizacionesService() {
  try {
    const autorizacionRepository = AppDataSource.getRepository(Autorizacion);

    const autorizaciones = await autorizacionRepository.find({
      relations: [
        "usuario",
        "usuario.cargo",
        "usuario.tipoUsuario",
        "prestamo",
        "prestamo.equipos",
        "prestamo.solicitud",
        "prestamo.solicitud.usuario",
      ],
      order: { Fecha_Aut: "DESC" },
    });

    return [autorizaciones || [], null];
  } catch (error) {
    console.error("Error al obtener las autorizaciones:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Función interna para validar si un usuario tiene permiso para aprobar/rechazar una solicitud
 */
async function validarPermisosAutorizacion(solicitud, autorizador) {
  // Es largo plazo solo si tiene fechas y estas son diferentes
  const isLargoPlazo = solicitud.Fecha_inicio_sol && 
                       solicitud.Fecha_termino_sol && 
                       solicitud.Fecha_inicio_sol !== solicitud.Fecha_termino_sol;
  const tipoAutorizador = autorizador.Cod_TipoUsuario; // 1: Admin, 2: Alumno, 3: Profesor
  const cargoAutorizador = autorizador.ID_Cargo; // 1: Dir IECI, 2: Dir ICI

  if (isLargoPlazo) {
    // Si es largo plazo, administradores no pueden autorizar
    if (tipoAutorizador === 1) {
      return "Los administradores solo pueden visualizar solicitudes de largo plazo. La aprobación corresponde a Dirección de Escuela.";
    }

    // Si es una solicitud de un Alumno, validar carrera con el director
    const userRepository = AppDataSource.getRepository(User);
    const solicitante = await userRepository.findOne({
      where: { Rut: solicitud.Rut },
      relations: ["tipoUsuario", "carrera"]
    });

    if (solicitante.tipoUsuario.Descripcion === "Alumno") {
      const carreraSolicitante = solicitante.ID_Carrera; // 1: IECI, 2: ICI
      
      if (carreraSolicitante === 1 && cargoAutorizador !== 1) {
        return "Las solicitudes de alumnos IECI solo pueden ser aceptadas o rechazadas por el Director de Escuela IECI.";
      }
      if (carreraSolicitante === 2 && cargoAutorizador !== 2) {
        return "Las solicitudes de alumnos ICI solo pueden ser aceptadas o rechazadas por el Director de Escuela ICI.";
      }
    } else if (solicitante.tipoUsuario.Descripcion === "Profesor") {
      // Para profesores, cualquiera de los dos directores (Cargo 1 o 2)
      if (cargoAutorizador !== 1 && cargoAutorizador !== 2) {
        return "Las solicitudes de profesores deben ser gestionadas por un Director de Escuela.";
      }
    }
  } else {
    // Para solicitudes diarias, solo administradores pueden autorizar
    if (tipoAutorizador !== 1) {
      return "Solo los administradores pueden gestionar solicitudes diarias.";
    }
  }

  return null;
}
